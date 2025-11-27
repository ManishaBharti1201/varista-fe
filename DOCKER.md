# Dockerizing Varista (frontend + BFF)

This guide shows how to build Docker images for the frontend React app and the BFF, run them locally with docker-compose, and push images to Docker Hub.

Files added
- `Dockerfile` — multi-stage build for the React frontend (build with Node, serve with nginx).
- `nginx.conf` — SPA fallback and proxy `/api` to `bff` service.
- `bff/Dockerfile` is not required because the `bff` folder already contains `package.json` and `server.js`; docker-compose builds `./bff` using Node.
- `.dockerignore` and `bff/.dockerignore`
- `docker-compose.yml` — runs frontend + bff locally
- `.github/workflows/docker-publish.yml` — optional CI to build & push images to Docker Hub (uses secrets)

Local build & run with Docker Compose

1. Build and start services:

```powershell
# from project root
docker-compose build
docker-compose up -d
```

2. Visit the frontend at `http://localhost:3000`. The frontend proxies `/api` to the BFF at `http://localhost:4000` inside the compose network.

3. Stop services:

```powershell
docker-compose down
```

Manual image build & push (Docker Hub)

Replace `YOUR_DOCKERHUB_USER` with your Docker Hub username and pick a tag (e.g., `v1.0.0`):

```powershell
# Login to Docker Hub
docker login --username YOUR_DOCKERHUB_USER

# Build frontend image
docker build -t YOUR_DOCKERHUB_USER/varista-fe:latest -f Dockerfile .

# Build bff image
docker build -t YOUR_DOCKERHUB_USER/varista-bff:latest ./bff

# Push
docker push YOUR_DOCKERHUB_USER/varista-fe:latest
docker push YOUR_DOCKERHUB_USER/varista-bff:latest
```

Using GitHub Actions for automated publish

1. Add two repository secrets in GitHub: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (create token on Docker Hub).
2. Push to `main` branch — the workflow `.github/workflows/docker-publish.yml` will build and push images to your Docker Hub account (tag: `latest`).

Notes & recommendations
- For production, use pinned tags and CI workflows that tag images with the Git commit SHA or tag.
- Consider switching the BFF to set HttpOnly cookies for auth tokens instead of storing tokens in localStorage.
- If your external auth is only available on the host network, set `EXTERNAL_AUTH_URL` env in `docker-compose.yml` or in a `.env` file used by docker-compose.

If you want, I can:
- Add a `bff/Dockerfile` that installs production dependencies and copies only necessary files.
- Add image tags based on `package.json` version or Git commit SHA.
- Run a quick lint/format pass on added files.
