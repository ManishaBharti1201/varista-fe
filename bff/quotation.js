const express = require('express');
const router = express.Router();
const { getISTTimestamp, formatIST } = require('./auth');
const { serviceUrl, fetchService } = require('./clients');

router.post('/quotation/create', async (req, res) => {
  const quotation = req.body;
  if (!quotation || Object.keys(quotation).length === 0) {
    return res.status(400).json({ message: 'quotation payload is required' });
  }
  try {
    const target = serviceUrl(req, '/quotation/create');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers,
      body: JSON.stringify(quotation),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => null);
    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/quotation/create error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/quotation/all', async (req, res) => {
  try {
    const target = serviceUrl(req, '/quotation/all');
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
    console.error(`[${getISTTimestamp()}] BFF /api/quotation/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/quotation/:id', async (req, res) => {
  try {
    const target = serviceUrl(req, `/quotation/${encodeURIComponent(req.params.id)}`);
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetchService(req, target, { method: 'DELETE', headers });
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
    const target = serviceUrl(req, `/quotation/${encodeURIComponent(req.params.id)}/download`);
    const headers = { 'Accept': 'application/pdf' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    const resp = await fetchService(req, target, { method: 'GET', headers });

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