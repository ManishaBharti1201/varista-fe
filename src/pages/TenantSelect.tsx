import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, Check, ChevronDown, FileText, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store/TenantStore';

export default function TenantSelect() {
  const navigate = useNavigate();
  const { tenants, loading, error, selectTenant } = useTenantStore();
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedTenant = tenants.find(t => t.id === selected);

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
      setHighlightIdx(-1);
      setSearch('');
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
    setOpen(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx(i => (i < filtered.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx(i => (i > 0 ? i - 1 : filtered.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          handleSelect(filtered[highlightIdx].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const continueToLogin = () => {
    if (!selected) return;
    selectTenant(selected);
    navigate('/login', { replace: true });
  };

  const initials = (name: string) =>
    name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-[#1A233A] p-4 sm:p-6">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <section className="relative my-2 w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white p-6 shadow-2xl shadow-black/20 sm:my-0 sm:rounded-[2rem] sm:p-10">
        <div className="mb-8 flex items-center gap-3 sm:mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A233A] shadow-lg shadow-indigo-900/20">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-slate-900">Syncra</p>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-500">Workforce Hub</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">Choose your workspace</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Select the tenant you want to access to continue securely.</p>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{error}</p>}

        {/* Custom dropdown */}
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" id="tenant-label">Tenant</label>
        <div ref={containerRef} className="relative mt-2" onKeyDown={handleKeyDown}>
          {/* Trigger button */}
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby="tenant-label"
            aria-controls="tenant-listbox"
            disabled={loading}
            onClick={() => setOpen(o => !o)}
            className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left outline-none transition-all sm:p-4 ${
              open
                ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/5'
                : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
            } ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            {selectedTenant ? (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-sm">
                  {initials(selectedTenant.name)}
                </span>
                <span className="flex-1 truncate font-bold text-slate-900">{selectedTenant.name}</span>
              </>
            ) : (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate font-medium text-slate-400">
                  {loading ? 'Loading tenants…' : 'Choose a tenant'}
                </span>
              </>
            )}
            <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-1 sm:left-auto sm:right-0 sm:w-full">
              {/* Search */}
              {tenants.length > 3 && (
                <div className="border-b border-slate-100 p-3">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search tenants…"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setHighlightIdx(-1); }}
                      className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
                      aria-label="Search tenants"
                    />
                  </div>
                </div>
              )}

              {/* Options list */}
              <ul
                ref={listRef}
                id="tenant-listbox"
                role="listbox"
                aria-labelledby="tenant-label"
                className="max-h-[min(16rem,40vh)] overflow-y-auto overscroll-contain py-2 [scrollbar-width:thin]"
              >
                {filtered.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm font-medium text-slate-400">
                    No tenants found
                  </li>
                ) : (
                  filtered.map((tenant, idx) => {
                    const isSelected = tenant.id === selected;
                    const isHighlighted = idx === highlightIdx;
                    return (
                      <li
                        key={tenant.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(tenant.id)}
                        onMouseEnter={() => setHighlightIdx(idx)}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                          isHighlighted ? 'bg-indigo-50' : ''
                        } ${isSelected ? 'bg-indigo-50' : ''}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {initials(tenant.name)}
                        </span>
                        <span className={`flex-1 truncate text-sm ${
                          isSelected ? 'font-bold text-indigo-700' : 'font-medium text-slate-700'
                        }`}>
                          {tenant.name}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        <button onClick={continueToLogin} disabled={!selected || loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
          Continue to login <ArrowRight className="h-5 w-5" />
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure tenant access
        </div>
      </section>
    </main>
  );
}
