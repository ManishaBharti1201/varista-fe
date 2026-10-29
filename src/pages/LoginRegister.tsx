import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, FileText,
  AlertCircle, ShieldCheck, Zap, BarChart3, Fingerprint, ArrowLeft, CheckCircle2
} from "lucide-react";
import { Toast } from "../components/Toast";
import { useUserStore } from "../store/UserStore";
import { useTenantStore } from "../store/TenantStore";

export default function LoginRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUserStore();
  const selectedTenantId = useTenantStore(state => state.selectedTenantId);
  const selectedTenant = useTenantStore(state => state.tenants.find(tenant => tenant.id === selectedTenantId));
  const tenantName = selectedTenant?.name;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadClients().catch(() => undefined);
  }, [loadClients]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedClientId) newErrors.clientId = "Select a client";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const response = await login({ username: formData.email, password: formData.password, clientId: selectedClientId });
      if (!response) {
        showToast('Login failed', 'error');
        setSubmitting(false);
        return;
      }
      navigate('/', { replace: true });
    } catch (error) {
      setSubmitting(false);
      showToast('Invalid credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:flex">
      {/* 1. LEFT SIDE - BRANDING & FEATURE SHOWCASE */}
      <div className="relative hidden overflow-hidden bg-[#1A233A] p-12 lg:flex lg:min-h-screen lg:w-[55%] lg:flex-col lg:justify-between lg:p-16">
        {/* Decorative Abstract Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-20">
            <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-900/40">
              {selectedClient?.theme.logoUrl
                ? <img src={selectedClient.theme.logoUrl} alt="" className="w-8 h-8 object-contain" />
                : <FileText className="w-8 h-8 text-[#1A233A]" />}
            </div>
            <div>
              <h1 className="font-black text-3xl text-white tracking-tight uppercase">{selectedClient?.theme.appName || 'Syncra'}</h1>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Workforce Hub</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-indigo-300">One workspace. Total clarity.</p>
            <h2 className="text-5xl font-black leading-tight tracking-tighter text-white">
              Precision <span className="text-indigo-400">workforce</span> management.
            </h2>
            <p className="mt-6 max-w-lg text-base font-medium leading-7 text-slate-300">
              Keep attendance, payroll, and team operations moving from one secure command center.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-4">
              {[
                { title: "Muster Tracking", desc: "GPS-verified real-time attendance.", icon: Zap, color: "text-amber-400" },
                { title: "Automated Payroll", desc: "Error-free NH and OT calculations.", icon: BarChart3, color: "text-emerald-400" },
                { title: "Bank-Grade Security", desc: "Token-based access for every session.", icon: ShieldCheck, color: "text-indigo-400" }
              ].map((item, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">{item.title}</h3>
                    <p className="mt-1 text-sm font-medium text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
          <span>v3.0.4 Stable Build</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>© 2026 Syncra Systems</span>
        </div>
      </div>

      {/* 2. RIGHT SIDE - LOGIN FORM */}
      <div className="flex flex-1 items-center justify-center bg-[#F8FAFC] px-6 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <button type="button" onClick={() => navigate('/select-tenant')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:text-indigo-600">
            <ArrowLeft size={14} /> Change workspace
          </button>
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#1A233A] rounded-2xl flex items-center justify-center">
              {selectedClient?.theme.logoUrl
                ? <img src={selectedClient.theme.logoUrl} alt="" className="w-7 h-7 object-contain" />
                : <FileText className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h1 className="font-black text-xl text-gray-900 tracking-tight uppercase">Syncra</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-500">Workforce Hub</p>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600">
              <CheckCircle2 size={13} /> Secure workspace
            </div>
            <h2 className="mb-2 text-4xl font-black tracking-tighter text-slate-900">{tenantName}</h2>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Access Portal · Log in to {tenantName}</p>
          </div>

          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="username"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!selectedClientId}
                  placeholder="admin@syncra.hub"
                  className={`w-full pl-14 pr-6 py-4 bg-white border-2 rounded-[1.5rem] font-bold text-sm transition-all outline-none 
                    ${errors.email ? "border-rose-100 bg-rose-50/30 text-rose-600" : "border-slate-100 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 text-slate-900"}`}
                />
              </div>
              {errors.email && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 px-2 mt-1"><AlertCircle size={12}/> {errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!selectedClientId}
                  placeholder="••••••••"
                  className={`w-full pl-14 pr-14 py-4 bg-white border-2 rounded-[1.5rem] font-bold text-sm transition-all outline-none 
                    ${errors.password ? "border-rose-100 bg-rose-50/30 text-rose-600" : "border-slate-100 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 text-slate-900"}`}
                />
                <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer" />
                <span className="ml-3 text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Keep Session</span>
              </label>
              <button type="button" onClick={() => showToast('Please contact your administrator to reset your access key.')} className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Reset Key</button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1A233A] hover:bg-[#252F4A] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  Secure Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}