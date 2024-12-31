import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RankingQuestionnaire from './RankingQuestionnaire';
import './ResultsPage.css';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showRankingQuestionnaire, setShowRankingQuestionnaire] = useState(false);
  const [rankedProducts, setRankedProducts] = useState<string[]>([]);
  
  const state = location.state as { 
    searchQuery?: string;
    userPreferences?: { [key: string]: string };
    recommendation?: string;
  };

  if (!state?.searchQuery || !state?.recommendation) {
    navigate('/');
    return null;
  }

  const products = state.recommendation.split('\n').filter(line => line.trim());

  const handleStartRanking = () => {
    setShowRankingQuestionnaire(true);
  };

  const handleRankingComplete = (ranked: string[]) => {
    setRankedProducts(ranked);
    setShowRankingQuestionnaire(false);
  };

  const handleStartOver = () => {
    navigate('/');
  };

  if (showRankingQuestionnaire) {
    return (
      <RankingQuestionnaire
        products={products}
        searchQuery={state.searchQuery}
        onRankingComplete={handleRankingComplete}
      />
    );
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Recommended Products for {state.searchQuery}</h1>
        
        <div className="recommendations-list">
          {(rankedProducts.length > 0 ? rankedProducts : products).map((line, index) => {
            if (line.trim()) {
              return (
                <div key={index} className="recommendation-item">
                  {line}
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="actions-section">
          {!rankedProducts.length && (
            <button 
              className="action-button primary"
              onClick={handleStartRanking}
            >
              Help Us Rank These Products
            </button>
          )}
          <button 
            className={`action-button ${rankedProducts.length ? 'primary' : 'secondary'}`}
            onClick={handleStartOver}
          >
            Start New Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 