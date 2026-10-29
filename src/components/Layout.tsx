import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, LogOut, X, Clock, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { logout } from '../utils/auth';
import { useUserStore } from '../store/UserStore';
import { useTenantStore } from '../store/TenantStore';
import { apiRequest } from '../utils/apiClient';
import { endpoints } from '../config/urls';

interface Notification {
  id: string;
  title?: string;
  description: string;
  status: string;
  type?: 'success' | 'alert' | 'info';
  createDate: string;
}

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

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
      const mockData: Notification[] = await response.json();
      setNotifications(mockData);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const formatReadableDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Replace space with T only if T is not already present
    const formattedStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const d = new Date(formattedStr);
    if (isNaN(d.getTime())) return dateStr; // Fallback to raw string if parsing fails
    
    return d.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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

  return (
    <div className="flex h-screen bg-[#F6F8FB] overflow-hidden font-sans">

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
                      <Clock size={12} /> {formatReadableDate(notif.createDate)}
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
        <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-4 md:px-8 flex items-center sticky top-0 z-40">
          <div className="flex-1 flex items-center justify-between">

            {/* Left: Branding/Context (Replaces Search) */}
            <div className="flex items-center gap-4">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600 transition-all active:scale-90" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={22} />
              </button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-mint-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                  <Sparkles size={18} />
                </div>
                <p className="text-base font-display font-black text-navy-900 uppercase tracking-[0.08em] truncate">
                  {tenantName}
                </p>
              </div>
            </div>

            {/* Right: Integrated Action Cluster */}
            <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-[1.5rem] shadow-sm md:gap-2">

              {/* Notifications */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2.5 rounded-xl transition-all ${isNotifOpen ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:bg-white hover:text-brand-600 hover:shadow-sm'}`}
              >
                <Bell size={20} />
              {!isNotifOpen && notifications.some(n => n.status !== 'READ') && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

              {/* Profile Card */}
              <div className="flex items-center gap-3 pl-2 pr-4 group cursor-pointer border-r border-slate-200 md:mr-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
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
                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2"
                title="Secure Logout"
              >
                <LogOut size={20} />
                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Exit</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto lg:overflow-hidden bg-[#F8FAFC]">
          <div className="min-h-full"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}