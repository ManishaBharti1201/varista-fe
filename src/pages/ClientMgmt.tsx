import React, { useState } from 'react'; // Added useState
import { Search, ChevronDown, Mail, Phone, Users, Calendar, Building2, Download, X } from 'lucide-react';
// Removed conflicting import { clients } from '../data/clients';

export default function ClientMgmt() {
  const stats = [
    { label: 'Total Clients', value: '5', icon: Users, color: 'blue' },
    { label: 'Active', value: '5', icon: Users, color: 'green' },
    { label: 'On Leave', value: '0', icon: Calendar, color: 'yellow' },
    { label: 'Departments', value: '5', icon: Building2, color: 'purple' }
  ];

  const [clients, setClients] = useState([
    {
      id: 'EMP001',
      name: 'John Admin',
      role: 'System Administrator',
      department: 'IT',
      status: 'active',
      joiningDate: '1/15/2020',
      email: 'admin@company.com',
      phone: '+123456789',
      initials: 'JA',
      color: 'bg-blue-500',
    },
    {
      id: 'EMP002',
      name: 'Sarah HR',
      role: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      joiningDate: '3/20/2019',
      email: 'hr@company.com',
      phone: '+123456782',
      initials: 'SH',
      color: 'bg-cyan-500',
    }
  ]);


  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    status: 'active',
    joiningDate: '',
    email: '',
    phone: ''
  });

  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-cyan-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateEmployeeId = () => {
    const maxId = clients.reduce((max, client) => {
      const num = parseInt(client.id.replace('EMP', ''));
      return num > max ? num : max;
    }, 0);
    return `EMP${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    setSubmitting(true);
    e.preventDefault();
    const newClient = {
      id: generateEmployeeId(),
      name: formData.name,
      role: formData.role,
      department: formData.department,
      status: formData.status,
      joiningDate: new Date(formData.joiningDate).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }),
      email: formData.email,
      phone: formData.phone,
      initials: generateInitials(formData.name),
      color: generateColor()
    };

    setClients(prev => [...prev, newClient]);
    setShowForm(false);
    setFormData({
      name: '',
      role: '',
      department: '',
      status: 'active',
      joiningDate: '',
      email: '',
      phone: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      name: '',
      role: '',
      department: '',
      status: 'active',
      joiningDate: '',
      email: '',
      phone: ''
    });
  };



  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
          <p className="text-gray-600">Manage and view client information</p>
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

      {/* Client Directory */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or client ID..."
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
            + Add New Client
          </button>
        </div>

        {/* Client Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joining Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${client.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{client.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.role}</p>
                        <p className="text-xs text-gray-400">{client.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{client.department}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{client.joiningDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
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
              <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
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
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g., System Administrator"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select a department</option>
                    <option value="IT">IT</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="email@company.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+1234567890"
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
                  {submitting ? "Creating..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

