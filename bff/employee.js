const express = require('express');
const router = express.Router();
const { getISTTimestamp, formatIST } = require('./auth');
const { serviceUrl, fetchService } = require('./clients');

router.post('/employee/upsert', async (req, res) => {
  const employee = req.body;
  if (!employee || Object.keys(employee).length === 0) {
    return res.status(400).json({ message: 'employee payload is required' });
  }
  try {
    const target = serviceUrl(req, '/employee/upsert');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers,
      body: JSON.stringify(employee),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => null);
    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/employee/upsert error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/employee/all', async (req, res) => {
  try {
    const target = serviceUrl(req, '/employee/all');
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn)
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/employee/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/employee/:id', async (req, res) => {
  try {
    const target = serviceUrl(req, `/employee/${encodeURIComponent(req.params.id)}`);
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetchService(req, target, { method: 'DELETE', headers });
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/employee/:id DELETE error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;