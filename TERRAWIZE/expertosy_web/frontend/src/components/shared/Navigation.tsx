import React from 'react';
import Logo from './Logo';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="nav-header">
      <div className="nav-content">
        <Logo />
      </div>
    </nav>
  );
};

export default Navigation; 