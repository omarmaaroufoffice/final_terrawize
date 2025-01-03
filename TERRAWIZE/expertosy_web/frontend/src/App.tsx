import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="page-container">
          <div className="content-container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/questionnaire" element={<QuestionnairePage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
