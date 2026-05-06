import { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, Upload, X, 
  DownloadIcon, Trash2, Calendar as CalendarIcon,
  FileText, CreditCard, Info
} from 'lucide-react';
import { Toast } from '../components/Toast';

export default function AnalyticsReports() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [holidayType, setHolidayType] = useState('public');
  const [uploading, setUploading] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  // Mock Data
  const [holidays, setHolidays] = useState<any[]>([]);

  const fetchHolidays = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/holiday/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHolidays(data.map((h: any) => {
          // Parse YYYY-MM-DD string to local Date to avoid timezone offsets
          const [year, month, day] = h.date.split('-').map(Number);
          return { 
            ...h, 
            date: new Date(year, month - 1, day),
            type: h.type === 'PH' ? 'public' : h.type === 'NH' ? 'national' : h.type
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load holidays', err);
    }
  };

  useEffect(() => {
    fetchHolidays();
    if (localStorage.getItem('token')) {
      fetchBlobs();
    }
  }, []);

  const fetchBlobs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/blobs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      }
    } catch (err) {
      console.error('Failed to load muster records', err);
    }
  };

  const handleDownloadBlob = async (id: string, fileName: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/blob/${id}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setToast({ message: 'Failed to download file', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error downloading file', type: 'error' });
    }
  };

  const handleDeleteBlob = async (id: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/blob/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setToast({ message: 'Log deleted successfully', type: 'success' });
        fetchBlobs();
      } else {
        setToast({ message: 'Failed to delete log', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error deleting log', type: 'error' });
    }
  };

  const handleSaveHoliday = async () => {
    if (!holidayName || !selectedDate) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/holiday/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          name: holidayName,
          type: holidayType === 'public' ? 'PH' : 'NH'
        })
      });
      if (response.ok) {
        setToast({ message: 'Holiday saved successfully', type: 'success' });
        setShowHolidayModal(false);
        setHolidayName('');
        fetchHolidays();
      } else {
        setToast({ message: 'Failed to save holiday', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error saving holiday', type: 'error' });
    }
  };

  const handleDeleteHoliday = async () => {
    const holiday = isHoliday(selectedDate);
    if (!holiday) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/holiday/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: holiday.date.toISOString().split('T')[0],
          type: holiday.type === 'public' ? 'PH' : 'NH'
        })
      });
      if (response.ok) {
        setToast({ message: 'Holiday removed successfully', type: 'success' });
        setShowHolidayModal(false);
        fetchHolidays();
      } else {
        setToast({ message: 'Failed to remove holiday', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error removing holiday', type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_BFF_URL}/api/timesheet/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setToast({ message: 'Timesheet uploaded and processed', type: 'success' });
        setShowUploadModal(false);
        fetchBlobs();
      } else {
        setToast({ message: 'Failed to upload timesheet', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error connecting to upload service', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- Helpers ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: (Date | null)[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isHoliday = (date: Date | null) => {
    if (!date) return null;
    return holidays.find(h => h.date.toDateString() === date.toDateString());
  };

  const isToday = (date: Date | null) => date?.toDateString() === new Date().toDateString();

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowHolidayModal(true);
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* 1. Brand Header */}
      <div className="bg-[#1A233A] px-6 py-10 md:px-12 md:py-16 text-white rounded-b-[3rem] relative overflow-hidden shadow-2xl mb-8">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Analytics & Reports</h1>
            <p className="text-slate-400 font-medium mt-1">Holidays, Muster Records & Payroll Insights</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex-1 md:flex-none flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/20 active:scale-95 justify-center"
            >
              <Upload size={18} /> Upload Timesheet
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* 2. Navigation Tabs */}
        <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 w-fit overflow-x-auto">
          {[
            { id: 'calendar', label: 'Holiday Calendar', icon: CalendarIcon },
            { id: 'muster', label: 'Muster Data', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* 3. Tab Content */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-black text-slate-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="hidden md:flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-200"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-300 py-2 uppercase tracking-widest">{day}</div>
                ))}
                {days.map((date, i) => {
                  const holiday = isHoliday(date);
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateClick(date)}
                      disabled={!date}
                      className={`aspect-square p-2 md:p-4 rounded-2xl md:rounded-3xl border transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
                        !date ? 'border-transparent' :
                        holiday ? (holiday.type === 'public' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100') :
                        isToday(date) ? 'bg-white border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-200'
                      }`}
                    >
                      {date && (
                        <>
                          <span className={`text-sm md:text-lg font-black ${holiday ? (holiday.type === 'public' ? 'text-emerald-600' : 'text-indigo-600') : isToday(date) ? 'text-indigo-600' : 'text-slate-900'}`}>
                            {date.getDate()}
                          </span>
                          {holiday && (
                            <span className={`hidden md:block text-[9px] font-black uppercase tracking-tighter mt-1 text-center leading-tight ${holiday.type === 'public' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                              {holiday.name}
                            </span>
                          )}
                          {holiday && <div className={`md:hidden w-1.5 h-1.5 rounded-full mt-1 ${holiday.type === 'public' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'muster' && (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Log ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Source File</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Month</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Uploaded On</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendanceData.map((r) => (
                    <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-slate-900">#{r.id}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={16}/></div>
                          <span className="text-sm font-bold text-slate-600">{r.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{r.generatedMonth}</span>
                      </td>
                      <td className="px-6 py-5 text-center text-xs font-bold text-slate-400">{r.creationDate}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDownloadBlob(r.id, r.fileName)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <DownloadIcon size={16}/>
                          </button>
                          <button onClick={() => handleDeleteBlob(r.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 md:hidden gap-4">
              {attendanceData.map((r) => (
                <div key={r.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase">ID: #{r.id}</span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">{r.generatedMonth}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText size={20}/></div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-slate-900 truncate">{r.fileName}</p>
                      <p className="text-[10px] font-bold text-slate-400">Uploaded: {r.creationDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadBlob(r.id, r.fileName)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                      <DownloadIcon size={14}/> Download
                    </button>
                    <button onClick={() => handleDeleteBlob(r.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {showHolidayModal && selectedDate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">
                {isHoliday(selectedDate) ? 'Holiday Detail' : 'Add Holiday'}
              </h2>
              <button onClick={() => setShowHolidayModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                  <CalendarIcon size={24}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Date</p>
                  <p className="text-sm font-black text-slate-900">{selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              {!isHoliday(selectedDate) ? (
                <>
                  <input
                    type="text"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="E.g. Diwali Festival"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                  <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {['public', 'national'].map(type => (
                      <button
                        key={type}
                        onClick={() => setHolidayType(type)}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          holidayType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleSaveHoliday}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 transition-all active:scale-95"
                  >
                    Save Holiday
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl">
                    <p className="text-lg font-black text-emerald-600">{isHoliday(selectedDate)?.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mt-1">{isHoliday(selectedDate)?.type} Holiday</p>
                  </div>
                  <button 
                    onClick={handleDeleteHoliday}
                    className="w-full py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
                  >
                    Remove Holiday
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Upload Data</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="border-4 border-dashed border-slate-50 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-colors">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={32}/>
                </div>
                <p className="text-sm font-black text-slate-900">Drop timesheet here</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Supports CSV, XLS, XLSX up to 10MB</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-up" 
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls"
                />
                <label 
                  htmlFor="file-up" 
                  className={`mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? 'Uploading...' : 'Select File'}
                </label>
              </div>

              <div className="flex gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-indigo-900/60 leading-relaxed uppercase">Important: Ensure Employee IDs match the SYNCRA directory to avoid sync errors.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}