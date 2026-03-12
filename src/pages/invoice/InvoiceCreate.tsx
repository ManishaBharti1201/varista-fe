import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, ChevronDown, ReceiptText, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { endpoints } from '../../config/urls';
import { useCompanyStore } from "../../store/CompanyStore";
import { Toast } from "../../components/Toast";
import { apiRequest } from "../../utils/apiClient";

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { companies, fetchCompanies } = useCompanyStore();
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const [invoice, setInvoice] = useState<any>({
    taxAmt: 0.0,
    taxRate: '',
    totalAmt: 0.0,
    buyerId: 0,
    items: [{ description: "", hsnSac: "", quantity: "", rate: "", unit: "Pcs", amount: 0 }],
  });

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select Company");

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const updateField = (field: string, value: any) => {
    setInvoice((p: any) => ({ ...p, [field]: value }));
    if (errors[field] || (field === "buyerId" && errors.buyer)) {
      setErrors((prev: any) => {
        const { buyer, ...rest } = prev;
        return rest;
      });
    }
  };

  const calculateTotals = (items: any[], taxRate: number) => {
    const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat((subtotal + taxAmount).toFixed(2))
    };
  };

  const updateItemField = (index: number, field: string, value: any) => {
    setInvoice((prev: any) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = Math.round((qty * rate + Number.EPSILON) * 100) / 100;

      const { taxAmount, totalAmount } = calculateTotals(newItems, prev.taxRate);
      return { ...prev, items: newItems, taxAmt: taxAmount, totalAmt: totalAmount };
    });
  };

  const updateTaxRate = (rate: string) => {
    const newRate = parseFloat(rate) || 0;
    setInvoice((prev: any) => {
      const { taxAmount, totalAmount } = calculateTotals(prev.items, newRate);
      return { ...prev, taxRate: rate, taxAmt: taxAmount, totalAmt: totalAmount };
    });
  };

  const addItem = () => setInvoice((p: any) => ({
    ...p,
    items: [...p.items, { description: "", hsnSac: "", quantity: 1, rate: 0, unit: "Pcs", amount: 0 }]
  }));

  const removeItem = (idx: number) => {
    const newItems = invoice.items.filter((_: any, i: number) => i !== idx);
    const { taxAmount, totalAmount } = calculateTotals(newItems, parseFloat(invoice.taxRate) || 0);
    setInvoice((p: any) => ({ ...p, items: newItems, taxAmt: taxAmount, totalAmt: totalAmount }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!invoice.buyerId || invoice.buyerId === 0) newErrors.buyer = "Client is required";
    if (invoice.items.length === 0) newErrors.items = "Add at least one item";
    const itemErrors = invoice.items.map((item: any) => {
      const e: any = {};
      if (!item.description.trim()) e.description = "Required";
      if (parseFloat(item.quantity) <= 0) e.quantity = "Invalid";
      return Object.keys(e).length > 0 ? e : null;
    });
    if (itemErrors.some((e: any) => e !== null)) newErrors.itemDetails = itemErrors;
    return newErrors;
  };

  const submit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fill all required fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest(endpoints.invoiceCreate(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });

      if (res.ok) {
        showToast("Invoice created successfully!");
        setTimeout(() => navigate("/invoices/manage"), 1500);
      } else {
        showToast("Failed to create invoice", "error");
      }
    } catch (err: any) {
      setErrors((p: any) => ({ ...p, server: String(err?.message || err) }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-10">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-100">
              <ReceiptText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Create Invoice</h3>
              <p className="text-xs md:text-sm text-slate-500">Draft a new billing statement</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-8">
          {/* Client Selection */}
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Billing To</label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-100 
                ${errors.buyer ? "border-red-500 ring-1 ring-red-50" : "border-slate-300 text-slate-700 hover:border-slate-400"}`}
              >
                <span className="truncate">{selected}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="absolute left-0 z-20 mt-1 w-full rounded-lg bg-white shadow-xl border border-slate-200 py-1 max-h-60 overflow-auto">
                  {companies.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => { setSelected(client.name); updateField("buyerId", client.id); setIsOpen(false); }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.buyer && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.buyer}</p>}
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Line Items</h4>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 md:hidden">
              {invoice.items.map((it: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                  <button 
                    onClick={() => removeItem(idx)}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                      <input
                        value={it.description}
                        onChange={(e) => updateItemField(idx, "description", e.target.value)}
                        className="w-full bg-transparent border-b border-slate-300 py-1 text-sm focus:border-blue-500 outline-none"
                        placeholder="Service/Product name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Qty</label>
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 py-1 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Rate</label>
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => updateItemField(idx, "rate", e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 py-1 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-xs font-medium text-slate-500">Total:</span>
                      <span className="font-bold text-slate-900">₹{(it.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left w-32">HSN/SAC</th>
                    <th className="py-3 px-4 text-left w-20">Qty</th>
                    <th className="py-3 px-4 text-left w-28">Rate</th>
                    <th className="py-3 px-4 text-left w-28">Unit</th>
                    <th className="py-3 px-4 text-right w-28">Amount</th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((it: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <input
                          value={it.description}
                          onChange={(e) => updateItemField(idx, "description", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border-slate-200 border focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={it.hsnSac}
                          onChange={(e) => updateItemField(idx, "hsnSac", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border-slate-200 border outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border-slate-200 border outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => updateItemField(idx, "rate", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border-slate-200 border outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <select 
                          value={it.unit} 
                          onChange={(e) => updateItemField(idx, "unit", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border-slate-200 border outline-none bg-white"
                        >
                          <option value="mandays">Mandays</option>
                          <option value="Pcs">Pcs</option>
                          <option value="kg">kg</option>
                        </select>
                      </td>
                      <td className="p-3 text-right font-medium">₹{it.amount}</td>
                      <td className="p-3">
                        <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-6 border-t border-slate-100">
            <div className="w-full md:w-64">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={invoice.taxRate}
                  onChange={(e) => updateTaxRate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="0.00"
                />
                <Calculator className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="w-full md:w-80 bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax Amount</span>
                <span className="font-semibold text-slate-800">₹{invoice.taxAmt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-blue-600">₹{invoice.totalAmt.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-4">
            <button
              onClick={() => { if(window.confirm("Reset all fields?")) setInvoice({ ...invoice, items: [{ description: "", hsnSac: "", quantity: "", rate: "", unit: "Pcs", amount: 0 }] }); }}
              className="w-full md:w-auto px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
            >
              Discard Draft
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className={`w-full md:w-auto px-8 py-3 text-sm font-bold text-white rounded-lg shadow-lg transition-all 
              ${submitting ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200"}`}
            >
              {submitting ? "Processing..." : "Issue Invoice"}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}