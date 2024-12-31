import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultsPage.css';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { 
    searchQuery?: string;
    userPreferences?: { [key: string]: string };
    recommendation?: string;
  };

  if (!state?.searchQuery || !state?.recommendation) {
    navigate('/');
    return null;
  }

  const handleStartOver = () => {
    navigate('/');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Recommended Products for {state.searchQuery}</h1>
        
        <div className="recommendations-list">
          {state.recommendation.split('\n').map((line, index) => {
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
          <button 
            className="action-button primary"
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