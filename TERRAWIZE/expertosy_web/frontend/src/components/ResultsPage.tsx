import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ResultsPage.css';

interface ProductExplanation {
  name: string;
  price: string;
  explanation: string;
  advantages: string[];
  situationalBenefits?: string;
  affiliateLink?: string;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  
  const loadingStages = [
    "✨ Analyzing your preferences...",
    "🔍 Evaluating product features...",
    "⚡ Calculating optimal matches...",
    "🎯 Generating detailed explanations...",
    "🌟 Finalizing your personalized recommendations..."
  ];

  useEffect(() => {
    if (isLoading) {
      // Progress through loading stages
      const stageInterval = setInterval(() => {
        setLoadingStage(prev => (prev < loadingStages.length - 1 ? prev + 1 : prev));
      }, 3000);

      // Update time remaining
      const timeInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLoading(false);
            clearInterval(timeInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup
      return () => {
        clearInterval(stageInterval);
        clearInterval(timeInterval);
      };
    }
  }, [isLoading]);

  const state = location.state as { 
    searchQuery: string;
    userPreferences: Record<string, string>;
    recommendation: ProductExplanation[];
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  if (!state || !state.recommendation) {
    return (
      <motion.div 
        className="results-page error"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="error-container">
          <motion.span 
            className="error-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            ⚠️
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            No Results Available
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Please start a new search to get recommendations.
          </motion.p>
          <Link to="/" className="back-button">Start New Search</Link>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div 
        className="results-page loading"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="space-stars" />
        <motion.div 
          className="loading-container"
          variants={containerVariants}
        >
          <motion.div 
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.div>
          <motion.h2
            className="loading-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Crafting Your Perfect Match
          </motion.h2>
          <motion.div
            className="loading-stage"
            key={loadingStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loadingStages[loadingStage]}
          </motion.div>
          <motion.p
            className="time-remaining"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Estimated time remaining: {timeRemaining} seconds
          </motion.p>
          <motion.div 
            className="loading-progress"
            initial={{ width: "0%" }}
            animate={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="results-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="space-stars" />
      <motion.div 
        className="results-container"
        variants={containerVariants}
      >
        <div className="results-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your Perfect {state.searchQuery} Match
          </motion.h1>
          <motion.p 
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ✨ Based on your preferences, here are your stellar matches ✨
          </motion.p>
        </div>

        <div className="recommendations-list">
          {state.recommendation.map((product, index) => (
            <motion.div
              key={index}
              className="product-card"
              custom={index}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="rank-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
              >
                {index + 1}
              </motion.div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price}</p>
                <motion.div 
                  className="product-explanation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  <p className="explanation-text">{product.explanation}</p>
                  <div className="advantages-list">
                    {product.advantages.map((advantage, i) => (
                      <motion.div 
                        key={i}
                        className="advantage-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.8 + (i * 0.1) }}
                      >
                        <span className="advantage-icon">✦</span>
                        {advantage}
                      </motion.div>
                    ))}
                  </div>
                  {product.situationalBenefits && (
                    <motion.div 
                      className="situational-benefits"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 1.2 }}
                    >
                      <span className="benefits-icon">💡</span>
                      {product.situationalBenefits}
                    </motion.div>
                  )}
                  {product.affiliateLink && (
                    <motion.a
                      href={product.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shop-now-button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 1.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🛍️ Shop Now
                    </motion.a>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="action-buttons">
          <Link to="/" className="back-button">Start New Search</Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsPage; 