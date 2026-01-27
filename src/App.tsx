import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import ClientMgmt from './pages/ClientMgmt';
import Layout from './components/Layout';
import { isTokenValid, logout } from './utils/auth';
import InvoiceMgmt from './pages/InvoiceMgmt';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceList from './pages/InvoiceList';

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
        <Route path="/" element={<RequireAuth><Layout/></RequireAuth>}>
          <Route index element={<Dashboard/>} />
          <Route path="clients" element={<ClientMgmt/>} />
          <Route path="invoices" element={<InvoiceMgmt/>}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<InvoiceCreate/>} />
            <Route path="manage" element={<InvoiceList/>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
