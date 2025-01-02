import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ResultsPage.css';

interface ProductExplanation {
  name: string;
  price: string;
  explanation: string;
  advantages: string[];
  why_not_first: string;
  product_caveats: string[];
  situationalBenefits?: string;
  affiliateLink?: string;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const state = location.state as { 
    searchQuery: string;
    userPreferences: Record<string, string>;
    recommendation: ProductExplanation[];
  };

  const loadingStages = [
    "✨ Analyzing your preferences...",
    "🔍 Evaluating product features...",
    "⚡ Calculating optimal matches...",
    "🎯 Generating detailed explanations...",
    "🌟 Finalizing your personalized recommendations..."
  ];

  useEffect(() => {
    if (isLoading) {
      // Progress through loading stages more quickly
      const stageInterval = setInterval(() => {
        setLoadingStage(prev => (prev < loadingStages.length - 1 ? prev + 1 : prev));
      }, 500);

      // Add loading progress animation
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return prev; // Cap at 95% until real results
          return prev + 1;
        });
      }, 100);

      // Cleanup
      return () => {
        clearInterval(stageInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isLoading, loadingStages]);

  // Add a new effect to check if we have results and show them immediately
  useEffect(() => {
    if (state?.recommendation && state.recommendation.length > 0) {
      setLoadingProgress(100); // Complete the progress bar
      setIsLoading(false);
    }
  }, [state?.recommendation]);

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
          <motion.div 
            className="loading-progress"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="results-page">
      <motion.div 
        className="results-container"
        variants={containerVariants}
      >
        <div className="results-header">
          <motion.h1
            className="results-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ✨ Based on your preferences, here are your stellar matches ✨
          </motion.h1>
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
                  
                  <div className="advantages-section">
                    <h4>Key Advantages</h4>
                    <div className="advantages-list">
                      {product.advantages.map((advantage, i) => (
                        <motion.div 
                          key={i}
                          className="advantage-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.8 + (i * 0.1) }}
                        >
                          <span className="advantage-icon">✓</span>
                          {advantage}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {product.why_not_first && (
                    <motion.div 
                      className="why-not-first-section"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 1.2 }}
                    >
                      <h4>Why Not #1 Choice?</h4>
                      <p className="why-not-first-text">{product.why_not_first}</p>
                    </motion.div>
                  )}

                  <motion.div 
                    className="caveats-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 1.4 }}
                  >
                    <h4>Things to Consider</h4>
                    <div className="caveats-list">
                      {product.product_caveats.map((caveat, i) => (
                        <motion.div 
                          key={i}
                          className="caveat-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 1.5 + (i * 0.1) }}
                        >
                          <span className="caveat-icon">!</span>
                          {caveat}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="action-buttons">
          <Link to="/" className="back-button">Start New Search</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage; 