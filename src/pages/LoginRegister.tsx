import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, FileText, 
  AlertCircle, ShieldCheck, Zap, BarChart3, Fingerprint
} from "lucide-react";
import { Toast } from "../components/Toast";
import { useUserStore } from "../store/UserStore";
import { useClientStore } from "../store/ClientStore";

export default function LoginRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUserStore();
  const { clients, selectedClientId, loading: loadingClients, error: clientError, loadClients, selectClient } = useClientStore();
  const selectedClient = clients.find(client => client.id === selectedClientId);
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
    <div className="flex min-h-screen bg-white">
      {/* 1. LEFT SIDE - BRANDING & FEATURE SHOWCASE */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#1A233A] p-16 flex-col justify-between relative overflow-hidden">
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
            <h2 className="text-5xl font-black text-white leading-tight mb-8 tracking-tighter">
              Precision <span className="text-indigo-400">Workforce</span> Management.
            </h2>
            
            <div className="grid grid-cols-1 gap-8 mt-12">
              {[
                { title: "Muster Tracking", desc: "GPS-verified real-time attendance.", icon: Zap, color: "text-amber-400" },
                { title: "Automated Payroll", desc: "Error-free NH and OT calculations.", icon: BarChart3, color: "text-emerald-400" },
                { title: "Bank-Grade Security", desc: "Token-based encryption & encrypted avatars.", icon: ShieldCheck, color: "text-indigo-400" }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="mt-1 p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white uppercase tracking-widest">{item.title}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">{item.desc}</p>
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
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#1A233A] rounded-2xl flex items-center justify-center">
              {selectedClient?.theme.logoUrl
                ? <img src={selectedClient.theme.logoUrl} alt="" className="w-7 h-7 object-contain" />
                : <FileText className="w-7 h-7 text-white" />}
            </div>
            <h1 className="font-black text-xl text-gray-900 tracking-tight uppercase">{selectedClient?.theme.appName || 'Syncra'}</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Access Portal</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identify yourself to continue</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="clientId" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Client</label>
              <select
                id="clientId"
                name="clientId"
                value={selectedClientId}
                onChange={(event) => {
                  selectClient(event.target.value);
                  if (errors.clientId) setErrors(previous => ({ ...previous, clientId: "" }));
                }}
                disabled={loadingClients || clients.length === 0}
                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold text-sm text-slate-900 outline-none focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-60"
              >
                <option value="">{loadingClients ? "Loading clients..." : "Choose a client"}</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}{client.domain ? ` (${client.domain})` : ""}</option>
                ))}
              </select>
              {clientError && <p role="alert" className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2">{clientError}</p>}
              {errors.clientId && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2">{errors.clientId}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  name="email"
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!selectedClientId}
                  placeholder="••••••••"
                  className={`w-full pl-14 pr-14 py-4 bg-white border-2 rounded-[1.5rem] font-bold text-sm transition-all outline-none 
                    ${errors.password ? "border-rose-100 bg-rose-50/30 text-rose-600" : "border-slate-100 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 text-slate-900"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
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
              <button className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Reset Key</button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loadingClients || !selectedClientId}
              style={{ backgroundColor: selectedClient?.theme.primaryColor || '#1A233A' }}
              className="w-full text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
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
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}