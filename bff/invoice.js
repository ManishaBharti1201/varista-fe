const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { authenticate } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_INVOICE_CREATE_URL = `${EXTERNAL_SERVICE_BASE}/invoice/create`;
const EXTERNAL_INVOICE_LIST_URL = `${EXTERNAL_SERVICE_BASE}/invoice/all`;
const EXTERNAL_INVOICE_DELETE_URL = `${EXTERNAL_SERVICE_BASE}/invoice`;
const EXTERNAL_INVOICE_DOWNLOAD_URL = `${EXTERNAL_SERVICE_BASE}/invoice/{id}/download`;
const EXTERNAL_INVOICE_MARKASPAID_URL = `${EXTERNAL_SERVICE_BASE}/invoice/{id}/mark-as-paid`;
const EXTERNAL_INVOICE_REPLACE_URL = `${EXTERNAL_SERVICE_BASE}/invoice/{id}/replace`;

router.post('/invoice/create', async (req, res) => {
  const invoice = req.body;
  if (!invoice || Object.keys(invoice).length === 0) {
    return res.status(400).json({ message: 'invoice payload is required' });
  }
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${EXTERNAL_INVOICE_CREATE_URL}`);
    const resp = await fetch(EXTERNAL_INVOICE_CREATE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(invoice),
    });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_INVOICE_CREATE_URL}`);

    const body = await resp.json().catch(() => null);
    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/create error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/invoice/all', async (req, res) => {
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${EXTERNAL_INVOICE_LIST_URL}`);
    const resp = await fetch(EXTERNAL_INVOICE_LIST_URL, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_INVOICE_LIST_URL}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: item.uploadedOn,
      invoiceDate: item.invoiceDate
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error('BFF /api/invoice/all error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/invoice/:id', async (req, res) => {
  try {
    const target = `${EXTERNAL_INVOICE_DELETE_URL}/${req.params.id}`;
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [DELETE] ${target}`);
    const resp = await fetch(target, { method: 'DELETE', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'External service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id DELETE error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/invoice/:id/download', async (req, res) => {
  try {
    const target = EXTERNAL_INVOICE_DOWNLOAD_URL.replace('{id}', req.params.id);
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetch(target, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

    if (!resp.ok) {
      const errorBody = await resp.text();
      return res.status(resp.status).json({ message: 'External service error', details: errorBody });
    }

    const body = await resp.buffer();
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', body.length);
    res.send(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id/download error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/invoice/:id/mark-as-paid', async (req, res) => {
  try {
    const target = EXTERNAL_INVOICE_MARKASPAID_URL.replace('{id}', req.params.id);
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetch(target, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id/mark-as-paid error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/invoice/:id/replace', async (req, res) => {
  try {
    const target = EXTERNAL_INVOICE_REPLACE_URL.replace('{id}', req.params.id);
    const headers = tenantHeaders(req, {});
    delete headers.host;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetch(target, {
      method: 'POST',
      headers: headers,
      body: req,
      duplex: 'half'
    });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

    const ct = resp.headers.get('content-type') || '';
    const body = await (ct.includes('application/json') ? resp.json() : resp.text());

    if (!resp.ok) return res.status(resp.status).json(body);
    return res.status(200).json(body);
  } catch (err) {
    console.error('BFF /api/invoice/:id/replace error:', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;
