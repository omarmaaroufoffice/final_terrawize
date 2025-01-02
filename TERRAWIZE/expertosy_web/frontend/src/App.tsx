import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  createRoutesFromElements, 
  Route, 
  Outlet,
  type RouterOptions 
} from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultsPage from './components/ResultsPage';
import Logo from './components/shared/Logo';
import './App.css';

const AppLayout: React.FC = () => {
  return (
    <div className="app">
      <Logo />
      <Outlet />
    </div>
  );
};

const routerOptions: RouterOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="questionnaire" element={<QuestionnairePage />} />
      <Route path="results" element={<ResultsPage />} />
    </Route>
  ),
  routerOptions
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
