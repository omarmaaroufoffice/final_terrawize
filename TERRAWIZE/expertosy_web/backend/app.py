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

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://localhost:8080",
    "https://expertosy.com",
    "https://www.expertosy.com",
    "https://app.expertosy.com",
    "https://api.expertosy.com"
]}}, supports_credentials=True)

@app.route('/')
def root():
    """Root endpoint for health checks"""
    return jsonify({
        "status": "healthy",
        "service": "expertosy-backend",
        "version": "1.0.0"
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "expertosy-backend",
        "version": "1.0.0"
    })

# Create an OpenAI client with a custom HTTP client to avoid proxy issues
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", ""),
    base_url="https://api.openai.com/v1",
    timeout=60.0,
    max_retries=2
)

class ExpertosyRecommendationEngine:
    """
    Web-based recommendation engine with similar functionality to the CLI version
    """
    def __init__(self, search_query: str):
        self.search_query = search_query
        self.results = {}

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
        response = await self._create_chat_completion(
            model="gpt-4o-mini",
            maximum_tokens=500,
            messages=messages
        )
        raw_text = response.choices[0].message.content.strip()
        self.results["factors"] = raw_text.split('*')
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
        
        response = await self._create_chat_completion(
            model="gpt-4o-mini",
            maximum_tokens=1500,
            messages=messages
        )
        
        questionnaire_text = response.choices[0].message.content.strip()
        
        # Log the response for debugging
        logger.info(f"Generated questionnaire: {questionnaire_text}")
        
        return questionnaire_text

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
            
            response = await self._create_chat_completion(
                model="gpt-4o-mini",
                maximum_tokens=500,
                messages=messages
            )
            
            recommendation = response.choices[0].message.content.strip()
            
            # Store the recommendation
            self.results["recommendation"] = recommendation
            return recommendation
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            logger.error(f"Search query: {self.search_query}")
            logger.error(f"User preferences: {user_preferences}")
            raise Exception(f"Failed to generate recommendations: {str(e)}")

    async def _create_chat_completion(self, model: str, maximum_tokens: int, messages: list):
        """Helper method to create a chat completion with error handling"""
        try:
            result = await asyncio.to_thread(
                client.chat.completions.create,
                model=model,
                max_tokens=maximum_tokens,
                messages=messages,
                temperature=0.7
            )
            
            if not result or not result.choices or not result.choices[0].message:
                raise Exception("Invalid response from OpenAI API")
            
            return result
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            logger.error(f"Model: {model}")
            logger.error(f"Messages: {messages}")
            raise Exception(f"OpenAI API error: {str(e)}")

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
            
            response = await self._create_chat_completion(
                model="gpt-4o-mini",
                maximum_tokens=1500,
                messages=messages
            )
            
            questionnaire_text = response.choices[0].message.content.strip()
            
            # Log the response for debugging
            logger.info(f"Generated ranking questionnaire: {questionnaire_text}")
            
            return questionnaire_text
            
        except Exception as e:
            logger.error(f"Error generating ranking questionnaire: {str(e)}")
            raise Exception(f"Failed to generate ranking questionnaire: {str(e)}")

    async def rank_products(self, products: list, ranking_preferences: dict) -> list:
        """Rank the products based on user's answers to the trade-off questions and provide explanations"""
        max_retries = 3
        retry_count = 0
        
        # Parse products to extract names and prices
        parsed_products = []
        for product in products:
            try:
                # Remove the numbering and split by dash
                parts = product.split('. ')[1].split(' - ')
                name = parts[0].strip()
                price = parts[1].strip()
                parsed_products.append({"name": name, "price": price})
            except Exception as e:
                logger.error(f"Error parsing product: {product}")
                logger.error(f"Error details: {str(e)}")
                raise ValueError(f"Invalid product format: {product}")
        
        while retry_count < max_retries:
            try:
                products_text = "\n".join(products)
                preferences_text = "\n".join([
                    f"Question: {question}\nAnswer: {answer}"
                    for question, answer in ranking_preferences.items()
                ])
                
                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are an expert at ranking products based on user preferences about trade-offs. "
                            "Your task is to return a valid JSON array containing ranked products. "
                            "For each product, provide:\n"
                            "1. A clear explanation of why it was ranked in that position\n"
                            "2. 2-3 key advantages of this product\n"
                            "3. For products ranked 2nd and lower, explain specific situations where this product might be a better choice\n\n"
                            "IMPORTANT: Your response must be a valid JSON array. Format each object exactly as shown:\n"
                            "[\n"
                            "  {\n"
                            "    \"name\": \"Product Name\",\n"
                            "    \"price\": \"Price\",\n"
                            "    \"explanation\": \"Why this product is ranked here\",\n"
                            "    \"advantages\": [\"advantage1\", \"advantage2\", \"advantage3\"],\n"
                            "    \"situationalBenefits\": \"When this might be a better choice\"\n"
                            "  }\n"
                            "]\n\n"
                            "Rules:\n"
                            "1. Use ONLY double quotes for strings\n"
                            "2. Include ALL required fields\n"
                            "3. Ensure advantages is ALWAYS an array\n"
                            "4. Do not include any text before or after the JSON array\n"
                            "5. Keep explanations concise but informative"
                        )
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Based on these user preferences about trade-offs:\n\n{preferences_text}\n\n"
                            f"Rank and explain these products:\n\n{products_text}\n\n"
                            "Return ONLY a valid JSON array as specified, with no additional text."
                        )
                    }
                ]
                
                logger.info(f"Attempt {retry_count + 1} of {max_retries}")
                logger.info(f"Parsed products: {parsed_products}")
                logger.info(f"User preferences: {ranking_preferences}")
                
                response = await self._create_chat_completion(
                    model="gpt-4o-mini",
                    maximum_tokens=2000,
                    messages=messages
                )
                
                try:
                    # Parse the response as JSON
                    import json
                    response_text = response.choices[0].message.content.strip()
                    logger.info(f"Raw response from OpenAI: {response_text}")
                    
                    # Remove any potential markdown code block syntax
                    response_text = response_text.replace("```json", "").replace("```", "").strip()
                    
                    # Try to fix common JSON formatting issues
                    response_text = response_text.replace("'", '"')
                    response_text = response_text.replace("\n", " ")
                    
                    # Try to find the JSON array if there's additional text
                    import re
                    json_match = re.search(r'\[.*\]', response_text)
                    if json_match:
                        response_text = json_match.group(0)
                    
                    ranked_products = json.loads(response_text)
                    
                    if not isinstance(ranked_products, list):
                        raise ValueError("Response is not a JSON array")
                    
                    if len(ranked_products) != len(parsed_products):
                        raise ValueError(f"Expected {len(parsed_products)} products, got {len(ranked_products)}")
                    
                    # Validate the structure of each product
                    for i, product in enumerate(ranked_products):
                        if not isinstance(product, dict):
                            raise ValueError(f"Product {i} is not a JSON object")
                        
                        required_fields = ["name", "price", "explanation", "advantages"]
                        for field in required_fields:
                            if field not in product:
                                raise ValueError(f"Product {i} missing required field: {field}")
                            if not isinstance(product[field], (str, list)):
                                raise ValueError(f"Product {i} field {field} has invalid type")
                        
                        if not isinstance(product["advantages"], list):
                            product["advantages"] = [product["advantages"]]
                        
                        # Ensure all products are in the response
                        if not any(p["name"] in product["name"] for p in parsed_products):
                            raise ValueError(f"Product {i} does not match any input products")
                    
                    # Log the successfully parsed and validated products
                    logger.info(f"Successfully ranked products: {json.dumps(ranked_products, indent=2)}")
                    
                    return ranked_products
                    
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Validation error on attempt {retry_count + 1}: {str(e)}")
                    logger.error(f"Response text: {response_text}")
                    retry_count += 1
                    if retry_count >= max_retries:
                        raise Exception(f"Failed to get valid response after {max_retries} attempts: {str(e)}")
                    continue
                
            except Exception as e:
                logger.error(f"Error on attempt {retry_count + 1}: {str(e)}")
                retry_count += 1
                if retry_count >= max_retries:
                    raise Exception(f"Failed to rank products after {max_retries} attempts: {str(e)}")
                continue

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

@app.route('/generate-factors', methods=['POST', 'OPTIONS'])
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

@app.route('/create-questionnaire', methods=['POST', 'OPTIONS'])
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

@app.route('/generate-recommendation', methods=['POST', 'OPTIONS'])
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

@app.route('/generate-ranking-questionnaire', methods=['POST', 'OPTIONS'])
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

@app.route('/rank-products', methods=['POST', 'OPTIONS'])
async def rank_products_route():
    """API endpoint to rank products based on trade-off preferences"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    products = data.get('products')
    ranking_preferences = data.get('ranking_preferences')
    
    if not products or not ranking_preferences:
        return jsonify({"error": "Products list and ranking preferences are required"}), 400
    
    try:
        engine = ExpertosyRecommendationEngine(data.get('search_query', ''))
        ranked_products = await engine.rank_products(products, ranking_preferences)
        return jsonify({"ranked_products": ranked_products})
    except Exception as e:
        logger.error(f"Error ranking products: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/test-ranking', methods=['GET'])
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
    return app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port) 