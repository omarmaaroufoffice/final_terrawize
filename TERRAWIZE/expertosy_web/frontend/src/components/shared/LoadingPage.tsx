import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-container">
      <motion.div 
        className="loading-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo size="large" />
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ marginTop: '24px' }}
        >
          <h2>Loading...</h2>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingPage; 