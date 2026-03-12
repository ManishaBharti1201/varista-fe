import React, { useEffect, useState } from 'react';
import { 
  Search, Mail, Phone, Users, X, 
  IndianRupee, Plus, Filter, ShieldCheck, 
  Briefcase, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { useCompanyStore } from '../store/CompanyStore';
import { Toast } from '../components/Toast';

export default function ClientMgmt() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { companies, fetchCompanies, createCompany, updateCompany } = useCompanyStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    address: { addressLine1: '', addressLine2: '', cityStateZip: '' }
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCompanies();
      useCompanyStore.getState().updateCompanyVisuals();
    };
    loadData();
  }, [fetchCompanies]);

  const stats = [
    { label: 'Total Clients', value: companies.length, icon: Users, color: 'indigo' },
    { label: 'Pending Dues', value: `₹${companies.reduce((acc, c) => acc + (c.ledgerBalance > 0 ? c.ledgerBalance : 0), 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'rose' },
    { label: 'Active Projects', value: '12', icon: Briefcase, color: 'amber' },
    { label: 'Compliance Rate', value: '94%', icon: ShieldCheck, color: 'emerald' }
  ];

  // Logic handlers remain the same as your original snippet...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof typeof prev] as object), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (amount <= 0) return alert("Enter valid amount");
    setIsUpdatingPayment(true);
    try {
      await updateCompany({ ...selectedClient, ledgerBalance: selectedClient.ledgerBalance - amount });
      showToast(`Payment recorded: ₹${amount}`, 'success');
      setShowPaymentModal(false);
      setPaymentAmount('');
    } catch (err) {
      showToast("Update failed", 'error');
    } finally { setIsUpdatingPayment(false); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', gstin: '', address: { addressLine1: '', addressLine2: '', cityStateZip: '' } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCompany(formData);
      showToast("Client added successfully");
      handleCancel();
    } catch (err) { showToast("Error adding client", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* 1. Brand Header with Stats Integration */}
      <div className="bg-[#1A233A] px-6 py-10 md:px-12 md:py-16 text-white rounded-b-[3rem] relative overflow-hidden shadow-2xl mb-8">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Client Directory</h1>
              <p className="text-slate-400 font-medium mt-1">Manage business partners and financial ledgers</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
              Register New Partner
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[2rem]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 
                  ${stat.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-300' :
                    stat.color === 'rose' ? 'bg-rose-500/20 text-rose-300' :
                    stat.color === 'amber' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl md:text-2xl font-black text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* 2. Main List Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          {/* Search/Filter Bar */}
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 bg-white">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company name, ID, or GSTIN..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 text-slate-400 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Filter size={16} /> Filter Results
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Partner Identity</th>
                  <th className="px-6 py-5">Financial Status</th>
                  <th className="px-6 py-5">Registration</th>
                  <th className="px-6 py-5">Direct Contact</th>
                  <th className="px-8 py-5 text-right">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map((client, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${client.color || 'bg-indigo-100'} rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                          {client.avatar}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{client.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">GST: {client.gstin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${client.ledgerBalance <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {client.ledgerBalance <= 0 ? <CheckCircle2 size={12}/> : <IndianRupee size={12}/>}
                        ₹{client.ledgerBalance.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600">{client.createdAt}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">ID: #{client.id}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-bold space-y-1">
                        <p className="flex items-center gap-2 text-slate-600"><Mail size={12} className="text-slate-300"/> {client.email}</p>
                        <p className="flex items-center gap-2 text-slate-600"><Phone size={12} className="text-slate-300"/> {client.phone}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => {setShowPaymentModal(true); setSelectedClient(client);}}
                        disabled={client.ledgerBalance <= 0}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-20"
                        title="Record Payment"
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-50">
            {companies.map((client, idx) => (
              <div key={idx} className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${client.color} rounded-[1.25rem] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100`}>
                      {client.avatar}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{client.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{client.id}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${client.ledgerBalance <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    ₹{client.ledgerBalance.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <Mail size={18} className="text-slate-300" /> 
                    <span className="text-xs font-bold truncate">{client.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => {setShowPaymentModal(true); setSelectedClient(client);}}
                  disabled={client.ledgerBalance <= 0}
                  className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/10 disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  <ArrowUpRight size={16} /> Settle Account
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Modal Layer (Full-screen Mobile, Card Desktop) */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:flex md:items-center md:justify-center overflow-y-auto p-4">
          <div className="bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex items-center justify-between p-8 border-b border-slate-50 sticky top-0 bg-white md:rounded-t-[3rem] z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add New Partner</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Onboarding SYNCRA Client</p>
              </div>
              <button onClick={handleCancel} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Official Company Name</label>
                  <input name="name" onChange={handleInputChange} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="e.g. Acme Workforce Solutions" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Tax Identifier (GSTIN)</label>
                  <input name="gstin" onChange={handleInputChange} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="27XXXXX0000X1Z5" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Primary Contact</label>
                  <input name="phone" type="tel" onChange={handleInputChange} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="+91 98765 43210" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Registered Billing Address</label>
                  <div className="space-y-4">
                    <input name="address.addressLine1" placeholder="Building, Street, Area" onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    <input name="address.cityStateZip" placeholder="City, State, Zip Code" onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button type="button" onClick={handleCancel} className="order-2 md:order-1 flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-[1.5rem] hover:bg-slate-100 transition-colors">Dismiss</button>
                <button type="submit" disabled={submitting} className="order-1 md:order-2 flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 active:scale-95 transition-all">
                  {submitting ? "Processing Registry..." : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 bg-emerald-600 text-white relative">
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={18} /></button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/60 mb-1">Settlement for</p>
              <h3 className="text-xl font-black truncate pr-8">{selectedClient?.name}</h3>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-4xl font-black text-slate-900">₹{selectedClient?.ledgerBalance.toLocaleString('en-IN')}</p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</div>
                   <input
                    type="number"
                    autoFocus
                    placeholder="0.00"
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-center text-2xl font-black focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <button
                  disabled={isUpdatingPayment || !paymentAmount}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-30"
                >
                  {isUpdatingPayment ? "Syncing Ledger..." : "Authorize Payment"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}