const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { getISTTimestamp, formatIST } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_NOTIFICATION_GET_URL = `${EXTERNAL_SERVICE_BASE}/notification/all`;

router.get('/notification/all', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${EXTERNAL_NOTIFICATION_GET_URL}`);
    const resp = await fetch(EXTERNAL_NOTIFICATION_GET_URL, {
      method: 'GET',
      headers,
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${EXTERNAL_NOTIFICATION_GET_URL}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      console.error('External API error', resp.status, body);
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external service error', details: body });
    }

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn),
      timestamp: formatIST(item.timestamp)
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/notification/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;