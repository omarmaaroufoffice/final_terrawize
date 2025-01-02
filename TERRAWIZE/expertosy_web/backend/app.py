import os
import re
import json
import logging
import asyncio
import openpyxl
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from openai import OpenAI
import traceback
import httpx
from asgiref.wsgi import WsgiToAsgi
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse, Response
from contextlib import asynccontextmanager
from typing import List

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app):
    """Lifespan context for the application"""
    logger.info("Starting up application...")
    yield
    logger.info("Shutting down application...")

# Create Flask app
flask_app = Flask(__name__)

# Configure CORS properly
CORS(flask_app, 
     resources={r"/*": {
         "origins": [
             "http://localhost:3000",
             "http://localhost:8080",
             "https://expertosy.com",
             "https://www.expertosy.com",
             "https://app.expertosy.com",
             "https://api.expertosy.com"
         ],
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
         "supports_credentials": True,
         "expose_headers": ["Content-Range", "X-Content-Range"]
     }},
     supports_credentials=True)

# Create FastAPI app with lifespan support
fastapi_app = FastAPI(lifespan=lifespan)

# Convert Flask app to ASGI
wsgi_app = WsgiToAsgi(flask_app)

# Mount Flask app under FastAPI
@fastapi_app.middleware("http")
async def dispatch_flask(request: Request, call_next):
    path = request.url.path
    if path.startswith("/docs") or path.startswith("/openapi"):
        return await call_next(request)
    
    try:
        # Add CORS headers to all responses
        if request.method == "OPTIONS":
            return JSONResponse(
                content={},
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "https://expertosy.com"),
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Access-Control-Allow-Credentials",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",
                }
            )
        
        # Handle health check endpoint directly in FastAPI
        if path == "/health":
            return JSONResponse(
                content={
                    "status": "healthy",
                    "service": "expertosy-backend",
                    "version": "1.0.0"
                },
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "https://expertosy.com"),
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # For all other routes, use the Flask app
        scope = request.scope
        scope["type"] = "http"
        
        # Create a response buffer
        response_body = []
        response_headers = []
        response_status = [200]
        response_started = [False]
        
        async def receive():
            body = await request.body()
            return {
                "type": "http.request",
                "body": body,
                "more_body": False
            }
        
        async def send(message):
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started[0] = True
                response_status[0] = message["status"]
                response_headers.extend(message.get("headers", []))
            elif message["type"] == "http.response.body":
                if not response_started[0]:
                    response_status[0] = 200
                body = message.get("body", b"")
                if isinstance(body, str):
                    body = body.encode('utf-8')
                elif isinstance(body, dict):
                    body = json.dumps(body).encode('utf-8')
                elif isinstance(body, bytes):
                    pass
                else:
                    body = str(body).encode('utf-8')
                response_body.append(body)
        
        await wsgi_app(scope, receive, send)
        
        # Combine all response parts
        body = b"".join(response_body)
        
        # Try to decode JSON responses
        content_type = None
        for key, value in response_headers:
            if key.lower() == b'content-type':
                content_type = value.decode('utf-8')
                break
        
        if content_type and 'application/json' in content_type:
            try:
                decoded_body = body.decode('utf-8')
                if decoded_body:
                    body = json.loads(decoded_body)
                    return JSONResponse(
                        content=body,
                        status_code=response_status[0],
                        headers={
                            "Access-Control-Allow-Origin": request.headers.get("origin", "https://expertosy.com"),
                            "Access-Control-Allow-Credentials": "true"
                        }
                    )
            except Exception as e:
                logger.error(f"Error decoding JSON response: {e}")
                pass
        
        # Add CORS headers to the response headers
        response_headers.extend([
            (b"Access-Control-Allow-Origin", request.headers.get("origin", "https://expertosy.com").encode()),
            (b"Access-Control-Allow-Credentials", b"true")
        ])
        
        return Response(
            content=body,
            status_code=response_status[0],
            headers=dict(response_headers),
            media_type=content_type
        )
        
    except Exception as e:
        logger.error(f"Error in dispatch_flask: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "https://expertosy.com"),
                "Access-Control-Allow-Credentials": "true"
            }
        )

# Use the FastAPI app as our main ASGI application
asgi_app = fastapi_app

@flask_app.route('/')
def root():
    """Root endpoint for health checks"""
    return jsonify({
        "status": "healthy",
        "service": "expertosy-backend",
        "version": "1.0.0"
    })

