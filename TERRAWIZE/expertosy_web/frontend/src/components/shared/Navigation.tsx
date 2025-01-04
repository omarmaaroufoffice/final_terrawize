import React from 'react';
import Logo from './Logo';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="nav-bar">
      <div className="nav-container">
        <Logo />
        {/* Rest of the navigation content */}
      </div>
    </nav>
  );
};

export default Navigation; 