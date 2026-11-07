# Varista Workforce

Varista is a workforce-management web application built with React, TypeScript,
and Tailwind CSS. The repository contains the web frontend, an Express
backend-for-frontend (BFF), and Capacitor projects for Android and iOS.

The application includes dashboards, company/client records, invoices,
quotations, employees, user administration, notifications, and timesheet/
holiday reporting. The BFF proxies authenticated API requests to the configured
service.

## Date and time contract

Date-only API values (for example employee dates, attendance dates, and invoice
dates) use ISO `YYYY-MM-DD` strings and are never converted between time zones.
The frontend displays these as `DD MMM YYYY`.

Timestamps represent UTC instants and are serialized as ISO 8601 values with a
`Z` suffix. The frontend displays them in the user's device time zone using a
24-hour clock. Attendance check-in and check-out values are local wall-clock
times, not instants; APIs use `HH:mm` for these values.

## Multi-client support

The frontend loads its client catalog from `GET /api/clients`. Users select a
tenant before entering credentials, and the tenant is mapped to a client. Set
the tenant's optional `clientId` to its BFF client ID; if omitted, matching
tenant/client IDs are used, or the only configured client is selected when
there is exactly one. With multiple clients, configure an explicit mapping
when the IDs differ. The selected client's theme and menu configuration control
the login branding and available application sections. Authenticated frontend
requests include `X-Client-Id`; login submits `clientId` in its JSON body.

Configure tenants with the frontend `REACT_APP_TENANTS` variable as a JSON
array, for example:

```json
[{"id":"101","name":"Leadac","clientId":"northwind"}]
```

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

The development server also proxies `/api` requests to `http://localhost:4000`
by default, so the environment variable can be omitted when using the local BFF.

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

### Android APK updates

The Android app checks `https://varista.coresmith.duckdns.org/downloads/version.json`
and offers newer versions for installation. The VM's frontend Compose service
must mount the persistent APK directory:

```yaml
volumes:
  - ./data/downloads:/usr/share/nginx/html/downloads:ro
```

The deployment workflow writes the latest APK and versioned APKs to
`~/varista/data/downloads`. Before the first signed release build, configure
these GitHub Actions repository secrets: `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.
Generate the keystore once:

```sh
keytool -genkeypair -v -keystore syncra-release.jks -alias syncra \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store its Base64 content and credentials as those repository secrets. Never
commit the keystore. Use the same keystore for every build and keep a secure
backup; changing the key prevents Android from installing updates over the
existing app.

The APK uses application ID `com.syncra.app`. Changing the previous package
name means Android treats this as a separate app; users must install this app
once and may uninstall the old app separately. The existing pipeline produced
debug APKs, whose signing key may differ between builds. Use the same release
keystore for subsequent builds so Android can install updates in place. Users
must allow Syncra to install unknown apps and confirm installation in Android.
Invoice and quotation PDFs downloaded in the Android app are handled by
Android's Download Manager and appear in the device's Downloads location.

## Docker

The frontend and BFF each have a Dockerfile. See [DOCKER.md](./DOCKER.md) for
the existing Docker guidance. Local Docker Compose instructions are only
applicable if a Compose file is present in this checkout.
