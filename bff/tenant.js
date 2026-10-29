const express = require('express');
const router = express.Router();

const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    console.warn(`[${new Date().toISOString()}] Blocked unauthorized request to ${req.originalUrl}`);
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

module.exports = { router, authenticate, tenantHeaders: (req, headers = {}) => ({ ...headers, ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}), ...(req.headers['x-tenant-id'] ? { 'X-Company-ID': req.headers['x-tenant-id'] } : {}), ...(process.env.BFF_API_KEY ? { 'x-api-key': process.env.BFF_API_KEY } : {}) }) };
