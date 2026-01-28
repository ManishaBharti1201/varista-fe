import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as authLogout } from "../utils/auth";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gift,
  FileText,
} from "lucide-react";

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userName =
    (typeof window !== "undefined" && localStorage.getItem("userName")) ||
    "John Admin";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // menu handled by Sidebar component

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      authLogout();
    } catch (e) {
      console.warn("Failed to clear localStorage on logout", e);
    }
    //navigate("/login");
  };

  const stats = [
    {
      label: "Total Employees",
      value: "156",
      change: "+2% from last month",
      trend: "up",
      icon: Users,
    },
    {
      label: "Present Today",
      value: "142",
      subtext: "8 employees on leave",
      progress: 91,
      icon: UserCheck,
    },
    {
      label: "Pending Approvals",
      value: "12",
      subtext: "require attention",
      icon: FileText,
    },
  ];

  const activities = [
    {
      title: "Alice Employee applied for vacation leave",
      time: "10 minutes ago",
      status: "pending",
      indicator: "yellow",
    },
    // {
    //   title: "Mike Manager checked in at Office",
    //   time: "25 minutes ago",
    //   status: "success",
    //   indicator: "green",
    // },
    // {
    //   title: "November payroll processing completed",
    //   time: "2 hours ago",
    //   status: "success",
    //   indicator: "green",
    // },
    // {
    //   title: "Emma Designer submitted travel expense",
    //   time: "3 hours ago",
    //   status: "pending",
    //   indicator: "yellow",
    // },
  ];

  const upcomingEvents = [
    {
      title: "Team Meeting",
      date: "2024-12-15 at 10:00 AM",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    }
  ];

  const Greeting = () => {
    const currentHour = new Date().getHours(); // Get the current hour (0-23)
    let greeting = '';

    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }

    return (
      <div>
        <h2>{greeting} ! {userName}</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Backdrop for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {Greeting()}
            </h1>
            <p className="text-blue-50">
              Here's what's happening in your organization today
            </p>
          </div>

          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </p>
                        {stat.change && (
                          <div className="flex items-center gap-1">
                            {stat.trend === "up" ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <p
                              className={`text-xs ${stat.trend === "up"
                                  ? "text-green-600"
                                  : "text-red-600"
                                }`}
                            >
                              {stat.change}
                            </p>
                          </div>
                        )}
                        {stat.subtext && (
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.subtext}
                          </p>
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Recent Activities
                  </h2>
                  <p className="text-sm text-gray-500">
                    Latest updates across the organization
                  </p>
                </div>

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${activity.indicator === "green"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                          }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${activity.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Upcoming Events
                  </h2>
                  <p className="text-sm text-gray-500">
                    Don't miss these important dates
                  </p>
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
                          <p className="text-sm font-medium text-gray-900">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.date}
                          </p>
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
