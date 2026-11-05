# Dockerizing Varista (frontend + BFF)

This guide shows how to build Docker images for the frontend React app and the BFF, and push images to Docker Hub.

Build files
- `Dockerfile` — multi-stage build for the React frontend (build with Node, serve with nginx).
- `bff/Dockerfile` — Node image for the Express BFF.
- `nginx.conf` — SPA fallback and proxy `/api` to the BFF service.
- `.dockerignore` and `bff/.dockerignore` — exclude local and sensitive files from build contexts.
- `.github/workflows/main.yml` — builds and pushes both images on pushes to `main`.

Build and push images manually

The repository does not include a Compose file. Build the images from the repository root, replacing `YOUR_DOCKERHUB_USER` with the account used by the deployment Compose file:

```powershell
# Login to Docker Hub
docker login --username YOUR_DOCKERHUB_USER

# Build frontend image
docker build -t YOUR_DOCKERHUB_USER/varista-fe:latest -f Dockerfile .

# Build bff image
docker build -t YOUR_DOCKERHUB_USER/varista-bff:latest -f bff/Dockerfile bff

# Push
docker push YOUR_DOCKERHUB_USER/varista-fe:latest
docker push YOUR_DOCKERHUB_USER/varista-bff:latest
```

Using GitHub Actions for automated publish

1. Add two repository secrets in GitHub: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (create token on Docker Hub).
2. Push to `main` — `.github/workflows/main.yml` builds and pushes both `varista-fe:latest` and `varista-bff:latest`.

Notes & recommendations
- For production, use pinned tags and CI workflows that tag images with the Git commit SHA or tag.
- Consider switching the BFF to set HttpOnly cookies for auth tokens instead of storing tokens in localStorage.
- The Docker Hub username in `DOCKERHUB_USERNAME` must match the image namespace used by the deployment Compose file.
