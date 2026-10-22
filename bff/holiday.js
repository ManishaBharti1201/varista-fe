const express = require('express');
const router = express.Router();
const { getISTTimestamp, formatIST } = require('./auth');
const { serviceUrl, fetchService } = require('./clients');

router.get('/holiday/all', async (req, res) => {
  try {
    const target = serviceUrl(req, '/holiday/all');
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => []);
    if (!resp.ok) return res.status(resp.status).json({ message: 'external holiday service error' });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn),
      date: formatIST(item.date)
    })) : body;

    return res.status(200).json(normalized);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/holiday/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/holiday/create', async (req, res) => {
  try {
    const target = serviceUrl(req, '/holiday/create');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) return res.status(resp.status).json(body);

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/holiday/create error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/holiday/delete', async (req, res) => {
  try {
    const target = serviceUrl(req, '/holiday/delete');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) return res.status(resp.status).json(body);

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/holiday/delete error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;