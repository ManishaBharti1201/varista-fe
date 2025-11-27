# Varista BFF

This small BFF forwards authentication requests from the frontend to the external authentication service and returns a normalized response.

## Setup

1. Copy `.env.example` to `.env` and update `EXTERNAL_AUTH_URL`.

2. Install dependencies:

```powershell
cd bff
npm install
```

3. Run in development:

```powershell
npm run dev
# or
npm start
```

The BFF listens on `http://localhost:4000` by default and exposes `/api/login`.

## API

POST `/api/login`
- Body: `{ "username": "...", "password": "..." }`
- Response (success): `{ "name": "User Name", "token": "...", "raw": { ... } }`
- Response (failure): forwards status and returns `{ message: 'Authentication failed', details: ... }`

## Notes
- The BFF uses `EXTERNAL_AUTH_URL` env var to call the real auth API.
- This is intentionally minimal; for production you'll want proper error handling, request validation, logging, and secure token handling.
