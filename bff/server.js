require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
// REMOVE THIS LINE:
// app.use(express.json()); 

// KEEP THESE:
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Service domain configuration (replaceable via .env)
// Frontend (origin) - allowed CORS origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

// Backend service base and login path. By default use the service domain you provided.
const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
// Default to common API path; override with EXTERNAL_AUTH_PATH or EXTERNAL_AUTH_URL in .env
const EXTERNAL_AUTH_PATH = '/user/login';
const EXTERNAL_AUTH_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_AUTH_PATH}`;

const EXTERNAL_RESET_PASSWORD_PATH = '/user/resetPassword/{email}';
const EXTERNAL_RESET_PASSWORD_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_RESET_PASSWORD_PATH}`;

const EXTERNAL_USER_UPDATE_PATH = '/user/update';
const EXTERNAL_USER_UPDATE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_USER_UPDATE_PATH}`;

// External companies endpoint (can be overridden)
const EXTERNAL_COMPANY_LIST_PATH = '/company/all';
const EXTERNAL_COMPANY_LIST_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_COMPANY_LIST_PATH}`;

const EXTERNAL_COMPANY_CREATE_PATH = '/company/create';
const EXTERNAL_COMPANY_CREATE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_COMPANY_CREATE_PATH}`;

// External invoices endpoint (can be overridden)
const EXTERNAL_INVOICE_CREATE_PATH = '/invoice/create';
const EXTERNAL_INVOICE_CREATE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_CREATE_PATH}`;

const EXTERNAL_INVOICE_LIST_PATH = '/invoice/all';
const EXTERNAL_INVOICE_LIST_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_LIST_PATH}`;

const EXTERNAL_INVOICE_DELETE_PATH = '/invoice';
const EXTERNAL_INVOICE_DELETE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_DELETE_PATH}`;

const EXTERNAL_INVOICE_DOWNLOAD_PATH = '/invoice/{id}/download';
const EXTERNAL_INVOICE_DOWNLOAD_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_DOWNLOAD_PATH}`;

const EXTERNAL_INVOICE_MARKASPAID_PATH = '/invoice/{id}/mark-as-paid';
const EXTERNAL_INVOICE_MARKASPAID_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_MARKASPAID_PATH}`;

const EXTERNAL_EMPLOYEE_CREATE_PATH = '/employee/create';
const EXTERNAL_EMPLOYEE_CREATE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_EMPLOYEE_CREATE_PATH}`;

const EXTERNAL_EMPLOYEE_LIST_PATH = '/employee/all';
const EXTERNAL_EMPLOYEE_LIST_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_EMPLOYEE_LIST_PATH}`;

const EXTERNAL_EMPLOYEE_DELETE_PATH = '/employee';
const EXTERNAL_EMPLOYEE_DELETE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_EMPLOYEE_DELETE_PATH}`;

const EXTERNAL_QUOTATION_CREATE_PATH = '/quotation/create';
const EXTERNAL_QUOTATION_CREATE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_QUOTATION_CREATE_PATH}`;

const EXTERNAL_QUOTATION_LIST_PATH = '/quotation/all';
const EXTERNAL_QUOTATION_LIST_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_QUOTATION_LIST_PATH}`;

const EXTERNAL_QUOTATION_DELETE_PATH = '/quotation';
const EXTERNAL_QUOTATION_DELETE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_QUOTATION_DELETE_PATH}`;

