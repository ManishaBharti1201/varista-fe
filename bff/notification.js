const express = require('express');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { authenticate } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_NOTIFICATION_GET_URL = `${EXTERNAL_SERVICE_BASE}/notification/all`;
const EXTERNAL_NOTIFICATION_READ_URL = `${EXTERNAL_SERVICE_BASE}/notification/{id}/read`;
const EXTERNAL_NOTIFICATION_READALL_URL = `${EXTERNAL_SERVICE_BASE}/notification/read-all`;

router.get('/notification/all', async (req, res) => {
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${EXTERNAL_NOTIFICATION_GET_URL}`);
    const resp = await fetch(EXTERNAL_NOTIFICATION_GET_URL, {
      method: 'GET',
      headers,
    });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_NOTIFICATION_GET_URL}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external service error', details: body });
    }

    const normalized = Array.isArray(body) ? body.map(item => {
      const rawDate = item.createDate || item.timestamp || item.uploadedOn;
      return {
        ...item,
        createDate: rawDate, // Keep raw for frontend parsing
        uploadedOn: item.uploadedOn,
        timestamp: item.timestamp
      };
    }) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/notification/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/notification/all/:id/read', async (req, res) => {
  try {
    const target = EXTERNAL_NOTIFICATION_READ_URL.replace('{id}', req.params.id);
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetch(target, { method: 'POST', headers });
    const body = await resp.json().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: (body && body.message) || 'external service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/notification/all/:id/read error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/notification/all/read-all', async (req, res) => {
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${EXTERNAL_NOTIFICATION_READALL_URL}`);
    const resp = await fetch(EXTERNAL_NOTIFICATION_READALL_URL, { method: 'POST', headers });
    const body = await resp.json().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: (body && body.message) || 'external service error', details: body });
    }

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/notification/all/read-all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;
