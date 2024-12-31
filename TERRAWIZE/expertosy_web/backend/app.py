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
CORS(app)  # Enable CORS for all routes

# Create an OpenAI client with a custom HTTP client to avoid proxy issues
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=httpx.Client()
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
        """Create a comprehensive questionnaire with cost breakdown"""
        cost_breakdown_text = """
        Comprehensive cost breakdown for various product factors:
        
        ### 1. Capacity
        - Option A: Basic - Cost: $20-$30
        - Option B: Mid-range - Cost: $30-$50
        - Option C: High-end - Cost: $50-$80
        - Option D: Premium - Cost: $80-$120

        ### 2. Performance
        - Option A: Entry-level - Cost: $10-$20
        - Option B: Standard - Cost: $20-$40
        - Option C: Advanced - Cost: $40-$70
        - Option D: Professional - Cost: $70-$120
        """

        messages = [
            {
                "role": "system",
                "content": f"You are an expert at creating questionnaires for {self.search_query}."
            },
            {
                "role": "user",
                "content": (
                    f"{cost_breakdown_text}\n\n"
                    f"Create a questionnaire for {self.search_query} using these factors: {', '.join(factors)}. "
                    "Include multiple-choice options with cost ranges."
                )
            }
        ]

        response = await self._create_chat_completion(
            model="gpt-4o-mini",
            maximum_tokens=1500,
            messages=messages
        )
        questionnaire_text = response.choices[0].message.content.strip()
        self.results["questionnaire"] = questionnaire_text
        return questionnaire_text

    async def generate_recommendation(self, user_preferences: dict) -> str:
        """Generate a personalized recommendation based on user preferences"""
        preference_text = (
            f"I am looking for a {self.search_query} with the following preferences:\n"
            + "\n".join([
                f"{factor_text}: {answer_text}"
                for factor_text, answer_text in user_preferences.items()
            ])
        )
        messages = [
            {
                "role": "system",
                "content": f"You are an expert at recommending {self.search_query} based on user preferences."
            },
            {
                "role": "user",
                "content": preference_text
            }
        ]
        response = await self._create_chat_completion(
            model="gpt-4o-mini",
            maximum_tokens=1000,
            messages=messages
        )
        recommendation = response.choices[0].message.content.strip()
        self.results["recommendation"] = recommendation
        return recommendation

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
            return result
        except Exception as exception_data:
            logger.error(f"OpenAI API error: {exception_data}")
            raise

@app.route('/generate-factors', methods=['POST'])
async def generate_factors_route():
    """API endpoint to generate factors for a given search query"""
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

@app.route('/create-questionnaire', methods=['POST'])
async def create_questionnaire_route():
    """API endpoint to create a questionnaire based on factors"""
    data = request.json
    search_query = data.get('search_query')
    factors = data.get('factors')
    
    if not search_query or not factors:
        return jsonify({"error": "Search query and factors are required"}), 400
    
    try:
        engine = ExpertosyRecommendationEngine(search_query)
        questionnaire = await engine.create_questionnaire(factors)
        return jsonify({"questionnaire": questionnaire})
    except Exception as e:
        logger.error(f"Error creating questionnaire: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-recommendation', methods=['POST'])
async def generate_recommendation_route():
    """API endpoint to generate a recommendation based on user preferences"""
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
    app.run(debug=True, port=5000) 