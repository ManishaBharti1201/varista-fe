const express = require('express');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { resolveClient, serviceUrl, fetchService } = require('./clients');

router.get('/blobs', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, '/blob');
    const headers = tenantHeaders(req, {});

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

    const contentType = resp.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await resp.json().catch(() => null)
      : await resp.text().catch(() => '');
    if (!resp.ok) {
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'External service error',
        details: body
      });
    }

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: item.uploadedOn || item.timestamp || item.createdAt
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/blobs error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/blob/:id/download', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, `/blob/${encodeURIComponent(req.params.id)}/download`);
    const headers = tenantHeaders(req, {});

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetchService(req, target, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${target}`);

    if (!resp.ok) {
      const errorBody = await resp.text();
      return res.status(resp.status).json({ message: 'Download failed', details: errorBody });
    }

    res.setHeader('Content-Type', resp.headers.get('content-type') || 'application/octet-stream');
    const contentDisposition = resp.headers.get('content-disposition');
    if (contentDisposition) res.setHeader('Content-Disposition', contentDisposition);
    resp.body.pipe(res);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/blob/:id/download error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/blob/:id', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, `/blob/${encodeURIComponent(req.params.id)}`);
    const headers = tenantHeaders(req, {});

    console.log(`[${new Date().toISOString()}] BFF calling external service: [DELETE] ${target}`);
    const resp = await fetchService(req, target, { method: 'DELETE', headers });
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
