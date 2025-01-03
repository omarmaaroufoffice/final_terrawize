import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/questionnaire', label: 'Questionnaire' }
  ];

  return (
    <motion.nav 
      className="navigation"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="nav-content">
        <Link to="/" className="nav-logo-link">
          <Logo size="medium" />
          <motion.div 
            className="nav-logo-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="logo-text-main">Expertosy</span>
            <span className="logo-text-sub">AI recommendation service</span>
          </motion.div>
        </Link>

        <motion.div 
          className="nav-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation; 