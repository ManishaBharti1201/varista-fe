const express = require('express');
const { serviceUrl, fetchService } = require('./clients');
const router = express.Router();

router.post('/invoice/create', async (req, res) => {
  const invoice = req.body;
  if (!invoice || Object.keys(invoice).length === 0) {
    return res.status(400).json({ message: 'invoice payload is required' });
  }
  try {
    const target = serviceUrl(req, '/invoice/create');
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers,
      body: JSON.stringify(invoice),
    });
    console.log(`External service response: [${resp.status}] ${target}`);

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
    const target = serviceUrl(req, '/invoice/all');
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`External service response: [${resp.status}] ${target}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn),
      invoiceDate: formatIST(item.invoiceDate)
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error('BFF /api/invoice/all error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/invoice/:id', async (req, res) => {
  try {
    const target = serviceUrl(req, `/invoice/${encodeURIComponent(req.params.id)}`);
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [DELETE] ${target}`);
    const resp = await fetchService(req, target, { method: 'DELETE', headers });
    console.log(`External service response: [${resp.status}] ${target}`);
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
    const target = serviceUrl(req, `/invoice/${encodeURIComponent(req.params.id)}/download`);
    const headers = { 'Accept': 'application/pdf' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`External service response: [${resp.status}] ${target}`);

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
    const target = serviceUrl(req, `/invoice/${encodeURIComponent(req.params.id)}/mark-as-paid`);
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`External service response: [${resp.status}] ${target}`);
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
    const target = serviceUrl(req, `/invoice/${encodeURIComponent(req.params.id)}/replace`);
    const headers = { ...req.headers };
    delete headers.host;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [POST] ${target}`);
    const resp = await fetchService(req, target, {
      method: 'POST',
      headers: headers,
      body: req,
      duplex: 'half'
    });
    console.log(`External service response: [${resp.status}] ${target}`);

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