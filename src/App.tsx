import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginRegister from './pages/LoginRegister';
import TenantSelect from './pages/TenantSelect';
import { useTenantStore } from './store/TenantStore';
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

  const TenantLoginGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const selectedTenantId = useTenantStore(state => state.selectedTenantId);
  const tenants = useTenantStore(state => state.tenants);
  const hasValidTenant = Boolean(selectedTenantId && tenants.some(tenant => tenant.id === selectedTenantId));
  return hasValidTenant ? children : <Navigate to="/select-tenant" replace />;
};

  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useUserStore();
  const selectedTenantId = useTenantStore(state => state.selectedTenantId);
  const hasToken = !!localStorage.getItem('token');
  const valid = isTokenValid();

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1A233A] flex items-center justify-center shadow-xl">
            <svg className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2E8BFF] to-[#14B8A6]" />
          </div>
          <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-[#2E8BFF] to-[#14B8A6] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
  );
  }

  if (!user && (!hasToken || !valid)) {
    return <Navigate to={selectedTenantId ? "/login" : "/select-tenant"} replace />;
  }

  if (!selectedTenantId) return <Navigate to="/select-tenant" replace />;
  return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const loadTenants = useTenantStore(state => state.loadTenants);

  useEffect(() => {
    loadTenants().catch(() => undefined);
  }, [loadTenants]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/select-tenant" element={<TenantSelect />} />
        <Route path="/login" element={<TenantLoginGuard><LoginRegister /></TenantLoginGuard>} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="/clients" element={<ClientMgmt />} />
          <Route path="/invoices" element={<InvoiceMgmt />} />
          <Route path="/invoices/create" element={<InvoiceCreate />} />
          <Route path="/invoices/manage" element={<InvoiceList />} />
          <Route path="/quotations" element={<QuotationMgmt />} />
          <Route path="/quotations/create" element={<QuotationCreate />} />
          <Route path="/quotations/manage" element={<QuotationList />} />
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

