import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  createRoutesFromElements, 
  Route, 
  Outlet
} from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultsPage from './components/ResultsPage';
import Navigation from './components/shared/Navigation';
import './App.css';

const AppLayout: React.FC = () => {
  return (
    <div className="app">
      <Navigation />
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="questionnaire" element={<QuestionnairePage />} />
      <Route path="results" element={<ResultsPage />} />
    </Route>
  )
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
