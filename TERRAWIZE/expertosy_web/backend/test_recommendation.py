import asyncio
from app import ExpertosyRecommendationEngine

async def test_recommendation():
    # Test data
    search_query = 'laptop'
    user_preferences = {
        'Budget Range': 'B. $800-$1200',
        'Primary Use': 'A. General productivity and web browsing',
        'Screen Size': 'C. 15-16 inches',
        'Battery Life': 'B. 8-12 hours',
        'Storage Capacity': 'C. 512GB SSD'
    }
    
    # Create engine instance
    engine = ExpertosyRecommendationEngine(search_query)
    
    # Generate recommendation
    result = await engine.generate_recommendation(user_preferences)
    print('\nTest Result:\n')
    print(result)

if __name__ == '__main__':
    asyncio.run(test_recommendation()) 