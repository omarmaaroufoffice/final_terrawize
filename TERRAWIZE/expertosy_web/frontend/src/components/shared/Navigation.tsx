import React from 'react';
import Logo from './Logo';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <Logo />
    </nav>
  );
};

export default Navigation; 