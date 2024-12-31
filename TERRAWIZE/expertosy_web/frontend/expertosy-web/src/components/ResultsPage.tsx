import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as { 
    searchQuery?: string, 
    userPreferences?: {[key: string]: string}, 
    recommendation?: string 
  };

  if (!state?.recommendation) {
    navigate('/');
    return null;
  }

  const handleStartOver = () => {
    navigate('/');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Your Personalized Recommendation</h1>
        
        <div className="recommendation-section">
          <h2>Recommendation for {state.searchQuery}</h2>
          <div className="recommendation-text">
            {state.recommendation}
          </div>
        </div>

        <div className="user-preferences-section">
          <h3>Your Preferences</h3>
          <ul>
            {Object.entries(state.userPreferences || {}).map(([question, answer]) => (
              <li key={question}>
                <strong>{question}:</strong> {answer}
              </li>
            ))}
          </ul>
        </div>

        <div className="actions-section">
          <button 
            className="start-over-button"
            onClick={handleStartOver}
          >
            Start New Recommendation
          </button>
          
          <button 
            className="download-button"
            onClick={() => {
              // Create a text file with recommendation and preferences
              const content = `Recommendation for ${state.searchQuery}\n\n` +
                `Recommendation:\n${state.recommendation}\n\n` +
                `Preferences:\n${Object.entries(state.userPreferences || {})
                  .map(([q, a]) => `${q}: ${a}`)
                  .join('\n')}`;
              
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'expertosy_recommendation.txt';
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download Recommendation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 