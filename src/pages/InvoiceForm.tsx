// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function formatCurrency(n) {
//   const num = Number(n) || 0;
//   return num.toFixed(2);
// }

// export default function InvoiceForm() {
//   const [customerId, setCustomerId] = useState("");
//   const [customersList, setCustomersList] = useState([]);
//   const [items, setItems] = useState([{ description: "", qty: 1, price: 0 }]);
//   const [taxRate, setTaxRate] = useState(18);
//   const [loading, setLoading] = useState(false);
//   const nav = useNavigate();

//   function addItem() {
//     setItems((prev) => [...prev, { description: "", qty: 1, price: 0 }]);
//   }
//   function removeItem(idx) {
//     setItems((prev) => prev.filter((_, i) => i !== idx));
//   }
//   function updateItem(idx, key, value) {
//     setItems((prev) =>
//       prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
//     );
//   }

//   const subtotal = items.reduce(
//     (s, it) => s + Number(it.qty || 0) * Number(it.price || 0),
//     0
//   );
//   const taxAmount = subtotal * (Number(taxRate || 0) / 100);
//   const total = subtotal + taxAmount;

//   async function handleGenerate(e) {
//     e.preventDefault();
//     if (!customerId) return alert("Please select a customer");
//     if (items.length === 0) return alert("Add at least one line item");

//     setLoading(true);
//     // derive customer name from selected id
//     const selected = customersList.find((c) => c.id === customerId);
//     const customerName = selected ? selected.name : customerId;
//     const payload = {
//       customer: customerName,
//       customerId,
//       items,
//       subtotal,
//       taxRate,
//       taxAmount,
//       total,
//     };
//     try {
//       const resp = await axios.post("/api/generate-invoice", payload, {
//         responseType: "blob",
//       });
//       const blob = new Blob([resp.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       // open PDF in new tab instead of forcing download
//       window.open(url, "_blank");
//       // revoke after a short delay
//       setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
//     } catch (err) {
//       console.error(err);
//       const msg =
//         err?.response?.data?.error ||
//         err.message ||
//         "Failed to generate invoice";
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchCustomers() {
//     try {
//       const resp = await axios.get("/api/customers");
//       setCustomersList(Array.isArray(resp.data) ? resp.data : []);
//       console.log("Fetched customers:", resp.data);
//       // pre-select first customer if none selected
//       if (Array.isArray(resp.data) && resp.data.length && !customerId)
//         setCustomerId(resp.data[0].id);
//     } catch (err) {
//       console.error("Fetch customers error", err);
//     }
//   }

//   useEffect(() => {
//     fetchCustomers();
//   }, []); // Fetch on component mount

//   return (
//     <div className="page center">
//       <form
//         className="card form"
//         onSubmit={handleGenerate}
//         style={{ maxWidth: 520 }}
//       >
//         <h2>Generate Invoice</h2>
//         <div
//           style={{ marginTop: 12, display: "flex", flexDirection: "column" }}
//         >
//           <label style={{ marginBottom: 4 }}>Customer</label>
//           <Select id="dropdown-basic-button" title="Dropdown button" value={customerId} label="Customer"
//             onChange={(e) => setCustomerId(e.target.value)}
//             required>
           
//             <MenuItem value="">Select Customer</MenuItem>
//             {customersList.map((cust) => (
//               <MenuItem key={cust.id} value={cust.id}>
//                 {cust.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </div>

//         <div style={{ marginTop: 8 }}>
//           <h4>Line Items</h4>
//           {items.map((it, idx) => (
//             <div
//               key={idx}
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "200px 60px 60px 60px 60px",
//                 gap: 8,
//                 alignItems: "center",
//                 marginBottom: 8,
//               }}
//             >
//               <input
//                 placeholder="Description"
//                 value={it.description}
//                 onChange={(e) => updateItem(idx, "description", e.target.value)}
//               />
//               <input
//                 placeholder="HSN/SAC"
//                 type="number"
//                 value={it.hsnsac}
//                 onChange={(e) => updateItem(idx, "hsnsac", e.target.value)}
//               />
//               <input
//                 placeholder="Qty"
//                 type="number"
//                 step="10"
//                 value={it.qty}
//                 onChange={(e) => updateItem(idx, "qty", e.target.value)}
//               />
//               <input
//                 placeholder="Rate"
//                 type="number"
//                 value={it.rate}
//                 onChange={(e) => updateItem(idx, "rate", e.target.value)}
//               />
//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => removeItem(idx)}
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//           <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
//             <button type="button" className="btn" onClick={addItem}>
//               Add item
//             </button>
//           </div>
//         </div>

//         <div
//           style={{
//             marginTop: 12,
//             display: "flex",
//             gap: 8,
//             alignItems: "center",
//           }}
//         >
//           <label style={{ minWidth: 80 }}>Tax %</label>
//           <input
//             style={{ width: 120 }}
//             type="number"
//             value={taxRate}
//             onChange={(e) => setTaxRate(e.target.value)}
//           />
//         </div>

//         <div style={{ marginTop: 12 }}>
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <div>Subtotal</div>
//             <div>{formatCurrency(subtotal)}</div>
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <div>Tax</div>
//             <div>{formatCurrency(taxAmount)}</div>
//           </div>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               fontWeight: 700,
//             }}
//           >
//             <div>Total</div>
//             <div>{formatCurrency(total)}</div>
//           </div>
//         </div>

//         <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//           <button type="submit" className="btn primary" disabled={loading}>
//             {loading ? "Generating..." : "Generate & Open"}
//           </button>
//           <button
//             type="button"
//             className="btn"
//             onClick={() => nav("/dashboard")}
//           >
//             Back
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


export default {}