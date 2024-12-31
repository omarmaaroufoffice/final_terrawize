import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import RankingQuestionnaire from './RankingQuestionnaire';
import './ResultsPage.css';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { 
    searchQuery: string;
    userPreferences: Record<string, string>;
    recommendation: string[];
  };

  if (!state || !state.recommendation) {
    return (
      <div className="results-page error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2>No Results Available</h2>
          <p>Please start a new search to get recommendations.</p>
          <Link to="/" className="back-button">Start New Search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1>Recommended {state.searchQuery}s for You</h1>
          <p className="subtitle">Based on your preferences, here are your top matches:</p>
        </div>

        <div className="recommendations-list">
          {state.recommendation.map((product, index) => {
            const [name, price] = product.split(' - ');
            const productName = name.split('.')[1]?.trim() || name;
            
            return (
              <div key={index} className="product-card">
                <div className="rank-badge">{index + 1}</div>
                <div className="product-details">
                  <h3 className="product-name">{productName}</h3>
                  <p className="product-price">{price}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="action-buttons">
          <Link to="/" className="back-button">Start New Search</Link>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 