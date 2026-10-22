
// Centralized URLs and endpoint builders for the app
const envBff = (window as any)._env_?.REACT_APP_BFF_URL || process.env.REACT_APP_BFF_URL || '';

// Keep empty string for same-origin proxy when not set
export const bffBase: string = envBff || 'https://bff.coresmith.duckdns.org';

export const endpoints = {
  clients: (base: string = bffBase) => `${base || ''}/api/clients`,
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
  invoiceReplace: (base: string = bffBase, id: string) => `${base || ''}/api/invoice/${id}/replace`,
  companyCreate: (base: string = bffBase) => `${base || ''}/api/company/create`,
  companyUpdate: (base: string = bffBase, id: string) => `${base || ''}/api/company/${id}/update`,
  companiesList: (base: string = bffBase) => `${base || ''}/api/company/all`,
  employeesList: (base: string = bffBase) => `${base || ''}/api/employee/all`,
  employeeUpsert: (base: string = bffBase) => `${base || ''}/api/employee/upsert`,
  employeeDelete: (base: string = bffBase, id: string) => `${base || ''}/api/employee/${id}`,
  timesheetUpload: (base: string = bffBase) => `${base || ''}/api/timesheet/upload`,
  timesheetGet: (base: string = bffBase, id: string) => `${base || ''}/api/timesheet/${id}/fetch`,
  notificationList: (base: string = bffBase) => `${base || ''}/api/notification/all`,
  health: (base: string = bffBase) => `${base || ''}/api/health`,
  holidayList: (base: string = bffBase) => `${base || ''}/api/holiday/all`,
  holidayCreate: (base: string = bffBase) => `${base || ''}/api/holiday/create`,
  holidayDelete: (base: string = bffBase) => `${base || ''}/api/holiday/delete`,
  blobs: (base: string = bffBase) => `${base || ''}/api/blobs`,
  blobDownload: (base: string = bffBase, id: string) => `${base || ''}/api/blob/${id}/download`,
  blobDelete: (base: string = bffBase, id: string) => `${base || ''}/api/blob/${id}`,
};

export default {
  bffBase,
  endpoints,
};
