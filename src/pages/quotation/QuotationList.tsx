import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Download, Trash2, ChevronUp, ChevronDown, FilterX, 
  Search, FileSpreadsheet, Calendar, User, 
  ArrowRight, FileText, Filter, ReceiptText
} from 'lucide-react';
import { useCompanyStore } from '../../store/CompanyStore';
import { endpoints } from '../../config/urls';
import { Toast } from "../../components/Toast";
import { apiRequest } from '../../utils/apiClient';

interface QuotationRow {
  id: string;
  quotationNo: string;
  customerName: string;
  amount: string;
  status: string;
  creationDate: string;
}

export default function QuotationList() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { companies } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: keyof QuotationRow; direction: 'asc' | 'desc' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleSort = (key: keyof QuotationRow) => {
    let direction: 'asc' | 'desc' = (sortConfig?.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.customerName.toLowerCase().includes(term) || 
        r.quotationNo.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "All") result = result.filter(r => r.status === statusFilter);
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];
        if (sortConfig.key === 'amount') {
          aVal = parseFloat(a.amount.replace(/[^0-9.-]+/g, "")) || 0;
          bVal = parseFloat(b.amount.replace(/[^0-9.-]+/g, "")) || 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [rows, searchTerm, statusFilter, sortConfig]);

  const mapQuotation = (est: any): QuotationRow => ({
    id: est.id,
    quotationNo: est.quotationNumber || 'N/A',
    customerName: est.customerName || 'Unknown Customer',
    amount: `₹${est.totalAmount?.toLocaleString('en-IN') || '0'}`,
    status: est.status || 'Pending',
    creationDate: est.creationDate ? new Date(est.creationDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'
  });

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await apiRequest(endpoints.quotationList(), { method: 'GET' });
      const data = await resp.json();
      setRows(data.map(mapQuotation));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const deleteQuotation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await apiRequest(endpoints.quotationDelete(undefined, id), { method: 'DELETE' });
      setRows(prev => prev.filter(r => r.id !== id));
      showToast('Quotation removed');
    } catch (err) { showToast('Delete failed', 'error'); }
  };

  const downloadQuotation = async (id: string) => {
    try {
      const response = await apiRequest(`${endpoints.quotationDownload(undefined, id)}`, { method: 'GET' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `QTN-${id}.pdf`; a.click();
      showToast('Download started');
    } catch (err) { showToast('Download failed', 'error'); }
  };

  useEffect(() => { loadQuotations(); }, [loadQuotations]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* 1. Brand Header */}
      <div className="bg-[#1A233A] px-6 py-10 md:px-12 md:py-16 text-white rounded-b-[3rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <ReceiptText className="text-blue-400" size={32} /> Quotation Hub
            </h1>
            <p className="text-slate-400 font-medium mt-1">Review and manage client proposals</p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-full md:w-auto">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" placeholder="Search client..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 bg-transparent border-none text-sm font-bold text-white placeholder:text-slate-500 focus:ring-0"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
             <select 
               className="bg-transparent border-none text-sm font-black text-blue-400 focus:ring-0 cursor-pointer pr-8"
               value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
             >
                <option value="All" className="text-slate-900">All</option>
                <option value="Paid" className="text-slate-900">Paid</option>
                <option value="Pending" className="text-slate-900">Pending</option>
             </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Fetching Estimates...</p>
          </div>
        )}

        {/* 2. Mobile Card List */}
        {!loading && (
          <div className="grid grid-cols-1 md:hidden gap-4">
            {filteredAndSortedRows.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="max-w-[70%]">
                    <h4 className="font-black text-slate-900 leading-tight truncate">{r.customerName}</h4>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">#{r.quotationNo}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${r.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {r.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-4 border-y border-slate-50 mb-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created On</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Calendar size={12} className="text-blue-500"/> {r.creationDate}
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</p>
                      <p className="text-xl font-black text-slate-900">{r.amount}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => downloadQuotation(r.id)} className="py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Download size={14}/> Download
                   </button>
                   <button onClick={() => deleteQuotation(r.id)} className="py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                      <Trash2 size={14}/> Delete
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Desktop Table View */}
        {!loading && (
          <div className="hidden md:block bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th onClick={() => handleSort('customerName')} className="px-8 py-6 cursor-pointer group">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                        Client Details {sortConfig?.key === 'customerName' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('amount')} className="px-6 py-6 cursor-pointer group">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                        Total Value {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                      </div>
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th onClick={() => handleSort('creationDate')} className="px-6 py-6 cursor-pointer group text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAndSortedRows.map((r) => (
                    <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                              <FileSpreadsheet size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{r.customerName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{r.quotationNo}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black text-slate-900 text-base">{r.amount}</td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${r.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-slate-500">{r.creationDate}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => downloadQuotation(r.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all" title="Download PDF"><Download size={18}/></button>
                           <button onClick={() => deleteQuotation(r.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all" title="Delete"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty Result State */}
        {!loading && filteredAndSortedRows.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 shadow-sm border border-slate-100 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={40} className="text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No results found</h3>
             <p className="text-slate-400 font-medium">Try searching for a different client or number</p>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}