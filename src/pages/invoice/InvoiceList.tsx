import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Download, Trash2, ChevronUp, ChevronDown, 
  Check, FileUp, Search, Receipt, Calendar, 
  MoreHorizontal, FileText, Filter, AlertCircle, X
} from 'lucide-react';
import { useCompanyStore } from '../../store/CompanyStore';
import { endpoints } from '../../config/urls';
import { Toast } from "../../components/Toast";
import { apiRequest } from '../../utils/apiClient';
import { downloadPdf } from '../../utils/downloadPdf';
import { formatDateOnly } from '../../utils/dateTime';

interface InvoiceRow {
  invoiceId: string;
  invoiceNo: string;
  client: string;
  amount: string;
  status: string;
  due: string;
}

export default function InvoiceList() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { companies } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof InvoiceRow; direction: 'asc' | 'desc' } | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const getCompanyName = useCallback(
    (clientId: string) => companies.find(c => c.id === clientId || c.name === clientId)?.name || 'Unknown Client',
    [companies]
  );

  const handleSort = (key: keyof InvoiceRow) => {
    let direction: 'asc' | 'desc' = (sortConfig?.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => getCompanyName(r.client).toLowerCase().includes(term) || r.invoiceNo.toLowerCase().includes(term));
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
  }, [rows, searchTerm, statusFilter, sortConfig, getCompanyName]);

  const mapInvoice = (inv: any): InvoiceRow => ({
    invoiceId: inv.invoiceId,
    invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
    client: inv.buyer?.id || inv.buyerId || 'Unknown',
    amount: `₹${inv.totalAmount?.toLocaleString('en-IN') || '0'}`,
    status: inv.status,
    due: inv.dated ? formatDateOnly(inv.dated) : 'N/A'
  });

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await apiRequest(endpoints.invoiceList(), { method: 'GET' });
      const data = await resp.json();
      setRows(data.map(mapInvoice));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const downloadInvoice = async (id: string) => {
    setDownloadingInvoiceId(id);
    setDownloadError(null);
    try {
      await downloadPdf(endpoints.invoiceDownload(undefined, id), `INV-${id}.pdf`);
      setDownloadError(null);
      showToast('Invoice download started');
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Invoice download failed. Please try again.';
      setDownloadError(message);
      showToast(message, 'error');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const markAsPaid = async (id: string) => {
    if (!window.confirm('Mark this invoice as Paid?')) return;
    try {
      await apiRequest(endpoints.invoiceMarkAsPaid(undefined, id), { method: 'GET' });
      setRows(prev => prev.map(r => r.invoiceId === id ? { ...r, status: 'Paid' } : r));
      showToast('Invoice updated');
    } catch (err) { showToast('Update failed', 'error'); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;
    const formData = new FormData();
    formData.append('filename', file);
    try {
      setLoading(true);
      await apiRequest(endpoints.invoiceReplace(undefined, replacingId), { method: 'POST', body: formData });
      showToast('File replaced!');
      loadInvoices();
    } catch (err) { showToast('Replace failed', 'error'); } finally { setLoading(false); setReplacingId(null); }
  };

  const handleReplaceClick = (invoiceId: string) => {
  setReplacingId(invoiceId);
  // Trigger the hidden file input
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

  useEffect(() => { loadInvoices(); }, [loadInvoices]);


  return (
    <div className="app-page pb-10">
      {/* 1. Header Section */}
      <div className="page-banner md:px-10">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="page-banner-content flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Receipt className="text-emerald-400" size={32} /> Invoice Ledger
            </h1>
            <p className="text-slate-400 font-medium mt-1">Manage billing and payment cycles</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-full md:w-auto">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" placeholder="Search..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 bg-transparent border-none text-sm font-bold text-white placeholder:text-slate-500 focus:ring-0"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
             <select 
               className="bg-transparent border-none text-sm font-black text-emerald-400 focus:ring-0 cursor-pointer pr-8"
               value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
             >
                <option value="All" className="text-slate-900">All</option>
                <option value="Paid" className="text-slate-900">Paid</option>
                <option value="Pending" className="text-slate-900">Pending</option>
             </select>
          </div>
        </div>
      </div>

      {downloadError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-4 mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 md:mx-8"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="text-sm font-bold">Invoice PDF unavailable</p>
            <p className="mt-1 text-sm">{downloadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setDownloadError(null)}
            aria-label="Dismiss invoice download error"
            className="rounded-lg p-1 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        
        {/* Loader */}
        {loading && (
          <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Ledger...</p>
          </div>
        )}

        {/* 3. Mobile Card View (Visible on Small Screens) */}
        {!loading && (
          <div className="grid grid-cols-1 md:hidden gap-4">
            {filteredAndSortedRows.map((r) => (
              <div key={r.invoiceId} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">{getCompanyName(r.client)}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-tight">#{r.invoiceNo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${r.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-y border-slate-50 mb-4">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar size={14}/></div>
                      <span className="text-xs font-bold text-slate-600">{r.due}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                      <p className="text-lg font-black text-slate-900">{r.amount}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => downloadInvoice(r.invoiceId)} disabled={downloadingInvoiceId === r.invoiceId} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:cursor-wait disabled:opacity-60"><Download size={14}/> {downloadingInvoiceId === r.invoiceId ? 'Checking...' : 'PDF'}</button>
                   {r.status !== 'Paid' && (
                     <button onClick={() => markAsPaid(r.invoiceId)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"><Check size={14}/> PAID</button>
                   )}
                   <button onClick={() => setReplacingId(r.invoiceId)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><MoreHorizontal size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Desktop Table View (Hidden on Mobile) */}
        {!loading && (
          <div className="hidden md:block bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th onClick={() => handleSort('client')} className="px-8 py-5 cursor-pointer group">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                        Client / Invoice {sortConfig?.key === 'client' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                      </div>
                    </th>
                    <th onClick={() => handleSort('amount')} className="px-6 py-5 cursor-pointer group">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                        Amount {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th onClick={() => handleSort('due')} className="px-6 py-5 cursor-pointer group text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAndSortedRows.map((r) => (
                    <tr key={r.invoiceId} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                              <FileText size={18} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{getCompanyName(r.client)}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">#{r.invoiceNo}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900">{r.amount}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${r.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-500">{r.due}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => downloadInvoice(r.invoiceId)} disabled={downloadingInvoiceId === r.invoiceId} aria-label={`Download invoice ${r.invoiceNo}`} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:cursor-wait disabled:opacity-60"><Download size={16}/></button>
                           {r.status !== 'Paid' && (
                             <button onClick={() => markAsPaid(r.invoiceId)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Check size={16}/></button>
                           )}
                           <button onClick={() => handleReplaceClick(r.invoiceId)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all"><FileUp size={16}/></button>
                           <button onClick={() => apiRequest(endpoints.invoiceDelete(undefined, r.invoiceId), {method: 'DELETE'}).then(loadInvoices)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedRows.length === 0 && (
          <div className="bg-white rounded-[2.5rem] p-16 shadow-sm border border-slate-100 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter size={32} className="text-slate-300" />
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2">No invoices found</h3>
             <p className="text-slate-500 font-medium">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}