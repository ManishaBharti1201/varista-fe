import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ChevronRight,
  Shield,
  Settings,
  LogOut,
  Link,
} from "lucide-react";

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (b: boolean) => void;
  handleLogout: () => void;
  initials: string;
  userName: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Users, label: "Clients", to: "/clients" },
  { icon: FileText, label: "Invoices", to: "/invoices" },
  { icon: Link, label: "Quick Links", to: "/quickLinks" },
];

const adminMenuItems = [
  { icon: Shield, label: "User Management", to: "/admin/users" },
  { icon: Settings, label: "System Settings", to: "/admin/settings" },
];

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
  initials,
  userName,
}: Props) {
  return (
    <div
      className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-40 transform lg:static lg:translate-x-0 transition-transform duration-200 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">HRMS</h1>
            <p className="text-xs text-gray-500">Portal</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{initials}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{userName}</h3>
            <p className="text-xs text-gray-500">
              {localStorage.getItem("role")}
            </p>
          </div>
        </div>
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
          {localStorage.getItem("companyName")}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon as any;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </NavLink>
            );
          })}

          {/* Admin Section */}
          <div className="mt-6">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Admin
              </span>
            </div>
            <div className="space-y-1">
              {adminMenuItems.map((item) => {
                const Icon = item.icon as any;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
