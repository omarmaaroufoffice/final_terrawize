import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="nav-logo">
      <div className="logo-orbital-system">
        <div className="logo-orbit">
          <div className="logo-orbit-particle particle-1"></div>
          <div className="logo-orbit-particle particle-2"></div>
          <div className="logo-orbit-particle particle-3"></div>
          <div className="logo-orbit-particle particle-4"></div>
        </div>
      </div>
      <div className="logo-core">
        <div className="logo-inner-circle"></div>
        <div className="logo-pulse"></div>
      </div>
      <div className="logo-rings"></div>
      <span className="nav-logo-text">Expertosy</span>
    </Link>
  );
};

export default Logo; 