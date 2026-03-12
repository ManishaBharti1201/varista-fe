import React, { useState } from 'react';
import {
  ChevronRight, ExternalLink,
  MapPin, Globe, ChevronDown, Landmark, ShieldCheck, Briefcase
} from 'lucide-react';

export default function CentralStateLinks() {
  const [selectedState, setSelectedState] = useState('');
  const [showStateLinks, setShowStateLinks] = useState(false);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
  ];

  const centralLinks = [
    {
      category: 'Tax & Revenue',
      icon: <Landmark className="text-indigo-600" size={20} />,
      links: [
        { title: 'Income Tax Department', url: 'https://www.incometax.gov.in', description: 'Central tax filing, PAN services, and compliance.' },
        { title: 'GST Portal', url: 'https://www.gst.gov.in', description: 'Goods and Services Tax registration and returns.' },
        { title: 'EPFO Services', url: 'https://www.epfindia.gov.in', description: 'Employee Provident Fund management and tracking.' }
      ]
    },
    {
      category: 'Labor & Compliance',
      icon: <ShieldCheck className="text-emerald-600" size={20} />,
      links: [
        { title: 'Ministry of Labour', url: 'https://labour.gov.in', description: 'Central labor standards, safety, and regulations.' },
        { title: 'ESIC Portal', url: 'https://www.esic.gov.in', description: 'Employee State Insurance Corporation services.' },
        { title: 'Shram Suvidha', url: 'https://shramsuvidha.gov.in', description: 'Unified portal for Labor and Employment compliance.' }
      ]
    }
  ];

  const getStateLinks = (state: string) => [
    {
      category: `${state} Tax & Revenue`,
      icon: <Landmark className="text-indigo-600" size={20} />,
      links: [
        { title: `${state} Commercial Taxes`, url: '#', description: 'State-specific professional tax and VAT info.' },
        { title: 'State Revenue Portal', url: '#', description: 'Local revenue and land record compliance.' }
      ]
    },
    {
      category: 'Labor & Business',
      icon: <Briefcase className="text-emerald-600" size={20} />,
      links: [
        { title: `${state} Labour Dept.`, url: '#', description: 'State-specific labor laws and shop act licenses.' },
        { title: 'Employment Exchange', url: '#', description: 'State employment services and skill registry.' }
      ]
    }
  ];

  const handleStateSelection = (state: string) => {
    setSelectedState(state);
    setShowStateLinks(!!state);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* 1. Brand Header */}
      <div className="bg-[#1A233A] px-6 py-10 md:px-12 md:py-16 text-white rounded-b-[3rem] relative overflow-hidden shadow-2xl mb-8">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Compliance Resources</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Central & State Governance Links</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* 2. Top Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Central Trigger */}
          <button
            onClick={() => { setShowStateLinks(false); setSelectedState(''); }}
            className={`p-8 rounded-[2.5rem] transition-all duration-300 group text-left relative overflow-hidden ${
              !showStateLinks ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-900 shadow-sm hover:border-indigo-200'
            }`}
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${!showStateLinks ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                <Globe size={28} />
              </div>
              <h2 className="text-2xl font-black mb-2">Central Links</h2>
              <p className={`text-sm font-medium ${!showStateLinks ? 'text-indigo-100' : 'text-slate-500'}`}>National governance and federal tax resources</p>
            </div>
            {!showStateLinks && <div className="absolute -bottom-4 -right-4 text-white/5"><Globe size={120} /></div>}
          </button>

          {/* State Trigger */}
          <div className={`p-8 rounded-[2.5rem] transition-all duration-300 relative overflow-hidden ${
            showStateLinks ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200' : 'bg-white border border-slate-100 text-slate-900 shadow-sm hover:border-emerald-200'
          }`}>
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${showStateLinks ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                <MapPin size={28} />
              </div>
              <h2 className="text-2xl font-black mb-4">State Specific</h2>
              
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => handleStateSelection(e.target.value)}
                  className={`w-full px-5 py-4 pr-12 rounded-2xl font-black text-xs uppercase tracking-widest appearance-none outline-none border-2 transition-all ${
                    showStateLinks 
                    ? 'bg-emerald-700/30 border-emerald-400/30 text-white placeholder-emerald-200' 
                    : 'bg-slate-50 border-slate-100 text-slate-900'
                  }`}
                >
                  <option value="" className="text-slate-900">Select Region...</option>
                  {states.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                </select>
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${showStateLinks ? 'text-emerald-200' : 'text-slate-400'}`} size={20} />
              </div>
            </div>
            {showStateLinks && <div className="absolute -bottom-4 -right-4 text-white/5"><MapPin size={120} /></div>}
          </div>
        </div>

        {/* 3. Links Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 px-2">
            <div className={`w-1 h-8 rounded-full ${showStateLinks ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {showStateLinks ? `${selectedState} Resources` : 'National Resources'}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(showStateLinks ? getStateLinks(selectedState) : centralLinks).map((section, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    {section.icon}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">{section.category}</h4>
                </div>

                <div className="space-y-3">
                  {section.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-md transition-all group/link"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover/link:text-indigo-600 transition-colors shadow-sm">
                        <ExternalLink size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900 group-hover/link:text-indigo-600 transition-colors">{link.title}</p>
                        <p className="text-[11px] font-bold text-slate-400 leading-tight mt-0.5">{link.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover/link:text-indigo-600 transition-all group-hover/link:translate-x-1" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {showStateLinks && (
            <div className="flex gap-4 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
               <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
               <p className="text-[11px] font-black text-indigo-900/60 uppercase tracking-widest leading-relaxed">
                 Disclaimer: External state portals may require regional language selection or specific browser extensions for digital signatures.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}