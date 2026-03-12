import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock, CheckCircle, ChevronRight, ChevronLeft,
    TimerOff, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useTimesheetStore } from '../store/TimesheetStore';

export default function AttendanceManagement({ employee, isPopup = false }: any) {
    const { records, summary, loading, getTimesheet } = useTimesheetStore();

    // 1. Initialize State
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [currentDate, setCurrentDate] = useState(new Date());

    // 2. Fetch data
    useEffect(() => {
        if (employee?.id) {
            getTimesheet(employee.id.toString());
        }
    }, [employee?.id, getTimesheet]);

    // Update calendar view to the last available record once data loads
    useEffect(() => {
        const lastRecordDate = records[records.length - 1]?.attendDate;
        if (lastRecordDate) {
            setCurrentDate(new Date(lastRecordDate));
        }
    }, [records]);

    // --- Helpers ---
    const formatDateKey = (day: number, month: number, year: number) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const apiToUiDate = (apiDate: string) => {
        const [y, m, d] = apiDate.split('-');
        return `${d}/${m}/${y}`;
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) days.push({ day: daysInPrevMonth - i, month: 'prev' });
        for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, month: 'current' });
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) days.push({ day: i, month: 'next' });

        return days;
    }, [currentDate]);

    const getStatusStyles = (status: string | null, isSelected: boolean) => {
        let base = "relative transition-all duration-200 ";
        let indicator = "";

        switch (status) {
            case 'P': indicator = 'bg-emerald-500 text-white shadow-emerald-100'; break;
            case 'AB': indicator = 'bg-rose-500 text-white shadow-rose-100'; break;
            case 'HD': indicator = 'bg-purple-500 text-white shadow-purple-100'; break;
            case 'O': indicator = 'bg-indigo-600 text-white shadow-indigo-100'; break;
            default: indicator = 'bg-transparent text-slate-400 hover:bg-slate-100'; break;
        }

        if (isSelected) base += ' ring-2 ring-indigo-600 ring-offset-2 scale-110 z-10';
        return { base, indicator };
    };

    const selectedRecord = records.find(r => apiToUiDate(r.attendDate) === selectedDate);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Syncing Records...</p>
        </div>
    );

    return (
        <div className={isPopup ? "bg-white" : "min-h-screen bg-[#F8FAFC] p-4 md:p-8"}>
            <div className="max-w-7xl mx-auto">
                {!isPopup && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Control</h1>
                        <p className="text-slate-500 font-medium">Monitoring logs for {employee?.firstName} {employee?.lastName}</p>
                    </div>
                )}

                {/* 1. Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Weekly Off" value={summary?.weeklyOffs} icon={<CheckCircle size={20}/>} theme="green" />
                    <StatCard title="Work Hours" value={`${summary?.workingHrs}`} icon={<Clock size={20}/>} theme="blue" />
                    <StatCard title="Total Days" value={summary?.workdaysCount} icon={<CalendarIcon size={20}/>} theme="purple" />
                    <StatCard title="Absences" value={summary?.leavesCount} icon={<TimerOff size={20}/>} theme="rose" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 2. Detail Panel (Left) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Shift Insights</h2>
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{selectedDate}</p>
                                </div>
                                {selectedRecord && (
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                        selectedRecord.status === 'P' ? 'bg-emerald-50 text-emerald-600' :
                                        selectedRecord.status === 'AB' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                        Status: {selectedRecord.status}
                                    </span>
                                )}
                            </div>

                            {!selectedRecord ? (
                                <div className="py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-4 flex items-center justify-center text-slate-400">
                                        <TimerOff size={24}/>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No shift activity recorded</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <MetricBox label="Check In" value={selectedRecord.inTime} icon={<ArrowUpRight className="text-emerald-500"/>} />
                                    <MetricBox label="Check Out" value={selectedRecord.outTime} icon={<ArrowDownLeft className="text-rose-500"/>} />
                                    <MetricBox label="Duration" value={selectedRecord.totalHours} icon={<Clock className="text-indigo-500"/>} />
                                    <MetricBox label="Work Mode" value="On-Site" icon={<Building2 className="text-slate-400"/>} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Calendar Sidebar (Right) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                            {/* Subtle background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <button 
                                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
                                        className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
                                        className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 md:gap-2">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                        <div key={d} className="text-center text-[10px] font-black text-slate-300 pb-4 uppercase tracking-widest">{d}</div>
                                    ))}
                                    {calendarDays.map((item, index) => {
                                        const apiDateKey = formatDateKey(item.day, currentDate.getMonth(), currentDate.getFullYear());
                                        const uiDateKey = apiToUiDate(apiDateKey);
                                        const isCurrentMonth = item.month === 'current';
                                        const record = isCurrentMonth ? records.find(r => r.attendDate === apiDateKey) : null;
                                        const isSelected = isCurrentMonth && selectedDate === uiDateKey;
                                        
                                        // Refined logic for white theme colors
                                        const getWhiteThemeStatus = (status: string | null, selected: boolean) => {
                                            let base = "relative transition-all duration-200 ";
                                            let indicator = "";

                                            switch (status) {
                                                case 'P': indicator = 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'; break;
                                                case 'AB': indicator = 'bg-rose-500 text-white shadow-lg shadow-rose-200'; break;
                                                case 'HD': indicator = 'bg-purple-500 text-white shadow-lg shadow-purple-200'; break;
                                                case 'O': indicator = 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'; break;
                                                default: indicator = 'bg-slate-50 text-slate-600 hover:bg-slate-100'; break;
                                            }

                                            if (selected) base += ' ring-2 ring-indigo-600 ring-offset-2 scale-110 z-10';
                                            return { base, indicator };
                                        };

                                        const { base, indicator } = getWhiteThemeStatus(record?.status || null, isSelected);

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => isCurrentMonth && setSelectedDate(uiDateKey)}
                                                disabled={!isCurrentMonth}
                                                className={`aspect-square rounded-xl text-[11px] font-bold flex items-center justify-center ${base} ${
                                                    isCurrentMonth ? indicator : 'text-slate-200 cursor-default bg-transparent'
                                                }`}
                                            >
                                                {item.day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Specialized Sub-components ---

function StatCard({ title, value, icon, theme }: any) {
    const colors: any = {
        green: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        rose: "bg-rose-50 text-rose-600"
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{value || 0}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${colors[theme]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MetricBox({ label, value, icon }: any) {
    return (
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-black text-slate-900">{value || '--:--'}</p>
            </div>
        </div>
    );
}

function Building2({ className, size = 16 }: any) {
    return <CalendarIcon className={className} size={size} />; // Fallback icon
}