@flask_app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "expertosy-backend",
        "version": "1.0.0"
    })

# Create an OpenAI client with a custom HTTP client to avoid proxy issues
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY", ""),
    base_url="https://api.deepseek.com",
    timeout=60.0,
    max_retries=2
)

class ExpertosyRecommendationEngine:
    """
    Web-based recommendation engine with similar functionality to the CLI version
    """
    def __init__(self, search_query: str = None):
        """Initialize the recommendation engine."""
        self.search_query = search_query
        self.results = {}
        self.openai_client = OpenAI(
            api_key=os.getenv("DEEPSEEK_API_KEY", ""),
            base_url="https://api.deepseek.com"
        )
        
    async def _get_completion(self, messages: List[dict]) -> str:
        """Get completion from OpenAI API."""
        try:
            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="deepseek-chat",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"Error getting completion: {str(e)}")
            raise

    async def generate_factors(self, number_of_factors: int = 10) -> list:
        """Generate comprehensive factors for evaluating the item"""
        messages = [
            {
                "role": "system",
                "content": f"You are an expert at analyzing {self.search_query}."
            },
            {
                "role": "user",
                "content": f"List {number_of_factors} unique and comprehensive factors for evaluating for what is most important to the user when choosing a {self.search_query}."
                "Focus on the key differences between the different {self.search_query} and create factors that will help determine the best match for the user."
                "Its basically the facotrs that you would think about when choosing a {self.search_query}."
                "The factors should be in the form of a question that the user would ask themselves when choosing a {self.search_query}."
                "When considering the factors, think about the trade-offs between the different {self.search_query} and create factors that will help determine the best match for the user."
            },  
            {
                "role": "assistant",
                "content": "Provide factors separated by '*', without numbering or additional text."
            }
        ]
        response = await self._get_completion(messages)
        self.results["factors"] = response.split('*')
        return self.results["factors"]

    async def create_questionnaire(self, factors: list) -> str:
        """Create a structured questionnaire based on given factors"""
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are an expert at creating questionnaires for {self.search_query}. "
                    "Generate many questions for a questionnaire with multiple-choice questions. "
                    "Format each question with a clear text and 4 lettered options (A, B, C, D). "
                    "Include cost ranges or relevant details for each option when applicable.\n\n"
                    "Format requirements:\n"
                    "1. Number each question as '1.', '2.'\n"
                    "2. Each question should be clear and direct\n"
                    "3. Format options exactly as 'A)', 'B)', 'C)', 'D)'\n"
                    "4. Each option should be on a new line\n"
                    "5. Do not include any additional text or formatting\n\n"
                    "Example format:\n"
                    "1. What is your preferred price range?\n"
                    "A) $0-$500\n"
                    "B) $501-$1000\n"
                    "C) $1001-$1500\n"
                    "D) $1501 or more\n\n"
                    "2. What is your primary use case?\n"
                    "A) Personal use\n"
                    "B) Professional work\n"
                    "C) Gaming\n"
                    "D) Content creation"
                )
            },
            {
                "role": "user",
                "content": (
                    f"Create a questionnaire for {self.search_query} using these factors: {', '.join(factors)}. "
                    "Follow the exact format shown in the example. "
                    "Ensure each question has 4 options labeled A), B), C), D). "
                    "Include cost ranges or specific details for each option. "
                    "The questionnaire should help determine the user's precise preferences."
                )
            }
        ]
        
        response = await self._get_completion(messages)
        
        # Log the response for debugging
        logger.info(f"Generated questionnaire: {response}")
        
        return response

    async def generate_recommendation(self, user_preferences: dict) -> str:
        """Generate 2 product names and prices based on user preferences"""
        try:
            preference_text = (
                f"I am looking for a {self.search_query} with the following preferences:\n"
                + "\n".join([
                    f"- {factor_text}: {answer_text}"
                    for factor_text, answer_text in user_preferences.items()
                ])
            )
            
            messages = [
                {
                    "role": "system",
                    "content": (
                        f"Based on all the user's answers, recommend by name and price only 10 {self.search_query}s "
                        "that would most likely fit this profile. Format each line as:\n"
                        "1. [Product Name] - $[Price]\n"
                        "2. [Product Name] - $[Price]\n"
                        "... and so on until 2.\n"
                        "ONLY include the name and price. NO descriptions or additional details."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Based on these preferences, list 20 {self.search_query}s with ONLY their names and prices:\n\n"
                        f"{preference_text}"
                    )
                }
            ]
            
            logger.info(f"Generating 10 product recommendations for {self.search_query}")
            logger.debug(f"User preferences: {preference_text}")
            
            response = await self._get_completion(messages)
            
            # Store the recommendation
            self.results["recommendation"] = response
            return response
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            logger.error(f"Search query: {self.search_query}")
            logger.error(f"User preferences: {user_preferences}")
            raise Exception(f"Failed to generate recommendations: {str(e)}")

    async def generate_ranking_questionnaire(self, products: list, previous_questions: list = None) -> str:
        """Generate a questionnaire to rank products based on trade-offs"""
        try:
            products_text = "\n".join(products)
            previous_questions_text = ""
            
            if previous_questions:
                previous_questions_text = "\n\nPreviously asked questions (DO NOT duplicate these):\n" + "\n".join(
                    [f"- {q}" for q in previous_questions]
                )
            
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert at creating questionnaires that help rank products based on trade-offs. "
                        "Create multiple-choice questions that help understand user preferences regarding the key differences between these products.\n\n"
                        "Format requirements:\n"
                        "1. Number each question as '1.', '2.', etc.\n"
                        "2. Each question MUST end with a question mark (?)\n"
                        "3. Format options exactly as 'A)', 'B)', 'C)', 'D)'\n"
                        "4. Focus on comparing price vs features, performance vs portability, etc.\n"
                        "5. Make questions that help distinguish between the products' advantages and disadvantages.\n"
                        "6. DO NOT duplicate any questions that were previously asked.\n\n"
                        "Example format:\n"
                        "1. What is your primary concern when choosing between these products?\n"
                        "A) Price and value for money\n"
                        "B) Performance and speed\n"
                        "C) Build quality and durability\n"
                        "D) Brand reputation and support"
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Create a questionnaire to help rank these products based on their trade-offs:\n\n{products_text}\n"
                        f"{previous_questions_text}\n\n"
                        "Focus on the key differences between these specific products and create questions that will help determine the best match for the user. "
                        "When wording the questions think about specific things that would rule out some of the products. "
                        "IMPORTANT: Do not duplicate any of the previously asked questions or ask about the same topics in a different way."
                    )
                }
            ]
            
            response = await self._get_completion(messages)
            
            # Log the response for debugging
            logger.info(f"Generated ranking questionnaire: {response}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating ranking questionnaire: {str(e)}")
            raise Exception(f"Failed to generate ranking questionnaire: {str(e)}")

    async def rank_products(self, products: List[str], ranking_preferences: dict) -> List[dict]:
        """Rank the products based on user preferences."""
        try:
            logging.info("Ranking products based on preferences")
            
            # Format the products and preferences for the prompt
            products_text = "\n".join(products)
            preferences_text = "\n".join([f"{k}: {v}" for k, v in ranking_preferences.items()])
            
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a product ranking expert. Analyze the given products and user preferences, "
                        "then return a JSON array of ranked products. Each product should include: name, price, "
                        "explanation (why it's ranked here), advantages (array of key benefits), "
                        "why_not_first (for products not ranked first, explain why they didn't get the top spot), "
                        "and product_caveats (array of potential drawbacks or things to consider). "
                        "Format the response as valid JSON. Do not include any markdown formatting or additional text."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Products to rank:\n{products_text}\n\n"
                        f"User Preferences:\n{preferences_text}\n\n"
                        "Please rank these products and provide a JSON response in this exact format:\n"
                        '{"ranked_products": [\n'
                        '  {\n'
                        '    "name": "Product Name",\n'
                        '    "price": "$1234",\n'
                        '    "explanation": "Why this product is ranked here",\n'
                        '    "advantages": ["benefit 1", "benefit 2"],\n'
                        '    "why_not_first": "Only for non-first ranked products, explain why not #1",\n'
                        '    "product_caveats": ["caveat 1", "caveat 2"]\n'
                        '  }\n'
                        ']}'
                    )
                }
            ]
            
            response = await self._get_completion(messages)
            
            response_text = response.replace('```json', '').replace('```', '').strip()
            
            # Clean and parse the response
            try:
                # Remove any markdown formatting
                clean_response = response_text.replace('```json', '').replace('```', '').strip()
                
                # Parse the JSON response
                result = json.loads(clean_response)
                
                if not isinstance(result, dict) or 'ranked_products' not in result:
                    raise ValueError("Invalid response format")
                    
                ranked_products = result['ranked_products']
                
                # Validate the structure of each product
                for product in ranked_products:
                    required_fields = ['name', 'price', 'explanation', 'advantages', 'product_caveats']
                    if not all(field in product for field in required_fields):
                        raise ValueError(f"Missing required fields in product: {product}")
                    if not isinstance(product['advantages'], list):
                        raise ValueError(f"Advantages must be an array for product: {product}")
                    if not isinstance(product['product_caveats'], list):
                        raise ValueError(f"Product caveats must be an array for product: {product}")
                    # Add empty why_not_first for first product
                    if ranked_products.index(product) == 0:
                        product['why_not_first'] = ""
                    elif 'why_not_first' not in product:
                        raise ValueError(f"Missing why_not_first for non-first product: {product}")
                
                return ranked_products
                
            except json.JSONDecodeError as e:
                logging.error(f"Failed to parse JSON response: {str(e)}")
                logging.error(f"Response was: {response_text}")
                raise ValueError("Failed to parse ranking response")
                
        except Exception as e:
            logging.error(f"Error in rank_products: {str(e)}")
            raise

