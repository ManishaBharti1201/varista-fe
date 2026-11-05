import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff,
  AlertCircle, Fingerprint, ArrowLeft, CheckCircle2, KeyRound, X
} from "lucide-react";
import { Toast } from "../components/Toast";
import { useUserStore } from "../store/UserStore";
import { useTenantStore } from "../store/TenantStore";
import { useClientStore } from "../store/ClientStore";
import AppBrandIcon from "../components/AppBrandIcon";

export default function LoginRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, requestPasswordReset, confirmPasswordReset } = useUserStore();
  const { clients, selectedClientId } = useClientStore();
  const selectedClient = clients.find(client => client.id === selectedClientId);
  const selectedTenantId = useTenantStore(state => state.selectedTenantId);
  const selectedTenant = useTenantStore(state => state.tenants.find(tenant => tenant.id === selectedTenantId));
  const tenantName = selectedTenant?.name;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'verify'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  
  const navigate = useNavigate();

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

  const openResetDialog = () => {
    setResetEmail(formData.email.trim());
    setVerificationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError('');
    setResetStep('email');
    setResetOpen(true);
  };

  const handleRequestResetCode = async () => {
    const email = resetEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResetError('Enter a valid email address.');
      return;
    }

    setResetSubmitting(true);
    setResetError('');
    try {
      await requestPasswordReset(email);
      setResetEmail(email);
      setResetStep('verify');
      showToast('If an account exists for that email, a verification code has been sent.');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Unable to request a password reset.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleConfirmPasswordReset = async () => {
    if (!/^\d{6}$/.test(verificationCode)) {
      setResetError('Enter the 6-digit verification code from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Your new password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('The passwords do not match.');
      return;
    }

    setResetSubmitting(true);
    setResetError('');
    try {
      await confirmPasswordReset({
        email: resetEmail.trim(),
        verificationCode,
        newPassword,
      });
      setFormData((previous) => ({ ...previous, email: resetEmail.trim(), password: '' }));
      setResetOpen(false);
      showToast('Password reset successfully. Sign in with your new password.');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Unable to reset your password.');
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Login form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <button type="button" onClick={() => navigate('/select-tenant')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:text-indigo-600">
            <ArrowLeft size={14} /> Change workspace
          </button>
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-navy-900 rounded-2xl flex items-center justify-center">
              {selectedClient?.theme.logoUrl
                ? <img src={selectedClient.theme.logoUrl} alt="" className="w-7 h-7 object-contain" />
                : <AppBrandIcon className="w-7 h-7 text-white" />}
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
              <button type="button" onClick={openResetDialog} disabled={!selectedClientId} className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Reset Key</button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-navy-900 hover:bg-navy-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-navy-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
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

      {resetOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-reset-title"
            className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <KeyRound size={20} />
                </div>
                <h2 id="password-reset-title" className="text-2xl font-black tracking-tight text-slate-900">
                  {resetStep === 'email' ? 'Reset your access key' : 'Verify your email'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {resetStep === 'email'
                    ? 'We’ll email a one-time verification code if this address belongs to an account in this workspace.'
                    : `Enter the 6-digit code sent to ${resetEmail}. Codes expire after 10 minutes.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                aria-label="Close password reset"
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {resetStep === 'email' ? (
              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleRequestResetCode(); }}>
                <label htmlFor="reset-email" className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Corporate email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(event) => { setResetEmail(event.target.value); setResetError(''); }}
                    disabled={resetSubmitting}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-60"
                    placeholder="you@company.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full rounded-2xl bg-navy-900 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-navy-950 disabled:opacity-60"
                >
                  {resetSubmitting ? 'Sending code...' : 'Send verification code'}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleConfirmPasswordReset(); }}>
                <div>
                  <label htmlFor="reset-code" className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verification code</label>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(event) => { setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setResetError(''); }}
                    disabled={resetSubmitting}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-4 text-sm font-bold tracking-[0.3em] text-slate-900 outline-none transition focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-60"
                    placeholder="123456"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(event) => { setNewPassword(event.target.value); setResetError(''); }}
                    disabled={resetSubmitting}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-60"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Confirm new password</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(event) => { setConfirmNewPassword(event.target.value); setResetError(''); }}
                    disabled={resetSubmitting}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 disabled:opacity-60"
                    placeholder="Re-enter your new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full rounded-2xl bg-navy-900 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-navy-950 disabled:opacity-60"
                >
                  {resetSubmitting ? 'Updating password...' : 'Verify and reset password'}
                </button>
                <div className="flex items-center justify-between px-1 text-xs font-bold">
                  <button type="button" disabled={resetSubmitting} onClick={() => { setResetStep('email'); setResetError(''); }} className="text-slate-500 hover:text-indigo-600 disabled:opacity-50">
                    Change email
                  </button>
                  <button type="button" disabled={resetSubmitting} onClick={() => void handleRequestResetCode()} className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                    Resend code
                  </button>
                </div>
              </form>
            )}

            {resetError && (
              <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
                <AlertCircle size={14} /> {resetError}
              </p>
            )}
          </section>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}