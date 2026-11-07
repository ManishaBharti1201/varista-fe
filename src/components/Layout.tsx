import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, LogOut, X, Clock, CheckCircle2, AlertCircle, Info, Headset, Send } from 'lucide-react';
import { logout } from '../utils/auth';
import { useUserStore } from '../store/UserStore';
import { useTenantStore } from '../store/TenantStore';
import { apiRequest } from '../utils/apiClient';
import { endpoints } from '../config/urls';
import { formatTimestamp } from '../utils/dateTime';

interface Notification {
  id: string;
  title?: string;
  description: string;
  status: string;
  type?: 'success' | 'alert' | 'info';
  createDate: string;
}

const getNotifications = (payload: unknown): Notification[] => {
  if (Array.isArray(payload)) return payload as Notification[];

  if (payload && typeof payload === 'object') {
    const response = payload as { notifications?: unknown; data?: unknown };
    if (Array.isArray(response.notifications)) return response.notifications as Notification[];
    if (Array.isArray(response.data)) return response.data as Notification[];
    if (response.data && typeof response.data === 'object' &&
      Array.isArray((response.data as { notifications?: unknown }).notifications)) {
      return (response.data as { notifications: Notification[] }).notifications;
    }
  }

  throw new Error('Notification response did not contain a notification list');
};

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDescription, setSupportDescription] = useState('');

  const { user } = useUserStore();
  const selectedTenantId = useTenantStore(state => state.selectedTenantId);
  const tenants = useTenantStore(state => state.tenants);
  const tenantName = tenants.find(tenant => tenant.id === selectedTenantId)?.name;

  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin User';
  const initials = userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(endpoints.notificationList(), { method: 'GET' });
      if (!response.ok) {
        const errorBody = await response.text();
        let message = errorBody;
        try {
          const parsed = JSON.parse(errorBody) as { message?: unknown; error?: unknown };
          if (typeof parsed.message === 'string') message = parsed.message;
          else if (typeof parsed.error === 'string') message = parsed.error;
        } catch {
          // Keep the response text as the diagnostic message.
        }
        throw new Error(`Unable to load notifications (HTTP ${response.status}): ${message}`);
      }
      const payload: unknown = await response.json();
      setNotifications(getNotifications(payload));
      setNotificationError(null);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setNotificationError(error instanceof Error ? error.message : 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
    try {
      await apiRequest(`${endpoints.notificationList()}/${id}/read`, { method: 'POST' });
    } catch (error) {
      console.error("Failed to sync notification read status", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
    try {
      await apiRequest(`${endpoints.notificationList()}/read-all`, { method: 'POST' });
    } catch (error) {
      console.error("Failed to sync mark-all-read status", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const openSupportForm = () => {
    setSupportError(null);
    setSupportSubmitted(false);
    setSupportSubject('');
    setSupportDescription('');
    setIsSupportOpen(true);
  };

  const submitSupportTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupportSubmitting(true);
    setSupportError(null);
    try {
      const response = await apiRequest(endpoints.supportTicket(), {
        method: 'POST',
        body: JSON.stringify({
          contactName: user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '',
          tenantName: tenantName || 'Unknown workspace',
          subject: supportSubject.trim(),
          description: supportDescription.trim()
        })
      });
      const body = await response.json().catch(() => ({})) as { message?: unknown };
      if (!response.ok) {
        throw new Error(typeof body.message === 'string' ? body.message : 'Unable to submit your support ticket.');
      }
      setSupportSubmitted(true);
    } catch (error) {
      setSupportError(error instanceof Error ? error.message : 'Unable to submit your support ticket.');
    } finally {
      setSupportSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-[60] w-72 shrink-0 transform lg:relative lg:z-0 lg:translate-x-0 transition-transform duration-300 ease-in-out bg-white shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />
      </div>

      {/* GLOBAL BACKDROP */}
      {(isSidebarOpen || isNotifOpen) && (
        <div className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-50 animate-in fade-in duration-300" onClick={() => { setIsSidebarOpen(false); setIsNotifOpen(false); }} />
      )}

      {/* NOTIFICATION SLIDE-OVER */}
      <aside className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isNotifOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-navy-900 text-white rounded-bl-3xl">
                  <div>
                    <h2 className="text-lg font-display font-black tracking-tight uppercase">Activity Feed</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Updates</p>
                      {notifications.some(n => n.status !== 'READ') && (
                        <button onClick={handleMarkAllAsRead} className="text-[9px] font-black text-brand-300 hover:text-white uppercase tracking-widest border-l border-white/10 pl-3 transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setIsNotifOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Feed...</p>
            </div>
          ) : notificationError ? (
            <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-600">
              Notifications unavailable: {notificationError}
            </p>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => notif.status !== 'READ' && handleMarkAsRead(notif.id)}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group ${notif.status === 'READ' ? 'bg-white border-slate-100' : 'bg-brand-50/50 border-brand-100 shadow-sm'}`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : notif.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notif.type === 'success' ? <CheckCircle2 size={16} /> : notif.type === 'alert' ? <AlertCircle size={16} /> : <Info size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors">{notif.title || 'System Notification'}</h4>
                                            {notif.status !== 'READ' && <span className="w-2 h-2 bg-brand-500 rounded-full"></span>}
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{notif.description}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      <Clock size={12} /> {formatTimestamp(notif.createDate)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-sm font-bold text-slate-400 uppercase tracking-widest">Clear Workspace</div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        <header className="h-14 md:h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-3 sm:px-4 md:px-8 flex items-center sticky top-0 z-40">
          <div className="flex-1 flex items-center justify-between">

            {/* Left: Branding/Context (Replaces Search) */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600 transition-all active:scale-90" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="min-w-0 py-1">
                <p className="text-base sm:text-xl md:text-2xl font-display font-black text-navy-900 uppercase tracking-tight truncate">
                  {tenantName || 'Workspace'}
                </p>
                <p className="hidden sm:block mt-0.5 text-[10px] md:text-xs font-medium text-slate-500 truncate">
                  Attendance · Payroll · Workforce operations
                </p>
              </div>
            </div>

            {/* Right: Integrated Action Cluster */}
            <div className="flex items-center bg-white border border-slate-200 p-1 md:p-1.5 rounded-2xl md:rounded-[1.5rem] shadow-sm md:gap-2">

              <button
                type="button"
                onClick={openSupportForm}
                aria-label="Contact technical support"
                title="Technical support"
                className="p-2 md:p-2.5 rounded-xl text-slate-500 transition-all hover:bg-brand-50 hover:text-brand-600"
              >
                <Headset size={18} className="md:hidden" />
                <Headset size={20} className="hidden md:block" />
              </button>
              <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

              {/* Notifications */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2 md:p-2.5 rounded-xl transition-all ${isNotifOpen ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:bg-white hover:text-brand-600 hover:shadow-sm'}`}
              >
                <Bell size={18} className="md:hidden" />
                <Bell size={20} className="hidden md:block" />
              {!isNotifOpen && notifications.some(n => n.status !== 'READ') && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

              {/* Profile Card */}
              <div className="flex items-center gap-3 pl-1.5 pr-2 md:pl-2 md:pr-4 group cursor-pointer border-r border-slate-200 md:mr-2">
                <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-xs font-black tracking-tighter">{initials}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[11px] font-black text-slate-900 leading-none">{userName}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{user?.role || 'Admin'}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 md:p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2"
                title="Secure Logout"
              >
                <LogOut size={18} className="md:hidden" />
                <LogOut size={20} className="hidden md:block" />
                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Exit</span>
              </button>
            </div>
          </div>
        </header>

        {isSupportOpen && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm"
            onMouseDown={event => {
              if (event.target === event.currentTarget && !supportSubmitting) setIsSupportOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-dialog-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2 id="support-dialog-title" className="text-xl font-black text-navy-900">Technical support</h2>
                  <p className="mt-1 text-sm text-slate-500">Describe the issue and our team will follow up by email.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close support form"
                  onClick={() => setIsSupportOpen(false)}
                  disabled={supportSubmitting}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {supportSubmitted ? (
                <div className="p-6 sm:p-8">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800" role="status">
                    Your support request was submitted successfully. The support team will contact you at {user?.email || 'your account email'}.
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSupportOpen(false)}
                    className="mt-5 w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-bold text-white hover:bg-navy-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submitSupportTicket} className="space-y-4 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-bold text-slate-600">
                      Your name
                      <input
                        value={user ? `${user.firstName} ${user.lastName}`.trim() || user.email : ''}
                        readOnly
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                      />
                    </label>
                    <label className="block text-xs font-bold text-slate-600">
                      Reply-to email
                      <input
                        value={user?.email || ''}
                        readOnly
                        type="email"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-bold text-slate-600">
                    Subject
                    <input
                      required
                      minLength={4}
                      maxLength={120}
                      value={supportSubject}
                      onChange={event => setSupportSubject(event.target.value)}
                      placeholder="Briefly summarize the issue"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    What happened?
                    <textarea
                      required
                      minLength={10}
                      maxLength={4000}
                      rows={5}
                      value={supportDescription}
                      onChange={event => setSupportDescription(event.target.value)}
                      placeholder="Include what you were trying to do and any error message you saw."
                      className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                  <p className="text-xs text-slate-500">Workspace: {tenantName || 'Unknown workspace'}</p>
                  {supportError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">{supportError}</p>}
                  <button
                    type="submit"
                    disabled={supportSubmitting || !user?.email}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={16} />
                    {supportSubmitting ? 'Submitting…' : 'Submit support request'}
                  </button>
                </form>
              )}
            </section>
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <div className="min-h-full"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}