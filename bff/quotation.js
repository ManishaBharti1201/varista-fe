const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { authenticate } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_QUOTATION_CREATE_URL = `${EXTERNAL_SERVICE_BASE}/quotation/create`;
const EXTERNAL_QUOTATION_LIST_URL = `${EXTERNAL_SERVICE_BASE}/quotation/all`;
const EXTERNAL_QUOTATION_DELETE_URL = `${EXTERNAL_SERVICE_BASE}/quotation`;
const EXTERNAL_QUOTATION_DOWNLOAD_URL = `${EXTERNAL_SERVICE_BASE}/quotation/{id}/download`;

router.post('/quotation/create', async (req, res) => {
  const quotation = req.body;
  if (!quotation || Object.keys(quotation).length === 0) {
    return res.status(400).json({ message: 'quotation payload is required' });
  }
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${EXTERNAL_QUOTATION_CREATE_URL}`);
    const resp = await fetch(EXTERNAL_QUOTATION_CREATE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(quotation),
    });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_QUOTATION_CREATE_URL}`);

    const body = await resp.json().catch(() => null);
    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/quotation/create error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/quotation/all', async (req, res) => {
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${EXTERNAL_QUOTATION_LIST_URL}`);
    const resp = await fetch(EXTERNAL_QUOTATION_LIST_URL, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_QUOTATION_LIST_URL}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: item.uploadedOn
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/quotation/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/quotation/:id', async (req, res) => {
  try {
    const target = `${EXTERNAL_QUOTATION_DELETE_URL}/${req.params.id}`;
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, { method: 'DELETE', headers });
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/quotation/:id DELETE error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/quotation/:id/download', async (req, res) => {
  try {
    const target = EXTERNAL_QUOTATION_DOWNLOAD_URL.replace('{id}', req.params.id);
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetch(target, { method: 'GET', headers });

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
    console.error('BFF /api/quotation/:id/download error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;
