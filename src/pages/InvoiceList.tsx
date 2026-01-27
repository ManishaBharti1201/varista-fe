import React from 'react';
import { Download, Trash2 } from 'lucide-react';

export default function InvoiceList() {
  // placeholder static list; could be replaced with fetch to BFF
  const rows = [
    { inv: 'INV-0001', client: 'Acme Corp', amount: '$1,250.00', status: 'Pending', due: '2026-02-15' },
    { inv: 'INV-0002', client: 'Beta LLC', amount: '$3,400.00', status: 'Paid', due: '2026-01-30' },
  ];

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Invoice #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">{r.inv}</td>
                  <td className="py-4 px-4">{r.client}</td>
                  <td className="py-4 px-4">{r.amount}</td>
                  <td className="py-4 px-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${r.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                  <td className="py-4 px-4">{r.due}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button title="Download" className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"><Download className="w-4 h-4 text-gray-700" /></button>
                      <button title="Delete" className="p-2 bg-red-50 rounded-md hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
