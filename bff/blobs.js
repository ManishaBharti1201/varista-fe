const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { authenticate } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_BLOBS_LIST_URL = `${EXTERNAL_SERVICE_BASE}/blob`;
const EXTERNAL_BLOB_BASE_URL = `${EXTERNAL_SERVICE_BASE}/blob`;

router.get('/blobs', async (req, res) => {
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${EXTERNAL_BLOBS_LIST_URL}`);
    const resp = await fetch(EXTERNAL_BLOBS_LIST_URL, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_BLOBS_LIST_URL}`);

    const body = await resp.json().catch(() => []);
    if (!resp.ok) return res.status(resp.status).json({ message: 'External service error' });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: item.uploadedOn || item.timestamp || item.createdAt
    })) : body;

    return res.status(200).json(normalized);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/blobs error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/blob/:id/download', async (req, res) => {
  try {
    const target = `${EXTERNAL_BLOB_BASE_URL}/${req.params.id}/download`;
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetch(target, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

    if (!resp.ok) {
      const errorBody = await resp.text();
      return res.status(resp.status).json({ message: 'Download failed', details: errorBody });
    }

    res.setHeader('Content-Type', resp.headers.get('content-type') || 'application/octet-stream');
    resp.body.pipe(res);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/blob/:id/download error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/blob/:id', async (req, res) => {
  try {
    const target = `${EXTERNAL_BLOB_BASE_URL}/${req.params.id}`;
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [DELETE] ${target}`);
    const resp = await fetch(target, { method: 'DELETE', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => ({}));

    if (!resp.ok) return res.status(resp.status).json(body);

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/blob/:id DELETE error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;
