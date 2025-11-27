import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as authLogout } from '../utils/auth';
import { 
  Menu, Search, LayoutDashboard, Users, Building2, Calendar,
  Clock, DollarSign, Timer, Archive, FileText, File, BarChart3,
  Bell, Shield, Settings, LogOut, ChevronRight, UserCheck,
  CalendarDays, Gift, TrendingUp, TrendingDown
} from 'lucide-react';

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const userName = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'John Admin';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Clients' },
    // { icon: Building2, label: 'Organization' },
    // { icon: Calendar, label: 'Leave Management' },
    // { icon: Clock, label: 'Attendance' },
    // { icon: DollarSign, label: 'Payroll' },
    // { icon: Timer, label: 'Timesheet' },
    // { icon: Archive, label: 'Assets' },
    // { icon: FileText, label: 'Expenses' },
    // { icon: File, label: 'Documents' },
    // { icon: BarChart3, label: 'Reports' },
    // { icon: Users, label: 'Onboarding' },
    // { icon: Bell, label: 'Notifications' }
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      authLogout();
    } catch (e) {
      console.warn('Failed to clear localStorage on logout', e);
    }
    navigate('/login');
  };

  const adminMenuItems = [
    { icon: Shield, label: 'User Management' },
    { icon: Settings, label: 'System Settings' }
  ];

  const stats = [
    { 
      label: 'Total Employees', 
      value: '156', 
      change: '+2% from last month', 
      trend: 'up',
      icon: Users 
    },
    { 
      label: 'Present Today', 
      value: '142', 
      subtext: '8 employees on leave',
      progress: 91,
      icon: UserCheck 
    },
    { 
      label: 'Monthly Payroll', 
      value: '$450,000', 
      change: '-1.2% from last month', 
      trend: 'down',
      icon: DollarSign 
    },
    { 
      label: 'Pending Approvals', 
      value: '12', 
      subtext: 'require attention',
      icon: FileText 
    }
  ];

  const activities = [
    {
      title: 'Alice Employee applied for vacation leave',
      time: '10 minutes ago',
      status: 'pending',
      indicator: 'yellow'
    },
    {
      title: 'Mike Manager checked in at Office',
      time: '25 minutes ago',
      status: 'success',
      indicator: 'green'
    },
    {
      title: 'November payroll processing completed',
      time: '2 hours ago',
      status: 'success',
      indicator: 'green'
    },
    {
      title: 'Emma Designer submitted travel expense',
      time: '3 hours ago',
      status: 'pending',
      indicator: 'yellow'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Team Meeting',
      date: '2024-12-15 at 10:00 AM',
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'John Admin Birthday',
      date: '2024-12-16 at All Day',
      icon: Gift,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      title: 'Payroll Processing',
      date: '2024-12-20 at 2:00 PM',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
              <p className="text-xs text-gray-500">{localStorage.getItem('role')}</p>
            </div>
          </div>
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
           {localStorage.getItem('companyName')}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveMenu(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                    item.active || activeMenu === item.label
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Admin Section */}
          <div className="mt-6">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Admin</span>
            </div>
            <div className="space-y-1">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveMenu(item.label)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees, departments..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Good Morning, {userName}!</h1>
            <p className="text-blue-50">Here's what's happening in your organization today</p>
          </div>

          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        {stat.change && (
                          <div className="flex items-center gap-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change}
                            </p>
                          </div>
                        )}
                        {stat.subtext && (
                          <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                        )}
                        {stat.progress && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gray-900 h-2 rounded-full" 
                                style={{ width: `${stat.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activities and Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent Activities</h2>
                  <p className="text-sm text-gray-500">Latest updates across the organization</p>
                </div>

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.indicator === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  View All Activities
                </button>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Upcoming Events</h2>
                  <p className="text-sm text-gray-500">Don't miss these important dates</p>
                </div>

                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => {
                    const Icon = event.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${event.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button className="w-full mt-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}