import { useState } from "react";
import {
  Users, Plus, X, Calendar as CalendarIcon, ArrowRight, 
  CalendarDays, IndianRupee, Briefcase, ArrowUpRight, ShieldCheck
} from "lucide-react";

interface UpcomingEvent {
  title: string;
  date: string;
  icon: any;
  color: string;
}

export default function Dashboard() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([
    { title: "Team Strategy Sync", date: "2026-03-15", icon: Users, color: "bg-indigo-100 text-indigo-600" },
    { title: "Client Review", date: "2026-03-18", icon: CalendarDays, color: "bg-emerald-100 text-emerald-600" }
  ]);
  
  const dashboardStats = [
    { label: 'Workforce', value: '128', icon: Users, color: 'indigo', trend: '+12' },
    { label: 'Payroll', value: '₹8.4L', icon: IndianRupee, color: 'rose', trend: 'Pending' },
    { label: 'Projects', value: '14', icon: Briefcase, color: 'amber', trend: '3 Due' },
    { label: 'Health', value: '99%', icon: ShieldCheck, color: 'emerald', trend: 'Active' }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "" });
  const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "Admin";

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setUpcomingEvents([{ ...newEvent, icon: CalendarIcon, color: "bg-blue-100 text-blue-600" }, ...upcomingEvents]);
    setIsModalOpen(false);
    setNewEvent({ title: "", date: "" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-12">
      {/* 1. Header - Optimized Padding for Mobile */}
      <div className="relative overflow-hidden bg-[#1A233A] px-6 py-12 md:px-10 md:py-20 rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-2xl">
        <div className="absolute top-[-10%] right-[-5%] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
              Hello, <span className="text-indigo-400">{userName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-1">
              SYNCRA Command Center • <span className="text-white">{upcomingEvents.length} Events</span>
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl px-4 py-2 md:px-6 md:py-4 rounded-xl md:rounded-[2rem] border border-white/10">
            <p className="text-white font-black text-xs md:text-base">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 md:-mt-12 relative z-20 space-y-6 md:space-y-8">
        
        {/* 2. Metric Grid - 2 Columns on Mobile, 4 on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {dashboardStats.map((stat, i) => (
            <div key={i} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 group active:scale-95 transition-all">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center 
                  ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                    stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                    stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <stat.icon size={18} className="md:w-6 md:h-6" />
                </div>
                <ArrowUpRight size={14} className="text-slate-200 md:block hidden" />
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-lg md:text-3xl font-black text-slate-900 mt-0.5 md:mt-2 tracking-tighter">{stat.value}</h3>
                <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase mt-1">● {stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Upcoming Events - Full Width Mobile Rows */}
        <section className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 p-5 md:p-10">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
              <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">Briefing</h2>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-3 md:px-6 md:py-4 bg-[#1A233A] text-white rounded-xl md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              <Plus size={16} /> <span className="hidden md:inline">Add Milestone</span>
            </button>
          </div>

          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-4 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-50 bg-slate-50/30 md:bg-transparent md:hover:bg-slate-50/50 transition-all">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.25rem] flex items-center justify-center shrink-0 ${event.color}`}>
                  <event.icon size={20} className="md:w-7 md:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-lg font-black text-slate-900 truncate tracking-tight">{event.title}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                    {formatDate(event.date)}
                  </p>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Modal - Bottom Sheet Style for Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-[#1A233A]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-1/2 duration-500">
            <div className="px-8 py-6 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">New Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 md:p-3 bg-white border border-slate-100 rounded-full transition-all shadow-sm">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-8 md:p-10 space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 md:px-6 md:py-5 bg-slate-50 border-none rounded-2xl md:rounded-[1.5rem] text-slate-900 font-black text-sm outline-none"
                    placeholder="Enter details..."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timeline</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-4 md:px-6 md:py-5 bg-slate-50 border-none rounded-2xl md:rounded-[1.5rem] text-slate-900 font-black text-sm outline-none"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-5 md:py-6 bg-[#1A233A] text-white rounded-2xl md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all mb-4 md:mb-0">
                Authorize Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}