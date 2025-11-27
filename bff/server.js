require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;
const EXTERNAL_AUTH_URL = process.env.EXTERNAL_AUTH_URL || 'http://localhost:8080/user/login';

app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Login endpoint - forwards to external auth service and normalizes response
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {

    if (!EXTERNAL_AUTH_URL) {
      return res.status(500).json({ message: 'BFF misconfiguration: EXTERNAL_AUTH_URL not set' });
    }

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
