import React from 'react';
import { motion } from 'framer-motion';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const orbitNodes = [
    { delay: 0, rotate: 360, duration: 20 },
    { delay: 2, rotate: -360, duration: 25 },
    { delay: 4, rotate: 360, duration: 30 }
  ];

  return (
    <div className={`logo-container ${size} ${className}`}>
      {/* Central Core */}
      <motion.div 
        className="logo-core"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          boxShadow: [
            '0 0 20px rgba(56, 189, 248, 0.3)',
            '0 0 40px rgba(56, 189, 248, 0.2)',
            '0 0 20px rgba(56, 189, 248, 0.3)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <div className="core-inner" />
      </motion.div>

      {/* Orbiting Nodes */}
      {orbitNodes.map((node, index) => (
        <React.Fragment key={index}>
          {/* Orbit Path */}
          <div className={`orbit-path orbit-${index + 1}`} />
          
          {/* Orbiting Node */}
          <motion.div
            className={`orbit-node node-${index + 1}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              rotate: node.rotate,
              boxShadow: [
                '0 0 10px rgba(56, 189, 248, 0.3)',
                '0 0 20px rgba(56, 189, 248, 0.2)',
                '0 0 10px rgba(56, 189, 248, 0.3)'
              ]
            }}
            transition={{
              opacity: { duration: 1, delay: node.delay },
              rotate: { 
                duration: node.duration,
                repeat: Infinity,
                ease: "linear"
              },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            <div className="node-inner" />
          </motion.div>

          {/* Node Trail */}
          <motion.div
            className={`node-trail trail-${index + 1}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              rotate: node.rotate
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              },
              rotate: { 
                duration: node.duration,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default Logo; 