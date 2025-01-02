import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo">
      <div className="logo-content">
        <div className="logo-icon">
          <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Glow */}
            <circle cx="20" cy="20" r="19" stroke="url(#outerGlow)" strokeWidth="0.5" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
            </circle>
            
            {/* Star Paths */}
            <path className="star-outer" d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="url(#starGradient)">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
            </path>
            <path className="star-outer" d="M32.8 7.2L22.8 17.2L20 20L17.2 22.8L7.2 32.8L17.2 22.8L20 20L22.8 17.2L32.8 7.2Z" fill="url(#starGradient)">
              <animate attributeName="opacity" values="0.7;0.9;0.7" dur="3s" repeatCount="indefinite" />
            </path>
            <path className="star-outer" d="M7.2 7.2L17.2 17.2L20 20L22.8 22.8L32.8 32.8L22.8 22.8L20 20L17.2 17.2L7.2 7.2Z" fill="url(#starGradient)">
              <animate attributeName="opacity" values="0.7;0.9;0.7" dur="3s" repeatCount="indefinite" />
            </path>
            
            {/* Inner Star */}
            <path className="star-inner" d="M20 8L22.4721 16.5279L31 20L22.4721 23.4721L20 32L17.5279 23.4721L9 20L17.5279 16.5279L20 8Z" fill="url(#innerStarGradient)">
              <animate attributeName="transform" attributeType="XML" type="rotate" from="0 20 20" to="360 20 20" dur="20s" repeatCount="indefinite" />
            </path>
            
            {/* Center Point */}
            <circle cx="20" cy="20" r="2" fill="url(#centerGlow)">
              <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            
            {/* Sparkles */}
            <g className="sparkles">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <circle
                  key={i}
                  cx={20 + Math.cos(angle * Math.PI / 180) * 15}
                  cy={20 + Math.sin(angle * Math.PI / 180) * 15}
                  r="0.5"
                  fill="#FFD700"
                  opacity="0.6"
                >
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur={`${1.5 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values="0.3;0.6;0.3"
                    dur={`${1.5 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
            
            {/* Gradients */}
            <defs>
              <radialGradient id="outerGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4A90E2" stopOpacity="0" />
              </radialGradient>
              
              <linearGradient id="starGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4A90E2" />
                <stop offset="100%" stopColor="#357ABD" />
              </linearGradient>
              
              <linearGradient id="innerStarGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFC000" />
              </linearGradient>
              
              <radialGradient id="centerGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFC000" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        <div className="logo-text-container">
          <span className="logo-text">Expertosy</span>
          <span className="logo-subtitle">AI Recommendation Engine</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo; 