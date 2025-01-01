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

def create_app():
    """Application factory for Flask"""
    app = Flask(__name__)
    
    CORS(app, resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://expertosy.com",
        "https://www.expertosy.com",
        "https://app.expertosy.com"
    ]}}, supports_credentials=True)

    # Create an OpenAI client with a custom HTTP client to avoid proxy issues
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY", ""),
        base_url="https://api.openai.com/v1",
        timeout=60.0,
        max_retries=2
    )

    # Register routes and configure app
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

    # ... [Keep all other route definitions the same] ...

    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True) 