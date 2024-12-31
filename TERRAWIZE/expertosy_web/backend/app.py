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
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}}, supports_credentials=True)

# Create an OpenAI client with a custom HTTP client to avoid proxy issues
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "")
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
                "content": f"List {number_of_factors} unique and comprehensive factors for evaluating {self.search_query}."
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
                "content": f"You are an expert at creating questionnaires for {self.search_query}. "
                "Generate a comprehensive questionnaire with multiple-choice questions. "
                "Format each question with a clear text and 4 lettered options (A, B, C, D). "
                "Include cost ranges or relevant details for each option when applicable."
            },
            {
                "role": "user",
                "content": f"Create a questionnaire for {self.search_query} using these factors: {', '.join(factors)}. "
                "Ensure each question has 4 options labeled A, B, C, D. "
                "Include cost ranges or specific details for each option. "
                "The questionnaire should help determine the user's precise preferences."
            }
        ]
        
        response = await self._create_chat_completion(
            model="gpt-4o-mini",
            maximum_tokens=1500,
            messages=messages
        )
        
        questionnaire_text = response.choices[0].message.content.strip()
        return questionnaire_text

    async def generate_recommendation(self, user_preferences: dict) -> str:
        """Generate a personalized recommendation based on user preferences"""
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
                        f"You are an expert at recommending {self.search_query}s based on user preferences. "
                        "Format your response in this exact structure:\n"
                        "1. Start with a clear overview paragraph\n"
                        "2. List 4-6 key points, each starting with '**Category**:'\n"
                        "3. End with '**Potential Limitations:**' followed by 3-5 bullet points\n"
                        "Be specific about models and features that match the preferences."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Based on these preferences, recommend a specific {self.search_query} with detailed explanations:\n\n"
                        f"{preference_text}"
                    )
                }
            ]
            
            logger.info(f"Generating recommendation for {self.search_query}")
            logger.debug(f"User preferences: {preference_text}")
            
            response = await self._create_chat_completion(
                model="gpt-4o-mini",
                maximum_tokens=1000,
                messages=messages
            )
            
            recommendation = response.choices[0].message.content.strip()
            
            # Verify the recommendation format
            if "**Potential Limitations:**" not in recommendation:
                logger.warning("Recommendation missing limitations section")
                recommendation += "\n\n**Potential Limitations:**\n- No specific limitations identified"
            
            # Log the raw recommendation for debugging
            logger.debug(f"Raw recommendation: {recommendation}")
            
            # Store the recommendation
            self.results["recommendation"] = recommendation
            return recommendation
            
        except Exception as e:
            logger.error(f"Error generating recommendation: {str(e)}")
            logger.error(f"Search query: {self.search_query}")
            logger.error(f"User preferences: {user_preferences}")
            raise Exception(f"Failed to generate recommendation: {str(e)}")

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

def create_app():
    """Application factory for Flask"""
    return app

if __name__ == '__main__':
    import sys
    port = 5001  # Default port
    for arg in sys.argv:
        if arg.startswith('--port='):
            port = int(arg.split('=')[1])
    
    app.run(debug=True, port=port) 