const express = require('express');
const router = express.Router();
const { getISTTimestamp, formatIST } = require('./auth');
const { serviceUrl, fetchService } = require('./clients');

router.get('/company/all', async (req, res) => {
  try {
    const target = serviceUrl(req, '/company/all');
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'external company service error',
        details: body
      });
    }

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn)
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/company/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/company/create', async (req, res) => {
  const company = req.body;
  if (!company || Object.keys(company).length === 0) {
    return res.status(400).json({ message: 'company payload is required' });
  }

  try {
    const target = serviceUrl(req, '/company/create');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers,
      body: JSON.stringify(company),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external company service error', details: body });
    }
    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/company/create error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.put('/company/:id/update', async (req, res) => {
  const company = req.body;
  if (!company || Object.keys(company).length === 0) {
    return res.status(400).json({ message: 'company payload is required' });
  }

  try {
    const target = serviceUrl(req, '/company/updatePayment');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [PUT] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'PUT',
      headers,
      body: JSON.stringify(company),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external company service error', details: body });
    }
    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/company/:id/update error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;