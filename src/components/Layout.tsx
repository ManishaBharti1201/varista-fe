import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, LogOut, X, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { logout as authLogout } from '../utils/auth';
import { useUserStore } from '../store/UserStore';
import { apiRequest } from '../utils/apiClient';
import { endpoints } from '../config/urls';

interface Notification {
  id: string;
  title: string;
  description: string;
  status: string;
  type: 'success' | 'alert' | 'info';
  createDate: string;
  isRead: boolean;
}

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useUserStore();

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

  useEffect(() => {
    if (isNotifOpen) fetchNotifications();
  }, [isNotifOpen]);

  const handleLogout = () => {
    try { authLogout(); } catch (e) { console.warn('Logout failed', e); }
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-[60] w-72 transform lg:relative lg:z-0 lg:translate-x-0 transition-transform duration-300 ease-in-out bg-white shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />
      </div>

      {/* GLOBAL BACKDROP */}
      {(isSidebarOpen || isNotifOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" onClick={() => { setIsSidebarOpen(false); setIsNotifOpen(false); }} />
      )}

      {/* NOTIFICATION SLIDE-OVER */}
      <aside className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isNotifOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#1A233A] text-white rounded-bl-[2rem]">
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase">Activity Feed</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Updates</p>
          </div>
          <button onClick={() => setIsNotifOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40 space-y-3">
               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Feed...</p>
             </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className={`p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group ${notif.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100 shadow-sm'}`}>
                <div className="flex gap-4">
                  <div className={`mt-1 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : notif.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notif.type === 'success' ? <CheckCircle2 size={16} /> : notif.type === 'alert' ? <AlertCircle size={16} /> : <Info size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{notif.title}</h4>
                      {!notif.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>}
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{notif.description}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <Clock size={12} /> {notif.createDate}
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
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center sticky top-0 z-40">
          <div className="flex-1 flex items-center justify-between">
            
            {/* Left: Branding/Context (Replaces Search) */}
            <div className="flex items-center gap-4">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600 transition-all active:scale-90" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={22} />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">SYNCRA HUB</h2>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Session Active</p>
              </div>
            </div>

            {/* Right: Integrated Action Cluster */}
            <div className="flex items-center bg-slate-50/80 border border-slate-100 p-1.5 rounded-[1.5rem] md:gap-2">
              
              {/* Notifications */}
              <button 
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2.5 rounded-xl transition-all ${isNotifOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'}`}
              >
                <Bell size={20} />
                {!isNotifOpen && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
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

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="min-h-full"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}