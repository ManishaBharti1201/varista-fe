const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const EXTERNAL_SERVICE_BASE = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';
const EXTERNAL_AUTH_URL = `${EXTERNAL_SERVICE_BASE}/user/login`;
const EXTERNAL_VERIFY_OTP_URL = `${EXTERNAL_SERVICE_BASE}/user/verify-otp`;
const EXTERNAL_RESET_PASSWORD_URL = `${EXTERNAL_SERVICE_BASE}/user/resetPassword/{email}`;
const EXTERNAL_USER_UPDATE_URL = `${EXTERNAL_SERVICE_BASE}/user/update`;
const EXTERNAL_USER_SESSION_URL = `${EXTERNAL_SERVICE_BASE}/user/me`;

// Helper to get current timestamp in Indian Standard Time (IST)
const getISTTimestamp = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// Helper to format an arbitrary date to IST
const formatIST = (val) => val ? new Date(val).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null;

// Middleware to protect routes and ensure a token is present
const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Login logic
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${EXTERNAL_AUTH_URL}`);
    const resp = await fetch(EXTERNAL_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${EXTERNAL_AUTH_URL}`);

    const body = await resp.json().catch(() => ({}));

    if (!resp.ok || ['FAILURE', 'ERROR', 'UNAUTHORIZED'].includes(body.status)) {
      return res.status(resp.status || 401).json({
        message: body?.message || 'Authentication failed'
      });
    }

    if (body.status === 'MFA_REQUIRED') {
      return res.json({ status: 'MFA_REQUIRED', userId: body.userId, phone: body.phone });
    }

    // Normalization...
    return res.json(normalizeUser(body));
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /login error:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// OTP logic
router.post('/verify-otp', async (req, res) => {
  const { firebaseToken, userId } = req.body || {};
  try {
    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${EXTERNAL_VERIFY_OTP_URL}`);
    const resp = await fetch(EXTERNAL_VERIFY_OTP_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      },
      body: JSON.stringify({ firebaseToken, userId }),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${EXTERNAL_VERIFY_OTP_URL}`);

    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) return res.status(401).json({ message: 'OTP verification failed' });

    return res.json({ ...normalizeUser(body), status: 'SUCCESS' });
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /verify-otp error:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Session validation logic to be called on application load
router.get('/session', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No session found' });

  try {
    const headers = { 'Accept': 'application/json', 'Authorization': token };
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [GET] ${EXTERNAL_USER_SESSION_URL}`);
    const resp = await fetch(EXTERNAL_USER_SESSION_URL, { method: 'GET', headers });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${EXTERNAL_USER_SESSION_URL}`);

    const body = await resp.json().catch(() => ({}));

    if (!resp.ok || ['FAILURE', 'ERROR', 'UNAUTHORIZED'].includes(body.status)) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    const userData = normalizeUser(body);
    // Ensure the current token is preserved in the response
    if (!userData.auth.token) {
      userData.auth.token = token.startsWith('Bearer ') ? token.slice(7) : token;
    }

    return res.json(userData);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/session error`, err);
    return res.status(500).json({ message: 'BFF internal error' });
  }
});

router.put('/user/update', async (req, res) => {
  const userPayload = req.body.user || req.body;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (req.headers && req.headers.authorization) headers.authorization = req.headers.authorization;
    if (process.env.BFF_API_KEY) headers['x-api-key'] = process.env.BFF_API_KEY;

    console.log(`[${getISTTimestamp()}] BFF calling external service: [PUT] ${EXTERNAL_USER_UPDATE_URL}`);
    const resp = await fetch(EXTERNAL_USER_UPDATE_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userPayload),
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${EXTERNAL_USER_UPDATE_URL}`);

    const text = await resp.text();
    const data = text ? JSON.parse(text) : { success: true };

    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/user/update error:`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

router.post('/resetPassword/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const target = EXTERNAL_RESET_PASSWORD_URL.replace('{email}', email);

    console.log(`[${getISTTimestamp()}] BFF calling external service: [POST] ${target}`);
    const resp = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`[${getISTTimestamp()}] External service response: [${resp.status}] ${target}`);

    const body = await resp.json().catch(() => null);

    if (!resp.ok) {
      return res.status(resp.status).json({ message: body?.message || 'Reset password failed', details: body });
    }

    return res.json(body);
  } catch (err) {
    console.error(`[${getISTTimestamp()}] BFF /api/resetPassword error`, err);
    return res.status(500).json({ message: 'BFF internal error', error: err.message });
  }
});

function normalizeUser(body) {
  return {
    user: {
      id: body.userId,
      name: body.userName || body.name,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      company: {
        id: body.companyId,
        name: body.companyName
      },
      email: body.email,
      phone: body.phone,
      avatar: body.avatar
    },
    auth: {
      token: body.token,
      tokenType: body.tokenType,
      expiresAt: formatIST(body.tokenExpiryTs),
      refreshToken: body.refreshToken,
      refreshExpiresAt: formatIST(body.refreshTokenExpiryTs)
    }
  };
}

module.exports = {
  authRoutes: router,
  authenticate,
  getISTTimestamp,
  formatIST
};