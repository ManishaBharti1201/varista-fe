const express = require('express');
const router = express.Router();
const { tenantHeaders } = require('./tenant');
const { resolveClient, serviceUrl, fetchService } = require('./clients');

router.post('/support/tickets', resolveClient, async (req, res) => {
  try {
    const target = serviceUrl(req, '/support/tickets');
    const response = await fetchService(req, target, {
      method: 'POST',
      headers: tenantHeaders(req, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(req.body || {})
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(
        `[${new Date().toISOString()}] Support service returned HTTP ${response.status}`
      );
      const message = response.status === 404
        ? 'The support API is not available on the service yet. Deploy the latest Java service and try again.'
        : body?.message || `Support service returned HTTP ${response.status}`;
      return res.status(response.status).json({
        message,
        details: body
      });
    }

    return res.status(response.status).json(body);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] BFF /api/support/tickets error`, error);
    return res.status(502).json({ message: 'Could not reach the support service. Please try again later.' });
  }
});

module.exports = router;
