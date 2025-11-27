import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import HRMSDashboard from './pages/Dashboard';
import { isTokenValid, logout } from './utils/auth';

const App: React.FC = () => {
  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const ok = isTokenValid();
    if (ok) return children;
    // clear any stale auth and redirect to login
    try { logout(); } catch (e) { /* ignore */ }
    return <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/" element={
          <RequireAuth>
            <HRMSDashboard />
          </RequireAuth>
        } />
      </Routes>
    </Router>
  );
};

export default App;
