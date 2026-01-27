import React, { useState } from 'react';
import { 
  Menu, Search, LayoutDashboard, Users, Building2, Calendar,
  Clock, DollarSign, Timer, Archive, FileText, File, BarChart3,
  Bell, Shield, Settings, LogOut, ChevronRight, ExternalLink,
  MapPin, Globe, ChevronDown
} from 'lucide-react';

export default function FederalStateLinks() {
  const [activeMenu, setActiveMenu] = useState('Federal & State Links');
  const [selectedState, setSelectedState] = useState('');
  const [showStateLinks, setShowStateLinks] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Users, label: 'Employees' },
    { icon: Building2, label: 'Organization' },
    { icon: Calendar, label: 'Leave Management' },
    { icon: Clock, label: 'Attendance' },
    { icon: DollarSign, label: 'Payroll' },
    { icon: Timer, label: 'Timesheet' },
    { icon: Archive, label: 'Assets' },
    { icon: FileText, label: 'Expenses' },
    { icon: File, label: 'Documents' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Users, label: 'Onboarding' },
    { icon: Bell, label: 'Notifications' }
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'User Management' },
    { icon: Settings, label: 'System Settings' },
    { icon: Globe, label: 'Federal & State Links', active: true }
  ];

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const federalLinks = [
    {
      category: 'Tax & Revenue',
      links: [
        { title: 'IRS - Internal Revenue Service', url: 'https://www.irs.gov', description: 'Federal tax information and filing' },
        { title: 'Social Security Administration', url: 'https://www.ssa.gov', description: 'Social security benefits and information' },
        { title: 'Medicare', url: 'https://www.medicare.gov', description: 'Medicare enrollment and coverage' }
      ]
    },
    {
      category: 'Labor & Employment',
      links: [
        { title: 'Department of Labor', url: 'https://www.dol.gov', description: 'Federal labor standards and regulations' },
        { title: 'EEOC - Equal Employment Opportunity', url: 'https://www.eeoc.gov', description: 'Equal employment opportunity information' },
        { title: 'OSHA - Occupational Safety', url: 'https://www.osha.gov', description: 'Workplace safety and health standards' }
      ]
    },
    {
      category: 'Benefits & Insurance',
      links: [
        { title: 'Healthcare.gov', url: 'https://www.healthcare.gov', description: 'Health insurance marketplace' },
        { title: 'FMLA Information', url: 'https://www.dol.gov/agencies/whd/fmla', description: 'Family and Medical Leave Act details' },
        { title: 'E-Verify', url: 'https://www.e-verify.gov', description: 'Employment verification system' }
      ]
    }
  ];

  const getStateLinks = (selectedState: string) => {
    return [
      {
        category: 'State Tax & Revenue',
        links: [
          { title: `${selectedState} Department of Revenue`, url: '#', description: 'State tax filing and information' },
          { title: `${selectedState} Unemployment Insurance`, url: '#', description: 'Unemployment benefits and claims' },
          { title: `${selectedState} Workers Compensation`, url: '#', description: 'Workers compensation information' }
        ]
      },
      {
        category: 'State Labor & Employment',
        links: [
          { title: `${selectedState} Department of Labor`, url: '#', description: 'State labor laws and regulations' },
          { title: `${selectedState} Wage and Hour Division`, url: '#', description: 'Minimum wage and overtime rules' },
          { title: `${selectedState} Employment Security`, url: '#', description: 'Employment and job services' }
        ]
      },
      {
        category: 'State Business & Compliance',
        links: [
          { title: `${selectedState} Secretary of State`, url: '#', description: 'Business registration and filing' },
          { title: `${selectedState} Business Licensing`, url: '#', description: 'Business license information' },
          { title: `${selectedState} Labor Law Posters`, url: '#', description: 'Required workplace posters' }
        ]
      }
    ];
  };

  const handleStateSelection = (state: string) => {
    setSelectedState(state);
  }

  const handleViewStateLinks = () => {
    if (selectedState) {
      setShowStateLinks(true);
    }
  };

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
              <span className="text-white font-bold text-lg">JA</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">John Admin</h3>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
          </div>
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
            ADMIN
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
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        <div className="flex-1 overflow-y-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Federal & State Links</h1>
            <p className="text-gray-600">Quick access to federal and state compliance resources</p>
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Federal Links Button */}
            <button
              onClick={() => { setShowStateLinks(false); setSelectedState(''); }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-8 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <ExternalLink className="w-6 h-6 text-white/80" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Federal Links</h2>
              <p className="text-blue-100">Access federal government resources and compliance information</p>
            </button>

            {/* State Links Button */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <ExternalLink className="w-6 h-6 text-white/80" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">State Links</h2>
              
              {/* State Selector */}
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateSelection(e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-white border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-gray-900 font-medium appearance-none"
                  >
                    <option value="">Select a State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                </div>
                
                <button
                  onClick={handleViewStateLinks}
                  disabled={!selectedState}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    selectedState
                      ? 'bg-white text-green-600 hover:bg-green-50'
                      : 'bg-white/50 text-green-300 cursor-not-allowed'
                  }`}
                >
                  View State Links
                </button>
              </div>
            </div>
          </div>

          {/* Federal Links Section */}
          {!showStateLinks && !selectedState && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Federal Resources</h2>
              </div>

              {federalLinks.map((section, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
                  <div className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <ExternalLink className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                            {link.title}
                          </h4>
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* State Links Section */}
          {showStateLinks && selectedState && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">{selectedState} Resources</h2>
                </div>
                <button
                  onClick={() => setShowStateLinks(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Back to Selection
                </button>
              </div>

              {getStateLinks(selectedState).map((section, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
                  <div className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-green-50 transition-colors group"
                      >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <ExternalLink className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600">
                            {link.title}
                          </h4>
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These are placeholder links for {selectedState}. Please update with actual state-specific URLs for your implementation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}