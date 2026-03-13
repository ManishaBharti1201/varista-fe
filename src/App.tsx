import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import ClientMgmt from './pages/ClientMgmt';
import Layout from './components/Layout';
import { isTokenValid, logout } from './utils/auth';
import InvoiceMgmt from './pages/InvoiceMgmt';
import InvoiceCreate from './pages/invoice/InvoiceCreate';
import InvoiceList from './pages/invoice/InvoiceList';
import QuickLinks from './pages/QuickLinks';
import QuotationList from './pages/quotation/QuotationList';
import QuotationCreate from './pages/quotation/QuotationCreate';
import QuotationMgmt from './pages/QuotationMgmt';
import EmployeeMgmt from './pages/EmployeeMgmt';
import UserMgmt from './pages/UserMgmt';
import { useUserStore } from './store/UserStore';
import ReportsAnalytics from './pages/AnalyticsReports';

const App: React.FC = () => {

  
  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useUserStore();
  const hasToken = !!localStorage.getItem('token');
  const valid = isTokenValid();

  if (loading) return <div>Loading...</div>;

  // If no user/token or token is expired, redirect to login
  if (!user && (!hasToken || !valid)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="/clients" element={<ClientMgmt />} />
          <Route path="/invoices" element={<InvoiceMgmt />}>
            <Route path="/invoices/create" element={<InvoiceCreate />} />
            <Route path="/invoices/manage" element={<InvoiceList />} />
          </Route>
          <Route path="/quotations" element={<QuotationMgmt />}>
            <Route path="/quotations/create" element={<QuotationCreate />} />
            <Route path="/quotations/manage" element={<QuotationList />} />
          </Route>
          <Route path="/employees" element={<EmployeeMgmt />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/quicklinks" element={<QuickLinks />} />
          <Route path="/admin/users" element={<UserMgmt />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
