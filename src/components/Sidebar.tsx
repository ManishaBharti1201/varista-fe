
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ChevronRight,
  Shield,
  LogOut,
  Link as LinkIcon,
  X,
    Briefcase,
  CreditCard,
  CalendarClock,
  Building2
} from "lucide-react";
import { useUserStore } from "../store/UserStore";
import { useClientStore } from "../store/ClientStore";

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (b: boolean) => void;
  handleLogout: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Building2, label: "Clients", to: "/clients" },
  { icon: CreditCard, label: "Invoices", to: "/invoices" },
  { icon: FileText, label: "Quotations", to: "/quotations" },
  { icon: Users, label: "Employees", to: "/employees" },
  { icon: CalendarClock, label: "Timesheet", to: "/reports" },
  { icon: LinkIcon, label: "Quick Links", to: "/quickLinks" },
];

const adminMenuItems = [
  { icon: Shield, label: "User Management", to: "/admin/users" },
];

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
}: Props) {
  const { user } = useUserStore();
  const { clients, selectedClientId } = useClientStore();
  const selectedClient = clients.find(client => client.id === selectedClientId);
  const visibleMenuItems = menuItems.filter(item => selectedClient?.menuItems.includes(item.key));
  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-800/80 bg-[#111A30] shadow-[10px_0_30px_rgba(15,23,42,0.12)] transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-[#0D1428]/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-mint-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg tracking-tight text-white">SYNCRA</h1>
            <p className="text-[10px] font-bold text-mint-300 uppercase tracking-[0.2em] leading-none">Enterprise OS</p>
          </div>
        </div>
        
        {/* Close button - Mobile Only */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-2 text-slate-500 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* User Quick Info */}
      <div className="px-6 py-5 bg-white/[0.03] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${userName}&bg=1555C4&color=fff`}
              alt="avatar" 
              className="w-11 h-11 rounded-xl object-cover border-2 border-white/20 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-navy-900 rounded-full"></div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate text-sm">{userName}</h3>
            <p className="text-xs text-slate-400 truncate font-medium">{user?.role}</p>
          </div>
        </div>
        {user?.company?.name && (
          <div className="mt-4 px-3 py-2 bg-white/[0.06] border border-white/5 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase truncate">
              {user.company.name}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
        {/* Main Menu */}
        <div className="space-y-1">
          <p className="px-4 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Workspace</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                end={item.to === "/"}
                style={({ isActive }) => isActive ? { backgroundColor: selectedClient?.theme.primaryColor || '#4f46e5' } : undefined}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-brand-500/90 to-mint-500/80 text-white shadow-lg shadow-brand-500/10"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </div>

        {/* Admin Section - Only shown if user is admin */}
        {user?.role?.toLowerCase().includes('admin') && selectedClient?.menuItems.includes('users') && (
          <div className="space-y-1">
            <p className="px-4 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Administration</p>
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  style={({ isActive }) => isActive ? { backgroundColor: selectedClient?.theme.primaryColor || '#4f46e5' } : undefined}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-brand-500/90 to-mint-500/80 text-white shadow-lg shadow-brand-500/10"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-400 hover:text-coral-500 hover:bg-coral-500/10 rounded-xl font-bold text-sm transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}