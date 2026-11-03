const express = require('express');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { authenticate } = require('./auth');
const { resolveClient, serviceUrl, fetchService } = require('./clients');

router.get('/notification/all', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, '/notification/all');
    const headers = tenantHeaders(req, {});

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

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

router.post('/notification/all/:id/read', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, `/notification/${encodeURIComponent(req.params.id)}/read`);
    const headers = tenantHeaders(req, {});

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, { method: 'POST', headers });
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

router.post('/notification/all/read-all', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, '/notification/read-all');
    const headers = tenantHeaders(req, {});

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, { method: 'POST', headers });
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
