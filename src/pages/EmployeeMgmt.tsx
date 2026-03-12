import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    Search, ChevronDown, ChevronUp, Users, Calendar, Building2,
    X, Trash2, Clock, Edit3Icon, CheckCircle, UserPlus,
    ShieldCheck, LogOut, Mail, Smartphone
} from 'lucide-react';
import { Employee, useEmployeeStore } from '../store/EmployeeStore';
import { Toast } from '../components/Toast';
import AttendanceManagement from './Attendence';

export default function EmployeeMgmt() {
    const { employees, fetchEmployees, upsertEmployee } = useEmployeeStore();

    // UI State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form Refs
    const dobRef = useRef<HTMLInputElement>(null);
    const joiningDateRef = useRef<HTMLInputElement>(null);

    // Form Data State
    const [formData, setFormData] = useState<Partial<Employee>>({
        id: '', esic: '', eip: '', dob: '', firstName: '', lastName: '',
        fatherName: '', gender: '', email: '', phone: '', adhaar: '',
        role: '', joiningDate: '', uan: '',category: '', weeklyOff: [],
    });

    useEffect(() => {
        const loadData = async () => {
            await fetchEmployees();
            useEmployeeStore.getState().updateEmployeeVisuals();
        };
        loadData();
    }, [fetchEmployees]);

    // --- Utility Functions ---
    const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

    const formatPhone = (phone: string) => {
        let numeric = phone.replace(/\D/g, '');
        if (numeric.startsWith("91")) numeric = numeric.substring(2);
        numeric = numeric.substring(0, 10);
        let formatted = "+91 ";
        if (numeric.length > 0) formatted += numeric.substring(0, 5);
        if (numeric.length > 5) formatted += " " + numeric.substring(5, 10);
        return formatted;
    };

    const formatToBritish = (dateStr: string) => {
        if (!dateStr) return "";
        const parts = dateStr.split(/[-/ ]/);
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts[0].length === 4 ? parts : [parts[2], parts[1], parts[0]];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${day}/${months[parseInt(month) - 1] || month}/${year}`;
    };

    // --- Event Handlers ---
    const handleEditClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormData({ ...employee, phone: formatPhone(employee.phone || '') });
        setShowNewEmployeeForm(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'adhaar') {
            const numeric = value.replace(/\D/g, '').substring(0, 12);
            let formatted = numeric.replace(/(\d{4})(?=\d)/g, '$1-');
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
        } else if (name === 'role') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^a-zA-Z\s]/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const toggleDayOff = (day: string) => {
        const currentDays = formData.weeklyOff ?? [];
        setFormData(prev => ({
            ...prev,
            weeklyOff: currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email) {
            showToast('Please fill in required fields.', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await upsertEmployee(formData as Employee);
            showToast(selectedEmployee ? 'Staff updated successfully' : 'Staff registered successfully');
            handleCancel();
        } catch (err) {
            showToast('Failed to save employee data', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowNewEmployeeForm(false);
        setSelectedEmployee(null);
        setFormData({
            id: '', esic: '', eip: '', dob: '', firstName: '', lastName: '',
            fatherName: '', gender: '', email: '', phone: '', adhaar: '',
            role: '', joiningDate: '', uan: '', weeklyOff: [],
        });
    };

    const handleSort = (key: keyof Employee) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredAndSortedRows = useMemo(() => {
        let result = [...employees];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
                e.role.toLowerCase().includes(q) || e.id.toString().includes(q)
            );
        }
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key] ?? '';
                const bVal = b[sortConfig.key] ?? '';
                return sortConfig.direction === 'asc'
                    ? (aVal < bVal ? -1 : 1)
                    : (aVal > bVal ? -1 : 1);
            });
        }
        return result;
    }, [employees, sortConfig, searchQuery]);

    const statsData = [
        { label: 'Total Staff', value: employees.length, icon: Users, color: 'blue' },
        { label: 'Active Now', value: '5', icon: CheckCircle, color: 'green' },
        { label: 'On Leave', value: '0', icon: Calendar, color: 'yellow' },
        { label: 'Departments', value: '5', icon: Building2, color: 'purple' }
    ];

    // UPDATED CLASSES
    const inputClass = "w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-black text-xs focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400 placeholder:font-bold uppercase tracking-tight";
    const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="bg-[#1A233A] px-6 py-10 md:px-12 md:py-16 text-white rounded-b-[3rem] relative overflow-hidden shadow-2xl mb-8">
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Staff Management</h1>
                        <p className="text-slate-400 font-medium mt-1">Directory, Identity & Attendance Control</p>
                    </div>
                    <button
                        onClick={() => setShowNewEmployeeForm(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/20 active:scale-95 w-full md:w-auto justify-center"
                    >
                        <UserPlus size={18} /> + Add Employee
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Stats & Search sections remained the same... */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                    {statsData.map((stat, i) => (
                        <div key={i} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    stat.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                                        stat.color === 'yellow' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 mb-6 shadow-sm border border-slate-100">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, ID or role..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                {/* Mobile & Desktop views remained the same... */}
                {/* 4. Mobile Cards View */}
                <div className="grid grid-cols-1 md:hidden gap-4">
                    {filteredAndSortedRows.map((r) => (
                        <div key={r.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-50">
                                <div className={`w-14 h-14 ${r.color} rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-lg`}>
                                    {r.avatar}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-900">{r.firstName} {r.lastName}</h4>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{r.role}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">ID: #{r.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Aadhaar</p>
                                    <p className="text-xs font-bold text-slate-700">{r.adhaar}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Joined</p>
                                    <p className="text-xs font-bold text-slate-700">{r.joiningDate}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(r)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Edit3Icon size={14} /> Edit
                                </button>
                                {r.timesheetPresent && (
                                    <button onClick={() => { setSelectedEmployee(r); setShowAttendanceForm(true); }} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Clock size={14} /> Attendance
                                    </button>
                                )}
                                <button onClick={() => useEmployeeStore.getState().deleteEmployee(r.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th onClick={() => handleSort('firstName')} className="px-8 py-5 cursor-pointer text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                    Staff Member {sortConfig?.key === 'firstName' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Role</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Identity (Aadhaar)</th>
                                <th onClick={() => handleSort('joiningDate')} className="px-6 py-5 cursor-pointer text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                    Joining {sortConfig?.key === 'joiningDate' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                </th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAndSortedRows.map((r) => (
                                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md group-hover:scale-110 transition-transform`}>
                                                {r.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-none">{r.firstName} {r.lastName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">ID: {r.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{r.role}</td>
                                    <td className="px-6 py-5 text-xs font-mono text-slate-500 font-bold">{r.adhaar}</td>
                                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{r.joiningDate}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditClick(r)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit3Icon size={16} /></button>
                                            {r.timesheetPresent && <button onClick={() => { setSelectedEmployee(r); setShowAttendanceForm(true); }} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Clock size={16} /></button>}
                                            <button onClick={() => useEmployeeStore.getState().deleteEmployee(r.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS --- */}
            {showNewEmployeeForm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                                {selectedEmployee ? `Edit Profile: ${selectedEmployee.firstName}` : 'New Staff Registration'}
                            </h2>
                            <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            {/* Section: Personal Details */}
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Personal Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>First Name</label>
                                        <input type="text" name="firstName" onChange={handleInputChange} value={formData.firstName} required placeholder="e.g. Rahul" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name</label>
                                        <input type="text" name="lastName" onChange={handleInputChange} value={formData.lastName} required placeholder="e.g. Kumar" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Father's Name</label>
                                        <input type="text" name="fatherName" onChange={handleInputChange} value={formData.fatherName} required placeholder="e.g. Ramesh Singh" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select name="gender" onChange={handleInputChange} value={formData.gender} required className={inputClass}>
                                            <option value="">Select Gender</option>
                                            <option value="MALE">MALE</option>
                                            <option value="FEMALE">FEMALE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Date of Birth</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={formatToBritish(formData.dob || '')} onClick={() => dobRef.current?.showPicker()} placeholder="DD/MMM/YYYY" className={`${inputClass} cursor-pointer`} />
                                            <input type="date" ref={dobRef} name="dob" value={formData.dob || ""} onChange={handleInputChange} className="absolute inset-0 opacity-0 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Corporate Email</label>
                                        <input type="email" name="email" onChange={handleInputChange} value={formData.email} required placeholder="name@company.com" className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Statutory & Finance */}
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Statutory & Finance</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Aadhaar Number</label>
                                        <input type="text" name="adhaar" value={formData.adhaar} onChange={handleInputChange} required placeholder="XXXX-XXXX-XXXX" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone Number</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91 00000 00000" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>UAN Number</label>
                                        <input type="text" name="uan" value={formData.uan} onChange={handleInputChange} placeholder="12 Digit UAN" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>EIP Number</label>
                                        <input type="text" name="eip" value={formData.eip} onChange={handleInputChange} placeholder="EIP-XXXXX" className={inputClass} />
                                    </div>
                                    <div >
                                        <label className={labelClass}>ESIC / PF Number</label>
                                        <input type="text" name="esic" value={formData.esic} onChange={handleInputChange} placeholder="Statutory Registration ID" className={inputClass} />
                                    </div>
                                    <div >
                                        <label className={labelClass}>Category</label>
                                        <input type="text" name="esic" value={formData.category} onChange={handleInputChange} placeholder="Category" className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Work Details */}
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Work Schedule</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={labelClass}>Joining Date</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={formatToBritish(formData.joiningDate || '')} onClick={() => joiningDateRef.current?.showPicker()} placeholder="DD/MMM/YYYY" className={`${inputClass} cursor-pointer`} />
                                            <input type="date" ref={joiningDateRef} name="joiningDate" value={formData.joiningDate || ""} onChange={handleInputChange} className="absolute inset-0 opacity-0 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Job Role</label>
                                        <input type="text" name="role" value={formData.role} onChange={handleInputChange} required placeholder="e.g. Site Supervisor" className={inputClass} />
                                    </div>
                                </div>

                                <label className={labelClass}>Weekly Off Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDayOff(day)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${formData.weeklyOff?.includes(day)
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                                    : "bg-white border-slate-100 text-slate-400 hover:border-indigo-100"
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
                                <button type="button" onClick={handleCancel} className="px-6 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                                <button type="submit" disabled={submitting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
                                    {submitting ? 'Processing...' : (selectedEmployee ? 'Update Staff' : 'Confirm Registration')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal for attendance remained the same... */}
            {showAttendanceForm && selectedEmployee && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900">Attendance: {selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                            <button onClick={() => { setShowAttendanceForm(false); setSelectedEmployee(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <div className="overflow-y-auto p-2">
                            <AttendanceManagement employee={selectedEmployee} isPopup={true} />
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}