import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Download, Trash2, ChevronUp, ChevronDown, FilterX } from 'lucide-react';
import { useCompanyStore } from '../../store/CompanyStore';
import { endpoints } from '../../config/urls';
import { Toast } from "../../components/Toast";
import { log } from 'util';

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { companies } = useCompanyStore();

  // Search, Filter, and Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: keyof InvoiceRow; direction: 'asc' | 'desc' } | null>(null);

  const getCompanyName = useCallback(
    (clientId: string) => companies.find(c => c.id === clientId || c.name === clientId)?.name || 'Unknown Client',
    [companies]
  );

  // 1. Sort Handler
  const handleSort = (key: keyof InvoiceRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 2. Data Processing (Filtering and Sorting)
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        getCompanyName(r.client).toLowerCase().includes(term) ||
        r.invoiceNo.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(r => r.status === statusFilter);
    }

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

  // 3. API Actions
  const mapInvoice = (inv: any): InvoiceRow => {
    const formatDate = (dateStr: string) => {
      if (!dateStr || dateStr === 'N/A') return 'N/A';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    return {
      invoiceId: inv.invoiceId,
      invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
      client: inv.buyer?.id || inv.buyerId || 'Unknown',
      amount: `₹ ${inv.totalAmount?.toLocaleString() || '0'}`,
      status: inv.status || 'Pending',
      due: formatDate(inv.dated)
    };
  };

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(endpoints.invoiceList());
      if (!resp.ok) throw new Error(`Error: ${resp.status}`);
      const data = await resp.json();
      setRows(data.map(mapInvoice));
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = async (invoiceId: string) => {

    try {
      const resp = await fetch(`${endpoints.invoiceDelete(undefined, invoiceId)}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error(`Delete failed`);
      showToast('Invoice deleted successfully', 'success');
      setRows(prev => prev.filter(r => r.invoiceId !== invoiceId));
    } catch (err) {
      console.error('Delete error', err);
      showToast('Failed to delete invoice', 'error');
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      console.log('Downloading invoice with ID:', invoiceId);
      const response = await fetch(endpoints.invoiceDownload(undefined, invoiceId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/pdf',
        },
      });
      if (!response.ok) throw new Error(`Download failed`);

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
      showToast('Invoice downloaded successfully', 'success');
    } catch (err) {
      console.error('Download error', err);
      showToast('Failed to download invoice', 'error');
    }
  };

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">📄</div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Invoice List</h3>
                <p className="text-sm text-slate-600">View and manage all invoices</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search client or #..."
                  className="pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <FilterX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <select
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-slate-200">
                  <th onClick={() => handleSort('client')} className="cursor-pointer text-left py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <div className="flex items-center gap-1">Client / Invoice # {sortConfig?.key === 'client' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}</div>
                  </th>
                  <th onClick={() => handleSort('amount')} className="cursor-pointer text-left py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <div className="flex items-center gap-1">Amount {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}</div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th onClick={() => handleSort('due')} className="cursor-pointer text-left py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <div className="flex items-center gap-1">Date {sortConfig?.key === 'due' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}</div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                </tr>
              </thead>

              <tbody>
                {!loading && filteredAndSortedRows.map((r) => (
                  <tr key={r.invoiceId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-gray-900">{getCompanyName(r.client)}</p>
                      <p className="text-xs text-gray-500">#{r.invoiceNo}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">{r.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${r.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{r.due}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadInvoice(r.invoiceId)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteInvoice(r.invoiceId)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {loading && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading your invoices...</td></tr>
                )}

                {!loading && filteredAndSortedRows.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">No invoices found matching your criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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