import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import ClientMgmt from './pages/ClientMgmt';
import Layout from './components/Layout';
import { isTokenValid } from './utils/auth';
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
import { useClientStore } from './store/ClientStore';

const App: React.FC = () => {
  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useUserStore();
  const { clients, selectedClientId, loading: loadingClients, error: clientError, loadClients } = useClientStore();
  const hasToken = !!localStorage.getItem('token');
  const valid = isTokenValid();

  useEffect(() => {
    if (clients.length === 0 && !loadingClients) loadClients().catch(() => undefined);
  }, [clients.length, loadingClients, loadClients]);

  if (loading || loadingClients || clients.length === 0 && !clientError) return <div>Loading...</div>;
  if (clientError) return <div role="alert">{clientError}</div>;

  // If no user/token or token is expired, redirect to login
  if (!selectedClientId || !user || !hasToken || !valid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

  const RequireClientFeature: React.FC<{ feature: string; children: React.ReactElement }> = ({ feature, children }) => {
    const { clients, selectedClientId } = useClientStore();
    const { user } = useUserStore();
    const selectedClient = clients.find(client => client.id === selectedClientId);
    const featureEnabled = feature === 'dashboard' || selectedClient?.menuItems.includes(feature);
    const permittedUser = feature !== 'users' || user?.role?.toLowerCase().includes('admin');

    return featureEnabled && permittedUser
      ? children
      : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<RequireClientFeature feature="dashboard"><Dashboard /></RequireClientFeature>} />
          <Route path="/clients" element={<RequireClientFeature feature="clients"><ClientMgmt /></RequireClientFeature>} />
          <Route path="/invoices" element={<RequireClientFeature feature="invoices"><InvoiceMgmt /></RequireClientFeature>}>
            <Route path="/invoices/create" element={<InvoiceCreate />} />
            <Route path="/invoices/manage" element={<InvoiceList />} />
          </Route>
          <Route path="/quotations" element={<RequireClientFeature feature="quotations"><QuotationMgmt /></RequireClientFeature>}>
            <Route path="/quotations/create" element={<QuotationCreate />} />
            <Route path="/quotations/manage" element={<QuotationList />} />
          </Route>
          <Route path="/employees" element={<RequireClientFeature feature="employees"><EmployeeMgmt /></RequireClientFeature>} />
          <Route path="/reports" element={<RequireClientFeature feature="timesheet"><ReportsAnalytics /></RequireClientFeature>} />
          <Route path="/quicklinks" element={<RequireClientFeature feature="quicklinks"><QuickLinks /></RequireClientFeature>} />
          <Route path="/admin/users" element={<RequireClientFeature feature="users"><UserMgmt /></RequireClientFeature>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
