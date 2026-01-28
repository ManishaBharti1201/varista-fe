import { useState } from "react";
import InvoiceCreate from "./invoice/InvoiceCreate";
import InvoiceList from "./invoice/InvoiceList";

export default function HRMSSystemSettings() {
  const [activeTab, setActiveTab] = useState("Create Invoice");

  const tabs = ["Create Invoice", "Manage Invoices"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Invoice Management
            </h2>
            <p className="text-slate-600">
              Manage invoices and billing information
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-slate-200">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Create Invoice" ? (
            <InvoiceCreate />
          ) : (
            <InvoiceList />
          )}

          {/* Info Card */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Note:</span> Ensure all
                  invoice details are accurate before sending to clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
