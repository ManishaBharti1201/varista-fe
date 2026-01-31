require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
// Service domain configuration (replaceable via .env)
// Frontend (origin) - allowed CORS origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

// Backend service base and login path. By default use the service domain you provided.
const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
// Default to common API path; override with EXTERNAL_AUTH_PATH or EXTERNAL_AUTH_URL in .env
const EXTERNAL_AUTH_PATH = '/user/login';
const EXTERNAL_AUTH_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_AUTH_PATH}`;

// External companies endpoint (can be overridden)
const EXTERNAL_COMPANY_LIST_PATH = '/company/all';
const EXTERNAL_COMPANY_LIST_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_COMPANY_LIST_PATH}`;
// External invoices endpoint (can be overridden)
const EXTERNAL_INVOICE_CREATE_PATH = '/invoice/create';
const EXTERNAL_INVOICE_CREATE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_CREATE_PATH}`;

const EXTERNAL_INVOICE_LIST_PATH = '/invoice/all';
const EXTERNAL_INVOICE_LIST_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_LIST_PATH}`;

const EXTERNAL_INVOICE_DELETE_PATH = '/invoice';
const EXTERNAL_INVOICE_DELETE_URL = `${EXTERNAL_SERVICE_BASE}${EXTERNAL_INVOICE_DELETE_PATH}`;

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
  console.log('Login request');
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {

    if (!EXTERNAL_AUTH_URL) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_AUTH_URL not set' });
    }

    // Forward the login request to the external backend service's login endpoint
    // EXTERNAL_AUTH_URL defaults to https://service.coresmith.duckdns.org/login but can be
    // overridden using EXTERNAL_AUTH_URL or EXTERNAL_SERVICE_BASE/EXTERNAL_AUTH_PATH in .env
    const resp = await fetch(EXTERNAL_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const body = await resp.json().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: body?.message || 'Authentication failed', details: body });
    }

    // Normalize user data: many auth APIs return token + user object in different shapes
    // Try common locations for user data
    const user = body?.user || body?.data || body;
    const name = user?.name || user?.fullName || username;
    const token = user?.token || body?.token || body?.accessToken || null;

    return res.json({ name, token, raw: body });
  } catch (err) {
    console.error('BFF /api/login error', err);
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
      console.error('External invoice API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external invoice service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id DELETE error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

//Download invoice - forward to external invoices API
app.get('/api/invoice/download/:id', async (req, res) => {
  console.log('Download invoice request for ID:', req.params.id);

  // For demonstration, just returning a placeholder response
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${req.params.id}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(`%PDF-1.4\n% Placeholder PDF content for invoice ID: ${req.params.id}\n%%EOF`);
});


app.listen(port, () => console.log(`BFF listening on `+ `http://localhost:${port}`));
