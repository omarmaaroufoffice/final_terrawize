import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TagManager from 'react-gtm-module';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultsPage from './components/ResultsPage';
import StarBackground from './components/shared/StarBackground';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Google Tag Manager
    TagManager.initialize({
      gtmId: 'GTM-3GJ87GGTNL'
    });
  }, []);

  return (
    <Router>
      <div className="app">
        <StarBackground />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
