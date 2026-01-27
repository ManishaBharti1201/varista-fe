require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
// Service domain configuration (replaceable via .env)
// Frontend (origin) - allowed CORS origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://varista.coresmith.duckdns.org';

// Backend service base and login path. By default use the service domain you provided.
const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE || 'https://service.coresmith.duckdns.org';
// Default to common API path; override with EXTERNAL_AUTH_PATH or EXTERNAL_AUTH_URL in .env
const EXTERNAL_AUTH_PATH = process.env.EXTERNAL_AUTH_PATH || '/user/login';
const EXTERNAL_AUTH_URL = process.env.EXTERNAL_AUTH_URL || `${EXTERNAL_SERVICE_BASE}${EXTERNAL_AUTH_PATH}`;

// Restrict CORS to the frontend origin if provided; otherwise allow all
if (FRONTEND_ORIGIN) {
  app.use(cors({ origin: FRONTEND_ORIGIN }));
} else {
  app.use(cors());
}

// Health
app.get('/api/health', (req, res) => {
  console.log('Health check request');
  res.json({ status: 'ok' });
});

// Log configuration at startup
console.log('BFF configuration:');
console.log('  FRONTEND_ORIGIN=', FRONTEND_ORIGIN);
console.log('  EXTERNAL_SERVICE_BASE=', EXTERNAL_SERVICE_BASE);
console.log('  EXTERNAL_AUTH_PATH=', EXTERNAL_AUTH_PATH);
console.log('  EXTERNAL_AUTH_URL=', EXTERNAL_AUTH_URL);

// Login endpoint - forwards to external auth service and normalizes response
app.post('/api/login', async (req, res) => {
  console.log('Login request');
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {

    if (!EXTERNAL_AUTH_URL) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_AUTH_URL not set' });
    }

    // Forward the login request to the external backend service's login endpoint
    // EXTERNAL_AUTH_URL defaults to https://service.coresmith.duckdns.org/login but can be
    // overridden using EXTERNAL_AUTH_URL or EXTERNAL_SERVICE_BASE/EXTERNAL_AUTH_PATH in .env
    const resp = await fetch(EXTERNAL_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const body = await resp.json().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: body?.message || 'Authentication failed', details: body });
    }

    // Normalize user data: many auth APIs return token + user object in different shapes
    // Try common locations for user data
    const user = body?.user || body?.data || body;
    const name = user?.name || user?.fullName || username;
    const token = user?.token || body?.token || body?.accessToken || null;

    return res.json({ name, token, raw: body });
  } catch (err) {
    console.error('BFF /api/login error', err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

app.listen(port, () => console.log(`BFF listening on http://localhost:${port}`));
