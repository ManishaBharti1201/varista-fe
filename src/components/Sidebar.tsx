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
  Briefcase
} from "lucide-react";
import { useUserStore } from "../store/UserStore";
import { useClientStore } from "../store/ClientStore";

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (b: boolean) => void;
  handleLogout: () => void;
}

const menuItems = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { key: "clients", icon: Users, label: "Clients", to: "/clients" },
  { key: "invoices", icon: FileText, label: "Invoices", to: "/invoices" },
  { key: "quotations", icon: FileText, label: "Quotations", to: "/quotations" },
  { key: "employees", icon: Users, label: "Employees", to: "/employees" },
  { key: "quicklinks", icon: LinkIcon, label: "Quick Links", to: "/quicklinks" },
  { key: "timesheet", icon: FileText, label: "Timesheet", to: "/reports" },
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
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100" style={{ backgroundColor: selectedClient?.theme.primaryColor || '#4f46e5' }}>
            {selectedClient?.theme.logoUrl
              ? <img src={selectedClient.theme.logoUrl} alt="" className="w-6 h-6 object-contain" />
              : <Briefcase className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-900">{selectedClient?.theme.appName || 'Syncra'}</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">Workforce</p>
          </div>
        </div>
        
        {/* Close button - Mobile Only */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      {/* User Quick Info */}
      <div className="p-6 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${userName}&bg=6366f1&color=fff`} 
              alt="avatar" 
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate text-sm">{userName}</h3>
            <p className="text-xs text-slate-500 truncate font-medium">{user?.role}</p>
          </div>
        </div>
        {user?.company?.name && (
          <div className="mt-4 px-3 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-bold text-slate-600 uppercase truncate">
              {user.company.name}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        {/* Main Menu */}
        <div className="space-y-1">
          <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">General</p>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                end={item.to === "/"}
                style={({ isActive }) => isActive ? { backgroundColor: selectedClient?.theme.primaryColor || '#4f46e5' } : undefined}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 active-nav-pill"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} className="shrink-0" />
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
            <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</p>
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  style={({ isActive }) => isActive ? { backgroundColor: selectedClient?.theme.primaryColor || '#4f46e5' } : undefined}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} className="shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all"
        >
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}