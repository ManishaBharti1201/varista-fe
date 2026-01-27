import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { clients } from "../data/clients";
import { useNavigate } from "react-router-dom";
import { endpoints, bffBase } from '../config/urls';

export default function InvoiceCreate() {
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>({
    buyerid: "345678",
    hsnSac: "85423100",
    centralTaxRate: 9.0,
    stateTaxRate: 9.0,
    stateTaxAmount: 135.0,
    igstAmount: 10.0,
    amountInWords: "One Thousand Seven Hundred Seventy Dollars Only",
    bankName: "First National Bank",
    accountNumber: "987654321012",
    ifscCode: "FNBK0001234",
    items: [
      {
        description: "Laptop Model X",
        hsnSac: "84713010",
        quantity: 1.0,
        rate: 1000.0,
        unit: "Pcs",
        amount: 1000.0,
      },
      {
        description: "Wireless Mouse",
        hsnSac: "84716040",
        quantity: 5.0,
        rate: 100.0,
        unit: "Pcs",
        amount: 500.0,
      },
    ],
  });

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: string, value: any) =>
    setInvoice((p: any) => ({ ...p, [field]: value }));

  const updateItemField = (index: number, field: string, value: any) => {
    setInvoice((prev: any) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      const qty = parseFloat(items[index].quantity) || 0;
      const rate = parseFloat(items[index].rate) || 0;
      items[index].amount =
        Math.round((qty * rate + Number.EPSILON) * 100) / 100;
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setInvoice((p: any) => ({
      ...p,
      items: [
        ...p.items,
        {
          description: "",
          hsnSac: "",
          quantity: 1,
          rate: 0,
          unit: "Pcs",
          amount: 0,
        },
      ],
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

      const res = await fetch(endpoints.invoices(), {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-slate-600">
              Select Client
            </label>
            <select
              value={invoice.buyerid}
              onChange={(e) => {
                const id = e.target.value;
                const c = clients.find((x: any) => x.id === id);
                  updateField("buyerid", id);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 mb-2"
            >
              <option value="">-- Select Client --</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            {/* <h4 className="text-sm font-semibold text-slate-700 mb-3">Buyer</h4> */}

            <label className="block text-xs text-slate-600">
              Buyer Order No
            </label>
            <input
              value={invoice.buyerOrderNo}
              onChange={(e) => updateField("buyerOrderNo", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
        </div>
        <div>
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
                        type="number"
                        value={it.quantity}
                        onChange={(e) =>
                          updateItemField(idx, "quantity", e.target.value)
                        }
                        className="w-20 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={it.rate}
                        onChange={(e) =>
                          updateItemField(idx, "rate", e.target.value)
                        }
                        className="w-28 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        value={it.unit}
                        onChange={(e) =>
                          updateItemField(idx, "unit", e.target.value)
                        }
                        className="w-20 px-2 py-1 rounded border border-slate-200"
                      />
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
              HSN/SAC (Default)
            </label>
            <input
              value={invoice.hsnSac}
              onChange={(e) => updateField("hsnSac", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">
              Central Tax Rate (%)
            </label>
            <input
              type="number"
              value={invoice.centralTaxRate}
              onChange={(e) =>
                updateField("centralTaxRate", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
            {errors.centralTaxRate && (
              <div className="text-xs text-red-600">
                {errors.centralTaxRate}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-600">
              State Tax Rate (%)
            </label>
            <input
              type="number"
              value={invoice.stateTaxRate}
              onChange={(e) =>
                updateField("stateTaxRate", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
            {errors.stateTaxRate && (
              <div className="text-xs text-red-600">{errors.stateTaxRate}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-slate-600">
              State Tax Amount
            </label>
            <input
              type="number"
              value={invoice.stateTaxAmount}
              onChange={(e) =>
                updateField("stateTaxAmount", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">IGST Amount</label>
            <input
              type="number"
              value={invoice.igstAmount}
              onChange={(e) =>
                updateField("igstAmount", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Amount (in words)</label>
            <input
              value={invoice.amountInWords}
              onChange={(e) => updateField("amountInWords", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-slate-600">Bank Name</label>
            <input
              value={invoice.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Account Number</label>
            <input
              value={invoice.accountNumber}
              onChange={(e) => updateField("accountNumber", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">IFSC Code</label>
            <input
              value={invoice.ifscCode}
              onChange={(e) => updateField("ifscCode", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
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
    </div>
  );
}
