const fetch = require('node-fetch');

const legacyServiceBaseUrl = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://service.coresmith.duckdns.org';

const defaultMenuItems = [
  'dashboard',
  'clients',
  'invoices',
  'quotations',
  'employees',
  'quicklinks',
  'timesheet',
  'users'
];
const supportedMenuItems = new Set(defaultMenuItems);

const defaultClient = {
  id: 'syncra-demo',
  name: 'Syncra Demo',
  domain: '',
  serviceBaseUrl: legacyServiceBaseUrl,
  theme: {
    appName: 'Syncra',
    primaryColor: '#4f46e5',
    logoUrl: ''
  },
  menuItems: defaultMenuItems
};

function loadClients() {
  let configuredClients;
  try {
    configuredClients = process.env.CLIENT_CATALOG_JSON
      ? JSON.parse(process.env.CLIENT_CATALOG_JSON)
      : [defaultClient];
  } catch (error) {
    throw new Error(`CLIENT_CATALOG_JSON must be valid JSON: ${error.message}`);
  }

  if (!Array.isArray(configuredClients) || configuredClients.length === 0) {
    throw new Error('CLIENT_CATALOG_JSON must contain at least one client');
  }

  const ids = new Set();
  return configuredClients.map((client) => {
    if (!client || typeof client.id !== 'string' || !client.id.trim()) {
      throw new Error('Every client catalog entry must have a non-empty id');
    }
    const id = client.id.trim();
    if (ids.has(id)) throw new Error(`Duplicate client id: ${id}`);
    ids.add(id);

    if (typeof client.name !== 'string' || !client.name.trim()) {
      throw new Error(`Client ${id} must have a non-empty name`);
    }
    if (typeof client.serviceBaseUrl !== 'string' || !client.serviceBaseUrl.trim()) {
      throw new Error(`Client ${id} must have a serviceBaseUrl`);
    }
    if (client.domain !== undefined && typeof client.domain !== 'string') {
      throw new Error(`Client ${id} domain must be a string`);
    }
    if (client.apiKey !== undefined && typeof client.apiKey !== 'string') {
      throw new Error(`Client ${id} apiKey must be a string`);
    }
    if (client.menuItems !== undefined && (
      !Array.isArray(client.menuItems) ||
      client.menuItems.some(item => typeof item !== 'string' || !supportedMenuItems.has(item))
    )) {
      throw new Error(`Client ${id} menuItems contains an unsupported item`);
    }
    if (client.theme !== undefined && (!client.theme || typeof client.theme !== 'object' || Array.isArray(client.theme))) {
      throw new Error(`Client ${id} theme must be an object`);
    }
    if (client.theme && client.theme.primaryColor !== undefined &&
      (typeof client.theme.primaryColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(client.theme.primaryColor))) {
      throw new Error(`Client ${id} theme.primaryColor must be a six-digit hex color`);
    }

    let serviceUrl;
    try {
      serviceUrl = new URL(client.serviceBaseUrl);
    } catch (_error) {
      throw new Error(`Client ${id} has an invalid serviceBaseUrl`);
    }
    if (!['https:', 'http:'].includes(serviceUrl.protocol)) {
      throw new Error(`Client ${id} serviceBaseUrl must use HTTP or HTTPS`);
    }

    return {
      id,
      name: client.name,
      domain: typeof client.domain === 'string' ? client.domain : '',
      serviceBaseUrl: client.serviceBaseUrl.replace(/\/+$/, ''),
      apiKey: typeof client.apiKey === 'string' ? client.apiKey : '',
      theme: {
        appName: client.theme && client.theme.appName ? client.theme.appName : client.name,
        primaryColor: client.theme && client.theme.primaryColor ? client.theme.primaryColor : '#4f46e5',
        logoUrl: client.theme && client.theme.logoUrl ? client.theme.logoUrl : ''
      },
      menuItems: Array.isArray(client.menuItems) ? client.menuItems : defaultMenuItems
    };
  });
}

const clients = loadClients();
const clientsById = new Map(clients.map(client => [client.id, client]));

const publicClients = clients.map(({ serviceBaseUrl, apiKey, ...client }) => client);

function resolveClient(req, res, next) {
  const clientId = req.path === '/login'
    ? req.body && req.body.clientId
    : req.get('x-client-id');
  const client = clientId && clientsById.get(clientId);

  if (!client) {
    return res.status(400).json({ message: 'A valid clientId is required' });
  }

  req.client = client;
  next();
}

function serviceUrl(req, path) {
  if (!req.client) throw new Error('Client context is required to resolve a service URL');
  return `${req.client.serviceBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchService(req, url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'x-client-id': req.client.id,
    ...(req.client.apiKey ? { 'x-api-key': req.client.apiKey } : {})
  };
  return fetch(url, { ...options, headers });
}

module.exports = {
  clients,
  publicClients,
  resolveClient,
  serviceUrl,
  fetchService
};
