import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultsPage from './components/ResultsPage';
import StarBackground from './components/shared/StarBackground';
import './App.css';

// Analytics wrapper component
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title
      });
    }
  }, [location]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <StarBackground />
        <AnalyticsWrapper>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </AnalyticsWrapper>
      </div>
    </Router>
  );
};

export default App;
