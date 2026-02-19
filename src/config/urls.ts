import QuotationCreate from "../pages/quotation/QuotationCreate";

// Centralized URLs and endpoint builders for the app
const envBff = (window as any)._env_?.REACT_APP_BFF_URL || process.env.REACT_APP_BFF_URL || '';

// Keep empty string for same-origin proxy when not set
export const bffBase: string = envBff || 'http://localhost:4000';

export const endpoints = {
  login: (base: string = bffBase) => `${base || ''}/api/login`,
  updateUser: (base: string = bffBase) => `${base || ''}/api/user/update`,
  resetPassword: (base: string = bffBase, email: string) => `${base || ''}/api/resetpassword/${email}`,
  invoices: (base: string = bffBase) => `${base || ''}/api/invoice`,
  quotationCreate: (base: string = bffBase) => `${base || ''}/api/quotation/create`,
  quotationList: (base: string = bffBase) => `${base || ''}/api/quotation/all`,
  quotationDelete: (base: string = bffBase, id: string) => `${base || ''}/api/quotation/${id}`,
  quotationDownload: (base: string = bffBase, id: string) => `${base || ''}/api/quotation/${id}/download`,
  quotationUpdate: (base: string = bffBase, id: string) => `${base || ''}/api/quotation/${id}/update`,
  invoiceCreate: (base: string = bffBase) => `${base || ''}/api/invoice/create`,
  invoiceList: (base: string = bffBase) => `${base || ''}/api/invoice/all`,
  invoiceDelete: (base: string = bffBase, id: string) => `${base || ''}/api/invoice/${id}`,
  invoiceDownload: (base: string = bffBase, id: string) => `${base || ''}/api/invoice/${id}/download`,
  invoiceMarkAsPaid: (base: string = bffBase, id: string) => `${base || ''}/api/invoice/${id}/mark-as-paid`,
  companyCreate: (base: string = bffBase) => `${base || ''}/api/company/create`,
  companiesList: (base: string = bffBase) => `${base || ''}/api/company/all`,
  employeesList: (base: string = bffBase) => `${base || ''}/api/employee/all`,
  employeeCreate: (base: string = bffBase) => `${base || ''}/api/employee/create`,
  employeeDelete: (base: string = bffBase, id: string) => `${base || ''}/api/employee/${id}`,
  health: (base: string = bffBase) => `${base || ''}/api/health`,
};

export default {
  bffBase,
  endpoints,
};
