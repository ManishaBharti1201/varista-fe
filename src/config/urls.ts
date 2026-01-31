
// Centralized URLs and endpoint builders for the app
const envBff = (window as any)._env_?.REACT_APP_BFF_URL || process.env.REACT_APP_BFF_URL || '';

// Keep empty string for same-origin proxy when not set
export const bffBase: string = envBff || 'http://bff.coresmith.duckdns.org';

export const endpoints = {
  login: (base: string = bffBase) => `${base || ''}/api/login`,
  invoices: (base: string = bffBase) => `${base || ''}/api/invoice`,
  invoiceCreate: (base: string = bffBase) => `${base || ''}/api/invoice/create`,
  invoiceList: (base: string = bffBase) => `${base || ''}/api/invoice/all`,
  invoiceDelete: (base: string = bffBase, id: string) => `${base || ''}/api/invoice/${id}`,
  companies: (base: string = bffBase) => `${base || ''}/api/company/all`,
  health: (base: string = bffBase) => `${base || ''}/api/health`,
};

export default {
  bffBase,
  endpoints,
};
