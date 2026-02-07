import React, { use, useEffect, useState, useMemo, useCallback } from 'react'; // Added useState
import { Search, ChevronDown, Mail, Phone, Users, Calendar, Building2, Download, X, ChevronUp, Trash2 } from 'lucide-react';
import { Employee, useEmployeeStore } from '../store/EmployeeStore';
import { endpoints } from '../config/urls';
import { Toast } from '../components/Toast';

export default function EmployeeMgmt() {
    console.log("Provider rendering");
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };
    const { employees: employees, fetchEmployees, createEmployee } = useEmployeeStore();
    const stats = [
        { label: 'Total Employees', value: employees.length, icon: Users, color: 'blue' },
        { label: 'Active', value: '5', icon: Mail, color: 'green' },
        { label: 'On Leave', value: '0', icon: Calendar, color: 'yellow' },
        { label: 'Departments', value: '5', icon: Building2, color: 'purple' }
    ];

    useEffect(() => {
        const loadData = async () => {
            await fetchEmployees();

            // After fetching, update visuals
            useEmployeeStore.getState().updateEmployeeVisuals();
        };
        loadData();
    }, [fetchEmployees]);

    // 2️⃣ State for managing the overlay form


    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        adhaar: '',
        role: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

            setFormData(prev => ({ ...prev, [name]: value }));

    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // valiatre inputs here if needed
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.adhaar || !formData.role) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        setSubmitting(true);

        try {
            // The store's createEmployee handles the API call and visual defaults
            await createEmployee(formData);
            handleCancel(); // Reset and close
            showToast('Employee created successfully!', 'success');
        } catch (err) {
            console.error('Failed to create employee', err);
            showToast('Failed to create employee. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            adhaar: '',
            role: '',
            
        });
        setSubmitting(false);
    };

    const handleSort = (key: keyof Employee) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ key, direction });
    };

    // 2. Date filtering . Sorting based on joiningDate
    const filteredAndSortedRows = useMemo(() => {
        let filtered = [...employees];

        // Sorting
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [employees, sortConfig]);




    return (
        <>
            <div className="p-8">
                {/* Page Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Management</h1>
                        <p className="text-gray-600">Manage and view employee information</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon as any;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stat.color === 'blue' ? 'bg-blue-100' :
                                        stat.color === 'green' ? 'bg-green-100' :
                                            stat.color === 'yellow' ? 'bg-yellow-100' : 'bg-purple-100'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600' :
                                            stat.color === 'green' ? 'text-green-600' :
                                                stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'
                                            }`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Employee Directory */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or employee ID..."
                                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button> */}
                        <button
                            onClick={() => setShowForm(true)}

                            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg shadow-blue-200 transition-all ${submitting ? "bg-blue-400" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}
                        >
                            + Add Employee
                        </button>
                    </div>

                    {/* Employee Table */}
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                <tr className="border-b border-slate-200">
                                    <th onClick={() => handleSort('firstName')} className="cursor-pointer text-left py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                        <div className="flex items-center gap-1">Employee {sortConfig?.key === 'firstName' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}</div>
                                    </th>

                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Adhaar</th>
                                    <th onClick={() => handleSort('joiningDate')} className="cursor-pointer text-left py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                        <div className="flex items-center gap-1">Joining Date {sortConfig?.key === 'joiningDate' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}</div>
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAndSortedRows.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${r.color} rounded-full flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-sm">{r.avatar}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{r.firstName} {r.lastName}</p>
                                                    {/* <p className="text-xs text-gray-500"></p> */}
                                                    <p className="text-xs text-gray-600"># {r.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-medium text-gray-900">{r.role}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-medium text-gray-900">{r.adhaar}</span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{r.joiningDate}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { useEmployeeStore.getState().deleteEmployee(r.id); showToast('Employee deleted successfully!', 'success'); }}
                                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* {!filteredAndSortedRows.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No employees found matching your criteria.</td></tr>
                            )} */}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Overlay Form */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Form Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                                <button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="e.g., John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="e.g., Doe"
                                        />
                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="role"
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="e.g., Software Engineer"
                                        />
                                    </div>
                                    {/* GSTIN */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Adhaar <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="adhaar"
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="e.g., 1234-5678-9012"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="email" // Note the dot notation
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="e.g., john.doe@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="e.g., 123-456-7890"
                                        />
                                    </div>
                                </div>

                                {/* Form Footer */}
                                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        disabled={submitting}
                                        onClick={handleCancel}
                                        className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg shadow-blue-200 transition-all ${submitting ? "bg-blue-400" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}
                                    >
                                        {submitting ? "Creating..." : "Create Employee"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}

