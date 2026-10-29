# Varista BFF

The BFF exposes the client catalog and routes authenticated requests to the
service configured for the selected client. Service URLs are kept server-side
and are not returned by `GET /api/clients`.

## Configure clients

Set `CLIENT_CATALOG_JSON` in the BFF environment to a JSON array. Each client
requires a unique `id`, a display `name`, and a server-side `serviceBaseUrl`.
`domain` is optional catalog metadata; it does not currently select a client
from the browser hostname.

```json
[
  {
    "id": "northwind",
    "name": "Northwind",
    "domain": "northwind.example.com",
    "serviceBaseUrl": "https://northwind-api.example.com",
    "apiKey": "configured-in-the-server-environment",
    "theme": {
      "appName": "Northwind",
      "primaryColor": "#0f766e",
      "logoUrl": ""
    },
    "menuItems": ["dashboard", "invoices", "employees", "quicklinks"]
  }
]
```

Supported menu item IDs are `dashboard`, `clients`, `invoices`, `quotations`,
`employees`, `quicklinks`, `timesheet`, and `users`. The `users` item is also
limited to users whose role is administrative.

When `CLIENT_CATALOG_JSON` is not configured, the BFF exposes a single
`Syncra Demo` client using `EXTERNAL_SERVICE_BASE_URL` (or the existing default
service URL). Replace this placeholder before enabling production tenants.

## Request behavior

- `GET /api/clients` returns public client names, optional domains, themes, and
  menu configuration.
- `POST /api/login` requires `clientId` in its JSON body.
- Authenticated API requests require `X-Client-Id`.
- The BFF resolves that ID against its configured catalog, routes to the
  matching `serviceBaseUrl`, and forwards `X-Client-Id` to the service.
- Never accept a service URL from a browser request. Configure service URLs
  only in the BFF environment.

The downstream authentication and service APIs must still validate that the
user's token is authorized for the selected client. The client ID header is
tenant-routing context, not an authorization credential.

## Run locally

```powershell
cd bff
npm install
npm start
```

The BFF listens on port `4000` by default.
