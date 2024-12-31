import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ParsedRecommendation {
  name: string;
  specs: {
    [key: string]: string;
  };
  price?: string;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as { 
    searchQuery?: string, 
    userPreferences?: {[key: string]: string}, 
    recommendation?: string 
  };

  const parseRecommendations = (text: string): ParsedRecommendation[] => {
    const recommendations: ParsedRecommendation[] = [];
    
    // Split the text into main sections
    const mainSections = text.split(/Your Preferences/i)[0].trim();
    
    // Extract the introduction and recommendations
    const introMatch = mainSections.match(/Based on your preferences,\s*(.*?)(?=\s*(?:###|\d+\.|$))/s);
    const introduction = introMatch ? introMatch[1].trim() : '';
    
    // Find all laptop recommendations
    const laptopMatchesIterator = mainSections.matchAll(/\*\*([\w\s\d()-]+)\*\*\s*-\s*((?:(?!\*\*).)*)/g);
    const laptopMatches = Array.from(laptopMatchesIterator);
    
    if (!laptopMatches.length) {
      // If no specific laptop matches found, create a general recommendation
      recommendations.push({
        name: "General Recommendation",
        specs: {
          "Overview": introduction,
          "Details": mainSections.replace(introduction, '').trim()
        }
      });
      return recommendations;
    }

    // Process each laptop recommendation
    laptopMatches.forEach((match) => {
      const name = match[1].trim();
      const details = match[2].trim();
      
      // Parse specifications
      const specs: { [key: string]: string } = {
        "Overview": introduction
      };
      
      // Extract specifications from the details
      const specLines = details.split(/\n-\s*/);
      specLines.forEach((line: string) => {
        const specMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (specMatch) {
          const [, key, value] = specMatch;
          specs[key.trim()] = value.trim();
        } else if (line.trim()) {
          specs["Details"] = (specs["Details"] || "") + line.trim() + " ";
        }
      });
      
      // Extract price if available
      const priceMatch = details.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?/);
      const price = priceMatch ? priceMatch[0] : undefined;
      
      recommendations.push({ name, specs, price });
    });
    
    return recommendations;
  };

  const parsedRecommendations = useMemo(() => 
    state?.recommendation ? parseRecommendations(state.recommendation) : [], 
    [state?.recommendation]
  );

  const handleStartOver = () => {
    navigate('/');
  };

  // Early return after hooks
  if (!state?.recommendation) {
    return (
      <div className="results-page">
        <div className="results-container">
          <h1>No Recommendation Available</h1>
          <div className="actions-section">
            <button 
              className="action-button start-over"
              onClick={handleStartOver}
            >
              Start New Recommendation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <h1>Your Personalized Recommendation</h1>
        <h2>Recommendation for {state.searchQuery}</h2>
        
        <div className="recommendations-grid">
          {parsedRecommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <h3 className="recommendation-title">{rec.name}</h3>
              <div className="recommendation-specs">
                {Object.entries(rec.specs).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
              {rec.price && (
                <div className="recommendation-price">
                  <span className="price-label">Price:</span>
                  <span className="price-value">{rec.price}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="preferences-section">
          <h3>Your Preferences</h3>
          <div className="preferences-grid">
            {Object.entries(state.userPreferences || {}).map(([question, answer]) => (
              <div key={question} className="preference-item">
                <span className="preference-question">{question}</span>
                <span className="preference-answer">{answer}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="actions-section">
          <button 
            className="action-button start-over"
            onClick={handleStartOver}
          >
            Start New Recommendation
          </button>
          
          <button 
            className="action-button download"
            onClick={() => {
              const content = `Recommendation for ${state.searchQuery}\n\n` +
                parsedRecommendations.map(rec => (
                  `${rec.name}\n` +
                  Object.entries(rec.specs)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n') +
                  (rec.price ? `\nPrice: ${rec.price}` : '') +
                  '\n'
                )).join('\n---\n\n') +
                '\n\nYour Preferences:\n' +
                Object.entries(state.userPreferences || {})
                  .map(([q, a]) => `${q}: ${a}`)
                  .join('\n');
              
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