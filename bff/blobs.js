const express = require('express');
const router = express.Router();
const { getISTTimestamp, formatIST } = require('./auth');
const { serviceUrl, fetchService } = require('./clients');

router.get('/blobs', async (req, res) => {
  try {
    const target = serviceUrl(req, '/blob');
    const headers = { 'Accept': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => []);
    if (!resp.ok) return res.status(resp.status).json({ message: 'External service error' });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn || item.timestamp || item.createdAt)
    })) : body;

    return res.status(200).json(normalized);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/blobs error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/blob/:id/download', async (req, res) => {
  try {
    const target = serviceUrl(req, `/blob/${encodeURIComponent(req.params.id)}/download`);
    const headers = {};
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    if (!resp.ok) {
      const errorBody = await resp.text();
      return res.status(resp.status).json({ message: 'Download failed', details: errorBody });
    }

    res.setHeader('Content-Type', resp.headers.get('content-type') || 'application/octet-stream');
    resp.body.pipe(res);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/blob/:id/download error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/blob/:id', async (req, res) => {
  try {
    const target = serviceUrl(req, `/blob/${encodeURIComponent(req.params.id)}`);
    const headers = {};
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [DELETE] ${target}`);
    const resp = await fetchService(req, target, { method: 'DELETE', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => ({}));

    if (!resp.ok) return res.status(resp.status).json(body);

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/blob/:id DELETE error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;