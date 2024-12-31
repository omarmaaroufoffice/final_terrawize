import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      // Generate factors
      const factorsResponse = await axios.post('http://localhost:5001/generate-factors', {
        search_query: searchQuery
      });

      // Navigate to questionnaire with factors
      navigate('/questionnaire', { 
        state: { 
          searchQuery, 
          factors: factorsResponse.data.factors 
        } 
      });
    } catch (error) {
      console.error('Error generating factors:', error);
      alert('Failed to generate factors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Expertosy Recommendation System</h1>
        <p>Get personalized recommendations for any product or service</p>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="What are you looking to recommend? (e.g., power bank, laptop)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <button 
            onClick={handleSearch} 
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Start Recommendation'}
          </button>
        </div>

        {isLoading && (
          <div className="loading-spinner">
            <p>Analyzing your request...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage; 