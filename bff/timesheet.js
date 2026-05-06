const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();
const upload = multer();
const { getISTTimestamp, formatIST } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_TIMESHEET_UPLOAD_URL = `${EXTERNAL_SERVICE_BASE}/timesheet/upload`;
const EXTERNAL_TIMESHEET_GET_URL = `${EXTERNAL_SERVICE_BASE}/timesheet?employeeId={id}`;

router.post('/timesheet/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    Object.keys(req.body).forEach(key => form.append(key, req.body[key]));

    const headers = { ...form.getHeaders() };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`BFF calling external service: [POST] ${EXTERNAL_TIMESHEET_UPLOAD_URL}`);
    const resp = await fetch(EXTERNAL_TIMESHEET_UPLOAD_URL, {
      method: 'POST',
      headers,
      body: form,
    });
    console.log(`External service response: [${resp.status}] ${EXTERNAL_TIMESHEET_UPLOAD_URL}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({
        message: (body && body.message) || body || 'external service error',
        details: body
      });
    }
    return res.status(resp.status).json(body);
  } catch (err) {
    console.error('BFF /api/timesheet/upload error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/timesheet/:id/fetch', async (req, res) => {
  try {
    const target = EXTERNAL_TIMESHEET_GET_URL.replace('{id}', req.params.id);
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${target}`);
    const resp = await fetch(target, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const ct = resp.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) body = await resp.json().catch(() => null);
    else body = await resp.text().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: (body && body.message) || body || 'external service error', details: body });
    }

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: formatIST(item.uploadedOn)
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/timesheet/:id/fetch error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

module.exports = router;