def get_affiliate_link(product_name):
    """Get affiliate link for a product if available."""
    # This is a placeholder function. You should implement your own affiliate link logic here.
    # For example, you could:
    # 1. Query your affiliate network's API
    # 2. Look up in a database of affiliate links
    # 3. Generate dynamic affiliate links based on product names
    # Return None if no affiliate link is available
    return None

def rank_products(products, user_preferences):
    try:
        # ... existing code ...

        # Parse the response and add affiliate links
        ranked_products = []
        for product in parsed_response:
            product_data = {
                "name": product["name"],
                "price": product["price"],
                "explanation": product["explanation"],
                "advantages": product["advantages"],
                "situationalBenefits": product.get("situationalBenefits")
            }
            
            # Try to get an affiliate link for the product
            affiliate_link = get_affiliate_link(product["name"])
            if affiliate_link:
                product_data["affiliateLink"] = affiliate_link
            
            ranked_products.append(product_data)

        return jsonify({"success": True, "ranked_products": ranked_products})

    except Exception as e:
        print(f"Error in rank_products: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@flask_app.route('/generate-factors', methods=['POST', 'OPTIONS'])
async def generate_factors_route():
    """API endpoint to generate factors for a given search query"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    search_query = data.get('search_query')
    
    if not search_query:
        return jsonify({"error": "Search query is required"}), 400
    
    try:
        engine = ExpertosyRecommendationEngine(search_query)
        factors = await engine.generate_factors()
        return jsonify({"factors": factors})
    except Exception as e:
        logger.error(f"Error generating factors: {e}")
        return jsonify({"error": str(e)}), 500

@flask_app.route('/create-questionnaire', methods=['POST', 'OPTIONS'])
async def create_questionnaire_route():
    """API endpoint to create a questionnaire based on factors"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    logger.info(f"Received create_questionnaire request: {data}")

    search_query = data.get('search_query')
    factors = data.get('factors')
    
    if not search_query or not factors:
        logger.error("Missing search query or factors")
        return jsonify({"error": "Search query and factors are required"}), 400
    
    try:
        engine = ExpertosyRecommendationEngine(search_query)
        questionnaire = await engine.create_questionnaire(factors)
        logger.info(f"Generated questionnaire: {questionnaire}")
        return jsonify({"questionnaire": questionnaire})
    except Exception as e:
        logger.error(f"Error creating questionnaire: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@flask_app.route('/generate-recommendation', methods=['POST', 'OPTIONS'])
async def generate_recommendation_route():
    """API endpoint to generate a recommendation based on user preferences"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    search_query = data.get('search_query')
    user_preferences = data.get('user_preferences')
    
    if not search_query or not user_preferences:
        return jsonify({"error": "Search query and user preferences are required"}), 400
    
    try:
        engine = ExpertosyRecommendationEngine(search_query)
        recommendation = await engine.generate_recommendation(user_preferences)
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        logger.error(f"Error generating recommendation: {e}")
        return jsonify({"error": str(e)}), 500

@flask_app.route('/generate-ranking-questionnaire', methods=['POST', 'OPTIONS'])
async def generate_ranking_questionnaire_route():
    """API endpoint to generate a questionnaire for ranking products"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    products = data.get('products')
    previous_questions = data.get('previous_questions', [])
    
    if not products:
        return jsonify({"error": "Products list is required"}), 400
    
    try:
        engine = ExpertosyRecommendationEngine(data.get('search_query', ''))
        questionnaire = await engine.generate_ranking_questionnaire(products, previous_questions)
        return jsonify({"questionnaire": questionnaire})
    except Exception as e:
        logger.error(f"Error generating ranking questionnaire: {e}")
        return jsonify({"error": str(e)}), 500

@flask_app.route('/rank-products', methods=['POST'])
async def rank_products():
    try:
        data = request.get_json()
        if not data or 'products' not in data or 'ranking_preferences' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        products = data['products']
        ranking_preferences = data['ranking_preferences']

        if not products or not ranking_preferences:
            return jsonify({"error": "Products and ranking preferences cannot be empty"}), 400

        engine = ExpertosyRecommendationEngine()
        ranked_products = await engine.rank_products(products, ranking_preferences)
        
        if not ranked_products:
            return jsonify({"error": "Failed to rank products"}), 500
            
        return jsonify({"ranked_products": ranked_products})
        
    except Exception as e:
        logging.error(f"Error in rank_products endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@flask_app.route('/test-ranking', methods=['GET'])
async def test_ranking_route():
    """Test endpoint to verify ranking functionality with multiple scenarios"""
    try:
        test_cases = [
            {
                "products": [
                    "1. Honda Odyssey - $35,000",
                    "2. Toyota Sienna - $36,000"
                ],
                "preferences": {
                    "What is your primary concern when choosing between these minivans?": "A) Fuel efficiency and environmental impact",
                    "Which feature matters most to you in a family vehicle?": "B) Advanced safety features and driver assistance"
                }
            },
            {
                "products": [
                    "1. MacBook Pro 14\" - $1,999",
                    "2. Dell XPS 15 - $1,799",
                    "3. Lenovo ThinkPad X1 - $1,699"
                ],
                "preferences": {
                    "What's your main priority when choosing a laptop?": "A) Performance and processing power",
                    "How important is battery life vs weight/portability?": "C) Balance of both is essential"
                }
            },
            {
                "products": [
                    "1. iPhone 15 Pro - $999",
                    "2. Samsung Galaxy S23 - $899",
                    "3. Google Pixel 8 - $799",
                    "4. OnePlus 11 - $699"
                ],
                "preferences": {
                    "What's most important to you in a smartphone?": "B) Camera quality and photo features",
                    "How do you prioritize software updates and ecosystem?": "A) Regular updates and ecosystem integration"
                }
            }
        ]

        results = []
        engine = ExpertosyRecommendationEngine("Test Products")

        for i, test_case in enumerate(test_cases, 1):
            logger.info(f"\n=== Running Test Case {i} ===")
            logger.info(f"Products: {test_case['products']}")
            logger.info(f"Preferences: {test_case['preferences']}")

            try:
                ranked_products = await engine.rank_products(
                    test_case["products"],
                    test_case["preferences"]
                )
                results.append({
                    "test_case": i,
                    "status": "success",
                    "products": test_case["products"],
                    "preferences": test_case["preferences"],
                    "ranked_results": ranked_products
                })
                logger.info(f"Test Case {i} Successful")
            except Exception as e:
                results.append({
                    "test_case": i,
                    "status": "failed",
                    "error": str(e),
                    "products": test_case["products"],
                    "preferences": test_case["preferences"]
                })
                logger.error(f"Test Case {i} Failed: {str(e)}")

        # Calculate success rate
        success_count = sum(1 for r in results if r["status"] == "success")
        success_rate = (success_count / len(test_cases)) * 100

        return jsonify({
            "total_tests": len(test_cases),
            "successful_tests": success_count,
            "success_rate": f"{success_rate:.2f}%",
            "detailed_results": results
        })

    except Exception as e:
        logger.error(f"Error in test suite: {str(e)}")
        return jsonify({
            "error": "Test suite failed",
            "message": str(e)
        }), 500

def create_app():
    """Application factory for Flask"""
    return flask_app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    flask_app.run(host='0.0.0.0', port=port) 