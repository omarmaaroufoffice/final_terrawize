import asyncio
from app import ExpertosyRecommendationEngine

async def test_ranking_flow():
    print("\n=== Testing Ranking Questionnaire Flow ===\n")
    
    # Test data
    search_query = 'laptop'
    test_products = [
        "1. Dell XPS 15 - $1,499",
        "2. MacBook Air M1 - $999",
        "3. Lenovo ThinkPad X1 - $1,299",
        "4. HP Spectre x360 - $1,199",
        "5. ASUS ROG Zephyrus - $1,799",
        "6. Acer Swift 3 - $699",
        "7. Microsoft Surface Laptop 4 - $1,299",
        "8. Razer Blade 15 - $1,999",
        "9. LG Gram 17 - $1,599",
        "10. Samsung Galaxy Book Pro - $1,099"
    ]
    
    try:
        # Create engine instance
        engine = ExpertosyRecommendationEngine(search_query)
        
        # Step 1: Generate ranking questionnaire
        print("Step 1: Generating ranking questionnaire...")
        questionnaire = await engine.generate_ranking_questionnaire(test_products)
        print("\nGenerated Questionnaire:")
        print(questionnaire)
        
        # Verify questionnaire format
        questions = questionnaire.split('\n\n')
        print(f"\nNumber of question sections: {len(questions)}")
        
        # Step 2: Simulate user answers
        print("\nStep 2: Simulating user answers...")
        simulated_answers = {
            "What is your primary concern when choosing between these products?": "Price and value for money",
            "How important is portability vs performance for your needs?": "Balance of both portability and performance",
            "Which screen size range do you prefer?": "15-16 inches",
            "What's your preferred balance between battery life and processing power?": "Longer battery life",
            "Which brand ecosystem do you prefer?": "Windows-based systems"
        }
        print("\nSimulated User Answers:")
        for q, a in simulated_answers.items():
            print(f"Q: {q}")
            print(f"A: {a}\n")
        
        # Step 3: Rank products based on answers
        print("Step 3: Ranking products based on answers...")
        ranked_products = await engine.rank_products(test_products, simulated_answers)
        
        print("\nRanked Products:")
        for i, product in enumerate(ranked_products, 1):
            print(f"{i}. {product}")
        
        # Verify results
        print("\nVerification:")
        print(f"- Original products count: {len(test_products)}")
        print(f"- Ranked products count: {len(ranked_products)}")
        print("- Format preserved:", all(p.startswith(str(i+1)) for i, p in enumerate(ranked_products)))
        print("- All products included:", len(ranked_products) == len(test_products))
        
        print("\n=== Test Completed Successfully ===")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        raise e

if __name__ == '__main__':
    asyncio.run(test_ranking_flow()) 