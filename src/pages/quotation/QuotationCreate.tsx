import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, ChevronDown, FileText, Calculator, RotateCcw, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { endpoints } from '../../config/urls';
import { useCompanyStore } from "../../store/CompanyStore";
import { Toast } from "../../components/Toast";
import { apiRequest } from "../../utils/apiClient";

export default function QuotationCreate() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { companies, fetchCompanies } = useCompanyStore();
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const [quotation, setQuotation] = useState<any>({
    customerName: '',
    items: [{ description: "", hsnSac: "", quantity: "", rate: "", unit: "Pcs", amount: 0 }],
    taxRate: '',
    taxAmount: 0.0,
    totalAmount: 0.0,
  });

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select Company");

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const calculateTotals = (items: any[], taxRate: number) => {
    const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);
    const taxAmt = (subtotal * taxRate) / 100;
    return {
      taxAmount: parseFloat(taxAmt.toFixed(2)),
      totalAmount: parseFloat((subtotal + taxAmt).toFixed(2))
    };
  };

  const updateField = (field: string, value: any) => {
    setQuotation((p: any) => ({ ...p, [field]: value }));
    if (errors.buyer) setErrors((prev: any) => ({ ...prev, buyer: null }));
  };

  const updateItemField = (index: number, field: string, value: any) => {
    setQuotation((prev: any) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = Math.round((qty * rate + Number.EPSILON) * 100) / 100;

      const { taxAmount, totalAmount } = calculateTotals(newItems, parseFloat(prev.taxRate) || 0);
      return { ...prev, items: newItems, taxAmount, totalAmount };
    });
  };

  const updateTaxRate = (rate: string) => {
    const r = parseFloat(rate) || 0;
    setQuotation((prev: any) => {
      const { taxAmount, totalAmount } = calculateTotals(prev.items, r);
      return { ...prev, taxRate: rate, taxAmount, totalAmount };
    });
  };

  const addItem = () => setQuotation((p: any) => ({
    ...p,
    items: [...p.items, { description: "", hsnSac: "", quantity: 1, rate: 0, unit: "Pcs", amount: 0 }]
  }));

  const removeItem = (idx: number) => {
    const newItems = quotation.items.filter((_: any, i: number) => i !== idx);
    const { taxAmount, totalAmount } = calculateTotals(newItems, parseFloat(quotation.taxRate) || 0);
    setQuotation((p: any) => ({ ...p, items: newItems, taxAmount, totalAmount }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!quotation.buyerId) newErrors.buyer = "Client selection required";
    if (quotation.items.length === 0) newErrors.items = "Add at least one item";
    return newErrors;
  };

  const submit = async () => {
    if (Object.keys(validateForm()).length > 0) return showToast("Check required fields", "error");
    setSubmitting(true);
    try {
      const res = await apiRequest(endpoints.quotationCreate(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quotation, creationDate: new Date().toISOString() }),
      });
      if (res.ok) {
        reset(); // <--- Add this call here
        showToast("Quotation created successfully!");
        setTimeout(() => navigate("/Quotations/manage"), 1500);
      }
    } catch (err: any) {
      setErrors((p: any) => ({ ...p, server: err.message }));
    } finally { setSubmitting(false); }
  };

  const reset = () => {
    setErrors({});
    setQuotation({
      customerName: '',
      buyerId: 0,
      items: [
        {
          description: "",
          hsnSac: "",
          quantity: "",
          rate: "",
          unit: "Pcs",
          amount: 0,
        }
      ],
      taxRate: '',
      taxAmount: 0.0,
      totalAmount: 0.0,
    });
    setSelected("Select Company");
    showToast("Form cleared", "success");
  };

  return (
    <div className="max-w-5xl mx-auto px-2 pb-24 md:pb-12">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">New Quotation</h2>
              <p className="text-sm text-slate-500">Draft professional estimates for clients</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          {/* Client Select */}
          <div className="max-w-md space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Client / Company</label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm transition-all
                ${errors.buyer ? "border-red-400 bg-red-50" : "border-slate-300 hover:border-indigo-400"}`}
              >
                <span className={selected === "Select Company" ? "text-slate-400" : "text-slate-900 font-medium"}>
                  {selected}
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl py-1 max-h-64 overflow-y-auto">
                  {companies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelected(c.name); updateField("buyerId", c.id); updateField("customerName", c.name); setIsOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Service Details</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all"
              >
                <Plus size={18} /> Add Item
              </button>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {quotation.items.map((it: any, idx: number) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative shadow-sm">
                  <button onClick={() => removeItem(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1">
                    <Trash2 size={18} />
                  </button>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                      <input
                        value={it.description}
                        onChange={(e) => updateItemField(idx, "description", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                        placeholder="Service description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Qty</label>
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Rate</label>
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => updateItemField(idx, "rate", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-500">Item Total</span>
                      <span className="text-lg font-black text-slate-900">₹{(it.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-4 text-left">Description</th>
                    <th className="py-4 px-4 text-left w-24">Qty</th>
                    <th className="py-4 px-4 text-left w-32">Rate</th>
                    <th className="py-4 px-4 text-left w-28">Unit</th>
                    <th className="py-4 px-4 text-right w-32">Amount</th>
                    <th className="py-4 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items.map((it: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <input
                          value={it.description}
                          onChange={(e) => updateItemField(idx, "description", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-400 outline-none transition-all"
                        />
                      </td>
                      <td className="p-3"><input type="number" value={it.quantity} onChange={(e) => updateItemField(idx, "quantity", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none" /></td>
                      <td className="p-3"><input type="number" value={it.rate} onChange={(e) => updateItemField(idx, "rate", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none" /></td>
                      <td className="p-3">
                        <select value={it.unit} onChange={(e) => updateItemField(idx, "unit", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white">
                          <option value="mandays">mandays</option>
                          <option value="Pcs">Pcs</option>
                          <option value="kg">kg</option>
                        </select>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{(it.amount || 0).toFixed(2)}</td>
                      <td className="p-3"><button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6">
            <div className="w-full md:w-72 space-y-2">
              <label className="text-sm font-bold text-slate-700">Tax Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={quotation.taxRate}
                  onChange={(e) => updateTaxRate(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                  placeholder="e.g. 18"
                />
                <Calculator className="absolute right-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="w-full md:w-96 bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
              <div className="space-y-3">
                <div className="flex justify-between text-indigo-200 text-sm">
                  <span>Tax Amount</span>
                  <span className="font-mono">₹{quotation.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-indigo-800">
                  <span className="text-sm font-bold text-indigo-200">Total Estimate</span>
                  <span className="text-3xl font-black">₹{quotation.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Bottom bar for mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex gap-3 md:relative md:bg-transparent md:border-0 md:p-0 md:justify-end">
            <button
              onClick={reset}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
            >
              <RotateCcw size={18} /> <span className="md:inline">Reset</span>
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-10 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-400 transition-all"
            >
              {submitting ? "Sending..." : <><Send size={18} /> Create Quotation</>}
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}