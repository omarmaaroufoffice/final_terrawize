import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ResultsPage.css';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { 
    searchQuery: string;
    userPreferences: Record<string, string>;
    recommendation: string[];
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
          {state.recommendation.map((product, index) => {
            const [name, price] = product.split(' - ');
            const productName = name.split('.')[1]?.trim() || name;
            
            return (
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
                  <h3 className="product-name">{productName}</h3>
                  <p className="product-price">{price}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/" className="back-button">Start New Search</Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ResultsPage; 