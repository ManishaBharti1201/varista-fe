# Varista Workforce

Varista is a workforce-management web application built with React, TypeScript,
and Tailwind CSS. The repository contains the web frontend, an Express
backend-for-frontend (BFF), and Capacitor projects for Android and iOS.

The application includes dashboards, company/client records, invoices,
quotations, employees, user administration, notifications, and timesheet/
holiday reporting. The BFF proxies authenticated API requests to the configured
service.

## Multi-client support

The frontend loads its client catalog from `GET /api/clients`. Users select a
client before entering credentials. The selected client's theme and menu
configuration control the login branding and available application sections.
Authenticated frontend requests include `X-Client-Id`; login submits `clientId`
in its JSON body.

The BFF owns the mapping from client IDs to backend service URLs. Configure
clients using the `CLIENT_CATALOG_JSON` environment variable in the BFF
environment. Each client entry requires a unique `id`, `name`, and
`serviceBaseUrl`; optional fields include `domain`, `apiKey`, `theme`, and
`menuItems`. The service URL and API key remain server-side. See
[bff/README.md](./bff/README.md) for the catalog format, supported menu IDs, and
request-routing details.

If no catalog is configured, the BFF provides one `Syncra Demo` client and uses
`EXTERNAL_SERVICE_BASE_URL` (or its existing default). This fallback is for
local development; configure the real client catalog and service destinations
before deploying multiple clients.

## Prerequisites

- Node.js 22 or later (the frontend Docker build uses Node 22)
- npm

## Run locally

Install dependencies once in the frontend and BFF directories:

```powershell
# From the repository root
npm ci

Push-Location .\bff
npm ci
Pop-Location
```

Start the BFF in one terminal:

```powershell
Set-Location .\bff
npm start
```

Start the frontend in a second terminal from the repository root. Point it at
the local BFF so `/api` calls use the local client catalog and proxy:

```powershell
$env:REACT_APP_BFF_URL = "http://localhost:4000"
npm start
```

Open [http://localhost:3000](http://localhost:3000). The BFF listens on
`http://localhost:4000` by default and reads its environment from `bff/.env`.
The checked-in local BFF environment currently points to the existing shared
service; login and downstream API operations therefore require that service to
be reachable. Do not place production credentials or secrets in the frontend
environment.

To run the frontend with the default configured BFF instead, omit
`REACT_APP_BFF_URL`; for local development, explicitly setting it to the
address above is recommended.

## Available frontend commands

Run these from the repository root:

| Command | Description |
| --- | --- |
| `npm start` | Start the React development server |
| `npm test -- --watchAll=false` | Run tests once |
| `npm run build` | Create a production build in `build/` |

## Mobile projects

Android and iOS Capacitor project files are under `android/` and `ios/`.
Capacitor CLI and platform commands are available through the root npm
dependencies; native builds also require the platform-specific SDKs and tools.

## Docker

The frontend and BFF each have a Dockerfile. See [DOCKER.md](./DOCKER.md) for
the existing Docker guidance. Local Docker Compose instructions are only
applicable if a Compose file is present in this checkout.
