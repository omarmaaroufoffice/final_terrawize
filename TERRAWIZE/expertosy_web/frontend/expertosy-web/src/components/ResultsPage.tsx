import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RecommendationDetail {
  key: string;
  value: string;
}

interface ParsedRecommendation {
  overview: string;
  details: RecommendationDetail[];
  disadvantages: string[];
}

interface StoredRecommendation {
  searchQuery: string;
  recommendation: string;
  userPreferences: {[key: string]: string};
  timestamp?: string;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [allRecommendations, setAllRecommendations] = useState<StoredRecommendation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const state = location.state as { 
    searchQuery?: string, 
    userPreferences?: {[key: string]: string}, 
    recommendation?: string 
  };

  useEffect(() => {
    // Load all stored recommendations
    try {
      const storedRecs = localStorage.getItem('recommendations');
      if (storedRecs) {
        setAllRecommendations(JSON.parse(storedRecs));
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }

    // Store current recommendation if it exists
    if (state?.recommendation) {
      const newRec = {
        searchQuery: state.searchQuery || 'Unknown',
        recommendation: state.recommendation,
        userPreferences: state.userPreferences || {},
        timestamp: new Date().toISOString()
      };

      setAllRecommendations(prev => {
        const updated = [newRec, ...prev];
        localStorage.setItem('recommendations', JSON.stringify(updated));
        return updated;
      });
    }
  }, [state]);

  if (!state?.recommendation) {
    navigate('/');
    return null;
  }

  const parseRecommendation = (text: string): ParsedRecommendation => {
    const [mainText, disadvantagesText] = text.split('**Potential Limitations:**').map(t => t.trim());
    const lines = mainText.split('\n');
    let overview = '';
    const details: RecommendationDetail[] = [];
    const disadvantages: string[] = disadvantagesText ? 
      disadvantagesText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.substring(2).trim()) : 
      [];
    
    // Find the overview (text before the numbered list)
    const overviewLines = [];
    let i = 0;
    while (i < lines.length && !lines[i].match(/^\d+\./)) {
      if (lines[i].trim()) {
        overviewLines.push(lines[i].trim());
      }
      i++;
    }
    overview = overviewLines.join(' ').replace(/\*\*/g, '');

    // Parse the numbered details
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.match(/^\d+\./)) {
        const [, key, value] = line.match(/\d+\.\s+\*\*([^*]+)\*\*:\s*(.+)/) || [];
        if (key && value) {
          details.push({ key: key.trim(), value: value.trim() });
        }
      }
      i++;
    }

    return { overview, details, disadvantages };
  };

  const { overview, details, disadvantages } = parseRecommendation(state.recommendation);

  const handleStartOver = () => {
    navigate('/');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Your Personalized Recommendation</h1>
        
        {/* Current Recommendation */}
        <div className="recommendation-section">
          <h2>Recommendation for {state.searchQuery}</h2>
          
          <div className="recommendation-overview">
            <p>{overview}</p>
          </div>

          <div className="recommendation-details">
            {details.map((detail, index) => (
              <div key={index} className="detail-item">
                <h3>{detail.key}</h3>
                <p>{detail.value}</p>
              </div>
            ))}
          </div>

          {disadvantages.length > 0 && (
            <div className="disadvantages-section">
              <h3>Potential Limitations</h3>
              <div className="disadvantages-list">
                {disadvantages.map((disadvantage, index) => (
                  <div key={index} className="disadvantage-item">
                    <span className="disadvantage-icon">⚠️</span>
                    <p>{disadvantage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user-preferences-section">
          <h3>Your Preferences</h3>
          <div className="preferences-grid">
            {Object.entries(state.userPreferences || {}).map(([question, answer]) => (
              <div key={question} className="preference-item">
                <strong>{question}:</strong>
                <span>{answer}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="history-section">
          <button 
            className="action-button secondary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show Previous Recommendations'}
          </button>

          {showHistory && (
            <div className="recommendations-history">
              {allRecommendations.slice(1).map((rec, index) => {
                const { overview: pastOverview, details: pastDetails, disadvantages: pastDisadvantages } = parseRecommendation(rec.recommendation);
                return (
                  <div key={index} className="past-recommendation">
                    <div className="past-recommendation-header">
                      <h3>{rec.searchQuery}</h3>
                      <span className="timestamp">
                        {rec.timestamp ? new Date(rec.timestamp).toLocaleString() : 'Unknown time'}
                      </span>
                    </div>
                    <div className="recommendation-overview">
                      <p>{pastOverview}</p>
                    </div>
                    <div className="recommendation-details">
                      {pastDetails.map((detail, detailIndex) => (
                        <div key={detailIndex} className="detail-item">
                          <h4>{detail.key}</h4>
                          <p>{detail.value}</p>
                        </div>
                      ))}
                    </div>
                    {pastDisadvantages.length > 0 && (
                      <div className="disadvantages-section">
                        <h4>Potential Limitations</h4>
                        <div className="disadvantages-list">
                          {pastDisadvantages.map((disadvantage, disIndex) => (
                            <div key={disIndex} className="disadvantage-item">
                              <span className="disadvantage-icon">⚠️</span>
                              <p>{disadvantage}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="actions-section">
          <button 
            className="action-button primary"
            onClick={handleStartOver}
          >
            Start New Recommendation
          </button>
          
          <button 
            className="action-button secondary"
            onClick={() => {
              const content = `Recommendation for ${state.searchQuery}\n\n` +
                `Overview:\n${overview}\n\n` +
                `Details:\n${details.map(d => `${d.key}: ${d.value}`).join('\n')}\n\n` +
                `Your Preferences:\n${Object.entries(state.userPreferences || {})
                  .map(([q, a]) => `${q}: ${a}`)
                  .join('\n')}`;
              
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const fileName = state.searchQuery ? 
                `recommendation_${state.searchQuery.toLowerCase().replace(/\s+/g, '_')}.txt` :
                'recommendation.txt';
              link.download = fileName;
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