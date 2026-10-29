const express = require('express');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { authenticate } = require('./auth');

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_EMPLOYEE_CREATE_URL = `${EXTERNAL_SERVICE_BASE}/employee/upsert`;
const EXTERNAL_EMPLOYEE_LIST_URL = `${EXTERNAL_SERVICE_BASE}/employee/all`;
const EXTERNAL_EMPLOYEE_DELETE_URL = `${EXTERNAL_SERVICE_BASE}/employee`;

router.post('/employee/upsert', async (req, res) => {
  const employee = req.body;
  if (!employee || Object.keys(employee).length === 0) {
    return res.status(400).json({ message: 'employee payload is required' });
  }
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [POST] ${EXTERNAL_EMPLOYEE_CREATE_URL}`);
    const resp = await fetch(EXTERNAL_EMPLOYEE_CREATE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(employee),
    });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_EMPLOYEE_CREATE_URL}`);

    const body = await resp.json().catch(() => null);
    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    return res.status(resp.status).json(body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/employee/upsert error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.get('/employee/all', async (req, res) => {
  try {
    const headers = tenantHeaders(req, {});
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${new Date().toISOString()}] BFF calling external service: [GET] ${EXTERNAL_EMPLOYEE_LIST_URL}`);
    const resp = await fetch(EXTERNAL_EMPLOYEE_LIST_URL, { method: 'GET', headers });
    console.log(`[${new Date().toISOString()}] External service response: [${resp.status}] ${EXTERNAL_EMPLOYEE_LIST_URL}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok) return res.status(resp.status).json({ message: body?.message || 'external service error', details: body });

    const normalized = Array.isArray(body) ? body.map(item => ({
      ...item,
      uploadedOn: item.uploadedOn
    })) : body;

    return res.status(resp.status).json(normalized);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] BFF /api/employee/all error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.delete('/employee/:id', async (req, res) => {
  try {
    const target = `${EXTERNAL_EMPLOYEE_DELETE_URL}/${req.params.id}`;
    const headers = tenantHeaders(req, {});
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