const EXTERNAL_QUOTATION_DOWNLOAD_PATH = '/quotation/{id}/download';
const EXTERNAL_QUOTATION_DOWNLOAD_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_QUOTATION_DOWNLOAD_PATH}`;


// Restrict CORS to the frontend origin if provided; otherwise allow all
if (FRONTEND_ORIGIN) {
  app.use(cors({ origin: FRONTEND_ORIGIN }));
} else {
  app.use(cors());
}

// Health
app.get('/api/health', (req, res) => {
  console.log('Health check request');
  res.json({ status: 'ok' });
});

// Log configuration at startup
console.log('BFF configuration:');
console.log(' FRONTEND_ORIGIN:', FRONTEND_ORIGIN || 'not set, allowing all origins');
console.log(' EXTERNAL_AUTH_URL:', EXTERNAL_AUTH_URL);
console.log(' EXTERNAL_COMPANY_LIST_URL:', EXTERNAL_COMPANY_LIST_URL);
console.log(' EXTERNAL_INVOICE_CREATE_URL:', EXTERNAL_INVOICE_CREATE_URL);
console.log(' EXTERNAL_INVOICE_LIST_URL:', EXTERNAL_INVOICE_LIST_URL);
console.log(' EXTERNAL_INVOICE_DELETE_URL:', EXTERNAL_INVOICE_DELETE_URL);


// Login endpoint - forwards to external auth service and normalizes response
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const resp = await fetch(EXTERNAL_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const body = await resp.json().catch(() => ({}));

    if (!resp.ok || body.status === 'FAILURE') {
      return res.status(resp.status || 401).json({
        message: body?.message || 'Authentication failed'
      });
    }

    // --- Normalization based on your specific JSON ---
    const responsePayload = {
      user: {
        id: body.userId,
        name: body.userName,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        company: {
          id: body.companyId,
          name: body.companyName
        },
        email: body.email,
        phone: body.phone,
        avatar: body.avatar 
      },
      auth: {
        token: body.token,
        tokenType: body.tokenType,
        expiresAt: body.tokenExpiryTs,
        refreshToken: body.refreshToken,
        refreshExpiresAt: body.refreshTokenExpiryTs
      },
      loginTime: body.login_ts,
      raw: body // Optional: for debugging
    };

    return res.json(responsePayload);
  } catch (err) {
    console.error('BFF Login Error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/user/update', async (req, res) => {
  // 1. Debug: Check what the BFF actually received from the UI
  console.log('BFF received body:');
  
  const userPayload = req.body.user || req.body; // Fallback if 'user' key is missing

  try {
    const resp = await fetch(EXTERNAL_USER_UPDATE_URL, {
      method: 'PUT',
      headers: req.headers,
      body: JSON.stringify(userPayload),
    });

    // 2. Get response as text first to avoid "Unexpected end of JSON"
    const text = await resp.text(); 
    
    // 3. Only parse if there is actually content
    const data = text ? JSON.parse(text) : { success: true };

    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('BFF /api/user/update error:', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.post('/api/resetPassword/:email', async (req, res) => {
  console.log('Reset password request for ' + req.params.email);

  const email = req.params.email;
  try {

    if (!EXTERNAL_AUTH_URL) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_AUTH_URL not set' });
    }

    const target = EXTERNAL_RESET_PASSWORD_URL.replace('{email}', email);

    // Forward the login request to the external backend service's login endpoint
    // EXTERNAL_AUTH_URL defaults to https://service.coresmith.duckdns.org/login but can be
    // overridden using EXTERNAL_AUTH_URL or EXTERNAL_SERVICE_BASE/EXTERNAL_AUTH_PATH in .env
    const resp = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const body = await resp.json().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: body?.message || 'Reset password failed', details: body });
    }

    return res.json({ name, token, raw: body });
  } catch (err) {
    console.error('BFF /api/resetPassword error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.get('/api/company/all', async (req, res) => {
  console.log('List companies request');

  try {
    const target = EXTERNAL_COMPANY_LIST_URL; // e.g., https://backend/api/companies
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_COMPANY_LIST_URL not set' });
    }

    const headers = { 'Accept': 'application/json' };

    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) {
      headers['x-api-key'] = process.env.BFF_API_KEY;
    }

    const resp = await fetch(target, {
      method: 'GET',
      headers
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;

    if (ct.includes('application/json')) {
      body = await resp.json().catch(() => null);
    } else {
      body = await resp.text().catch(() => null);
    }

    if (!resp.ok) {
      console.error('External company API error', resp.status, body);
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'external company service error',
        details: body
      });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/companies error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

//Create company - forward to external companies API
app.post('/api/company/create', async (req, res) => {
  console.log('Create company request', req.body);
  const company = req.body;
  if (!company || Object.keys(company).length === 0) {
    return res.status(400).json({ message: 'company payload is required' });
  }

  try {
    const target = EXTERNAL_COMPANY_CREATE_URL; // e.g., https://backend/api/company/create
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_COMPANY_CREATE_URL not set' });
    }

    const headers = { 'Content-Type': 'application/json' };
    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(company),
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External company API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external company service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/company error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

// Create invoice - forward to external invoices API
app.post('/api/invoice/create', async (req, res) => {
  console.log('Create invoice request', req.body);
  const invoice = req.body;
  if (!invoice || Object.keys(invoice).length === 0) {
    return res.status(400).json({ message: 'invoice payload is required' });
  }

  try {
    const target = EXTERNAL_INVOICE_CREATE_URL; // e.g., https://backend/api/invoice/create
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_INVOICE_URL not set' });
    }

    const headers = { 'Content-Type': 'application/json' };
    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(invoice),
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External invoice API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external invoice service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoices error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

// List invoices - forward to external invoices API
app.get('/api/invoice/all', async (req, res) => {
  console.log('List invoices request');

  try {
    const target = EXTERNAL_INVOICE_LIST_URL; // e.g., https://backend/api/invoices
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_INVOICE_LIST_URL not set' });
    }

    const headers = { 'Accept': 'application/json' };

    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) {
      headers['x-api-key'] = process.env.BFF_API_KEY;
    }

    const resp = await fetch(target, {
      method: 'GET',
      headers
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;

    if (ct.includes('application/json')) {
      body = await resp.json().catch(() => null);
    } else {
      body = await resp.text().catch(() => null);
    }

    if (!resp.ok) {
      console.error('External invoice API error', resp.status, body);
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'external invoice service error',
        details: body
      });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoices error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

//Delete invoice - forward to external invoices API
app.delete('/api/invoice/:id', async (req, res) => {
  console.log('Delete invoice request for ID:', req.params.id);
  

  try {
    const target = `${EXTERNAL_INVOICE_DELETE_URL}/${req.params.id}`;
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_INVOICE_DELETE_URL not set' });
    }

    const headers = { 'Accept': 'application/pdf' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, { method: 'DELETE', headers });

    // Handle API errors before processing the body
    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error('External invoice delete API error', resp.status, errorBody);
      return res.status(resp.status).json({ message: 'External service error', details: errorBody });
    }

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

//Download invoice - forward to external invoices API
app.get('/api/invoice/:id/download', async (req, res) => {
  console.log('Download invoice request for ID:', req.params.id);

  try {
    const target = `${EXTERNAL_INVOICE_DOWNLOAD_URL}`.replace('{id}', req.params.id);

    if (!EXTERNAL_INVOICE_DOWNLOAD_URL) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_INVOICE_DOWNLOAD_URL not set' });
    }

    const headers = { 'Accept': 'application/pdf' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, { method: 'GET', headers });

    // Handle API errors before processing the body
    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error('External invoice download API error', resp.status, errorBody);
      return res.status(resp.status).json({ message: 'External service error', details: errorBody });
    }

    // Get the actual binary data from the response
    const body = await resp.buffer();

    // Set appropriate headers for the real PDF
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', body.length);

    // Send the actual binary buffer
    res.send(body);

  } catch (err) {
    console.error('BFF /api/invoice/:id/download GET error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

//Create employee - forward to external employees API

app.post('/api/employee/create', async (req, res) => {
  console.log('Create employee request', req.body);
  const employee = req.body;
  if (!employee || Object.keys(employee).length === 0) {
    return res.status(400).json({ message: 'employee payload is required' });
  }

  try {
    const target = EXTERNAL_EMPLOYEE_CREATE_URL; // e.g., https://backend/api/employee/create
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_EMPLOYEE_CREATE_URL not set' });
    }

    const headers = { 'Content-Type': 'application/json' };
    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(employee),
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External employee API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external employee service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/employee error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

// List employees - forward to external employees API
app.get('/api/employee/all', async (req, res) => {
  console.log('List employees request');

  try {
    const target = EXTERNAL_EMPLOYEE_LIST_URL; // e.g., https://backend/api/employees
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_EMPLOYEE_LIST_URL not set' });
    }

    const headers = { 'Accept': 'application/json' };

    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) {
      headers['x-api-key'] = process.env.BFF_API_KEY;
    }

    const resp = await fetch(target, {
      method: 'GET',
      headers
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;

    if (ct.includes('application/json')) {
      body = await resp.json().catch(() => null);
    } else {
      body = await resp.text().catch(() => null);
    }

    if (!resp.ok) {
      console.error('External employee API error', resp.status, body);
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'external employee service error',
        details: body
      });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/employees error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

//Delete employee - forward to external employees API
app.delete('/api/employee/:id', async (req, res) => {
  console.log('Delete employee request for ID:', req.params.id);

  try {
    const target = `${EXTERNAL_EMPLOYEE_DELETE_URL}/${req.params.id}`;
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_EMPLOYEE_DELETE_URL not set' });
    }

    const headers = { 'Accept': 'application/json' };
    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'DELETE',
      headers,
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External employee API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external employee service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/employee/:id DELETE error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

// Similar endpoints can be created for quotations using the same pattern
app.post('/api/quotation/create', async (req, res) => {
  console.log('Create quotation request', req.body);
  const quotation = req.body;
  if (!quotation || Object.keys(quotation).length === 0) {
    return res.status(400).json({ message: 'quotation payload is required' });
  }

  try {
    const target = EXTERNAL_QUOTATION_CREATE_URL; // e.g., https://backend/api/quotation/create
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_QUOTATION_CREATE_URL not set' });
    }

    const headers = { 'Content-Type': 'application/json' };
    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(quotation),
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External quotation API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external quotation service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/quotation error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.get('/api/quotation/all', async (req, res) => {
  console.log('List quotations request');

  try {
    const target = EXTERNAL_QUOTATION_LIST_URL; // e.g., https://backend/api/quotations
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_QUOTATION_LIST_URL not set' });
    }

    const headers = { 'Accept': 'application/json' };

    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) {
      headers['x-api-key'] = process.env.BFF_API_KEY;
    }

    const resp = await fetch(target, {
      method: 'GET',
      headers
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;

    if (ct.includes('application/json')) {
      body = await resp.json().catch(() => null);
    } else {
      body = await resp.text().catch(() => null);
    }

    if (!resp.ok) {
      console.error('External quotation API error', resp.status, body);
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'external quotation service error',
        details: body
      });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/quotations error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.delete('/api/quotation/:id', async (req, res) => {
  console.log('Delete quotation request for ID:', req.params.id);

  try {
    const target = `${EXTERNAL_QUOTATION_DELETE_URL}/${req.params.id}`;
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_QUOTATION_DELETE_URL not set' });
    }

    const headers = { 'Accept': 'application/json' };
    // forward authorization header if client provided a bearer token
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    // allow inserting a BFF API key for outbound requests
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'DELETE',
      headers,
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External quotation API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external quotation service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/quotation/:id DELETE error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.get('/api/quotation/:id/download', async (req, res) => {
  console.log('Download quotation request for ID:', req.params.id);

  try {
    const target = `${EXTERNAL_QUOTATION_DOWNLOAD_URL}`.replace('{id}', req.params.id);

    if (!EXTERNAL_QUOTATION_DOWNLOAD_URL) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_QUOTATION_DOWNLOAD_URL not set' });
    }

    const headers = { 'Accept': 'application/pdf' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, { method: 'GET', headers });

    // Handle API errors before processing the body
    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error('External quotation download API error', resp.status, errorBody);
      return res.status(resp.status).json({ message: 'External service error', details: errorBody });
    }

    // Get the actual binary data from the response
    const body = await resp.buffer();

    // Set appropriate headers for the real PDF
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', body.length);

    // Send the actual binary buffer
    res.send(body);

  } catch (err) {
    console.error('BFF /api/quotation/:id/download GET error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.get('/api/invoice/:id/mark-as-paid', async (req, res) => {
  console.log('Mark invoice as paid request for ID:', req.params.id);

  try {
    const target = `${EXTERNAL_INVOICE_MARKASPAID_URL}`.replace('{id}', req.params.id); // e.g., https://backend/api/invoice/{id}
    if (!target) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_INVOICE_MARKASPAID_URL not set' });
    }

    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, {
      method: 'GET',
      headers,
    });

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External invoice API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external invoice service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id/update error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});





app.listen(port, () => console.log(`BFF listening on http://localhost:${port}`));