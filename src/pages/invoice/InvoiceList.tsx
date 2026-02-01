import React, { useEffect, useState, useCallback } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useCompanyStore } from '../../store/CompanyStore';
import { endpoints } from '../../config/urls';

interface InvoiceRow {
  invoiceId: string;
  invoiceNo: string;
  client: string;
  amount: string;
  status: string;
  due: string;
}

export default function InvoiceList() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const { companies } = useCompanyStore();

  // -----------------------------
  // Helpers
  // -----------------------------
  const getCompanyName = useCallback(
    (clientId: string) => companies.find(c => c.id === clientId)?.name || clientId,
    [companies]
  );

  const mapInvoice = (inv: any): InvoiceRow => {
    // Helper to format date strings to dd-MM-yyyy
    const formatDate = (dateStr: string) => {
      if (!dateStr || dateStr === 'N/A') return 'N/A';

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    };

    return {
      invoiceId: inv.invoiceId,
      invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
      client: inv.buyer?.id || 'Unknown',
      amount: `₹ ${inv.totalAmount?.toLocaleString()}`,
      status: inv.status || 'Pending',
      due: formatDate(inv.dated) // Applied the fix here
    };
  };


  const loadInvoices = useCallback(async () => {
    try {
      const resp = await fetch(endpoints.invoiceList());
      if (!resp.ok) throw new Error(`BFF error: ${resp.status}`);

      const data = await resp.json();
      setRows(data.map(mapInvoice));

    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(
    (invoiceId: string) => async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        console.log('Deleting invoice', invoiceId);
        const resp = await fetch(`${endpoints.invoiceDelete(undefined, invoiceId)}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error(`Delete failed: ${resp.status}`);

        setRows(prev => prev.filter(r => r.invoiceId !== invoiceId));
      } catch (err) {
        console.error('Failed to delete invoice', err);
      }
    },
    []
  );

  // download the invoice pdf on the systemm upon download button is clicked

  const downloadInvoice = useCallback(
    (invoiceNo: string) => async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        console.log('Downloading invoice', invoiceNo);

        // 1. Fetch the data manually to include headers
        const response = await fetch(endpoints.invoiceDownload(undefined, invoiceNo), {
          method: 'GET',
          headers: {
            // Replace with your actual token retrieval logic
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error(`Download failed with status: ${response.status}`);
        }

        // 2. Get the response as a Blob (Binary Large Object)
        const blob = await response.blob();

        // 3. Create a temporary URL for the Blob
        const downloadUrl = window.URL.createObjectURL(blob);

        // 4. Create a hidden link and click it to trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${invoiceNo}.pdf`);
        document.body.appendChild(link);
        link.click();

        // 5. Cleanup: remove link and revoke the URL to save memory
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

      } catch (err) {
        console.error('Failed to download invoice', err);
        // Optional: Add a notification/toast here for the user
      }
    },
    []
  );




  // -----------------------------
  // Load invoices on mount
  // -----------------------------
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">📄</div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Invoice List</h3>
            <p className="text-sm text-slate-600">View and manage all invoices</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Invoice #</th>                
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Created Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.invoiceId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold text-gray-900">{companies.find(c => c.id === r.client)?.name || 'Unknown Client'}</p>
                    {/* <p className="text-xs text-gray-500"></p> */}
                    <p className="text-sm text-gray-500">Invoice No: #{r.invoiceNo}</p>
                  </td>                  
                  <td className="py-4 px-4">
                     <span className="text-sm text-gray-900">{r.amount}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${r.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{r.due}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="Download"
                        className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                        onClick={downloadInvoice(r.invoiceNo)}
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>

                      <button
                        title="Delete"
                        className="p-2 bg-red-50 rounded-md hover:bg-red-100"
                        onClick={deleteInvoice(r.invoiceId)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-slate-500">
                    Loading invoices…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-slate-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
