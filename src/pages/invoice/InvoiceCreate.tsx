import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { endpoints, bffBase } from '../../config/urls';
import { ChevronDown } from "lucide-react";
import { useCompanyStore } from "../../store/CompanyStore";

export default function InvoiceCreate() {
  console.log("Provider rendering");
  const navigate = useNavigate();

  const { companies, fetchCompanies, loading } = useCompanyStore();
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const [invoice, setInvoice] = useState<any>({
    taxAmt: 0.0,
    taxRate: 0.0,
    totalAmt: 0.0,
    buyerId: 0,
    items: [
      {
        description: "",
        hsnSac: "",
        quantity: 1,
        rate: 0.0,
        unit: "Pcs",
        amount: 0.0,
      }
    ],
  });

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select Client");

  const updateField = (field: string, value: any) =>
    setInvoice((p: any) => ({ ...p, [field]: value }));

  // Helper to sum item amounts
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

      // Update item amount
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = Math.round((qty * rate + Number.EPSILON) * 100) / 100;

      const { taxAmount, totalAmount } = calculateTotals(newItems, prev.taxRate);
      return { ...prev, items: newItems, taxAmount, totalAmount };
    });
  };

  const updateTaxRate = (rate: string) => {
    const newRate = parseFloat(rate) || 0;
    setInvoice((prev: any) => {
      const { taxAmount, totalAmount } = calculateTotals(prev.items, newRate);
      return { ...prev, taxRate: newRate, taxAmt: taxAmount, totalAmt: totalAmount };
    });
  };

  const addItem = () => setInvoice((p: any) => ({
    ...p,
    items: [...p.items, { description: "", hsnSac: "", quantity: 1, rate: 0, unit: "Pcs", amount: 0 }]
  }));

  const removeItem = (idx: number) =>
    setInvoice((p: any) => ({
      ...p,
      items: p.items.filter((_: any, i: number) => i !== idx),
    }));


  const submit = async () => {
    setSubmitting(true);
    setErrors((p: any) => ({ ...p, server: undefined }));
    try {
      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      console.log("Submitting invoice", endpoints.invoiceCreate(), headers, invoice);

      const res = await fetch(endpoints.invoiceCreate(), {
        method: "POST",
        headers,
        body: JSON.stringify(invoice),
      });

      const ct = res.headers.get("content-type") || "";
      let body: any = null;
      if (ct.includes("application/json")) body = await res.json();
      else body = await res.text();

      if (!res.ok) {
        const msg =
          (body && body.message) || body || res.statusText || "Server error";
        setErrors((p: any) => ({ ...p, server: String(msg) }));
        return;
      }

      // success -> navigate to list
      navigate("/invoices/manage");
    } catch (err: any) {
      setErrors((p: any) => ({ ...p, server: String(err?.message || err) }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            📋
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Create Invoice</h3>
            <p className="text-sm text-slate-600">
              Generate new invoices for clients
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative inline-block text-left w-80">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
               rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {selected}
            <ChevronDown
              className={`w-50 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white 
                    shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {companies.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelected(client.name);
                      updateField("buyerId", client.id);
                      setIsOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {client.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700">Items</h4>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          {errors.items && (
            <div className="text-sm text-red-600 mb-2">{errors.items}</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2">HSN/SAC</th>
                  <th className="py-2 px-2">Qty</th>
                  <th className="py-2 px-2">Rate</th>
                  <th className="py-2 px-2">Unit</th>
                  <th className="py-2 px-2">Amount</th>
                  <th className="py-2 px-2">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-2">
                      <input
                        value={it.description}
                        onChange={(e) =>
                          updateItemField(idx, "description", e.target.value)
                        }
                        className="w-full px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        value={it.hsnSac}
                        onChange={(e) =>
                          updateItemField(idx, "hsnSac", e.target.value)
                        }
                        className="w-full px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        value={it.quantity}
                        onChange={(e) =>
                          updateItemField(idx, "quantity", e.target.value)
                        }
                        className="w-20 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        value={it.rate}
                        onChange={(e) =>
                          updateItemField(idx, "rate", e.target.value)
                        }
                        className="w-28 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select value={it.unit} onChange={(e) => updateItemField(idx, "unit", e.target.value)}
                        className="w-24 px-2 py-1 rounded border border-slate-200 bg-white" >
                        <option value="mandays">mandays</option>
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">{(it.amount || 0).toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-slate-600">
              Tax Rate
            </label>
            <input
              value={invoice.taxRate}
              onChange={(e) => updateTaxRate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 max-w-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Total Tax Amount</label>
            <h3 className="font-bold text-slate-800 text-lg">{invoice.taxAmt}</h3>
          </div>
          <div>
            <label className="block text-xs text-slate-600">Final  Amount</label>
            <h3 className="font-bold text-slate-800 text-lg">{invoice.totalAmt}</h3>
          </div>
        </div>


        {errors.server && (
          <div className="text-sm text-red-600">{errors.server}</div>
        )}
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg shadow-blue-200 transition-all ${submitting ? "bg-blue-400" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}
          >
            {submitting ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div >
  );
}
