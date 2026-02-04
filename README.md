# Srishna Manual Posts – UI

React frontend for uploading posts and managing the posts list (active/inactive).

## Setup

```bash
npm install
```

## Run

Start the backend (srishna-manual-posts) on port 8080, then:

```bash
npm run dev
```

Open http://localhost:5173. The app proxies `/api` to `http://localhost:8080`.

**Logo:** Place the Srishna logo image at `public/logo.png`. It is used in the header, footer, and as the browser tab favicon. Use a PNG with transparent or dark background (e.g. light gray on transparent). If `logo.png` is missing, the app falls back to `favicon.svg`.

## Features

- **Posts** – Data table of all posts (sign-in required). Search, sort, export CSV, pagination. Activate/Deactivate posts.
- **Upload** – Add a new post (image + optional caption).
  - Image thumbnail, caption, date
  - Status (Active / Inactive)
  - **Activate** / **Deactivate** – Show or hide from the public list. Inactive posts are excluded from `GET /api/posts/list`.

## Build

```bash
npm run build
```

Output is in `dist/`. For production, point the backend’s CORS and `app.base-url` to your frontend URL.

## Docker & Cloud Run deploy

Build the image (default points to prod backend `https://srishna-image-upload-712085419978.asia-south1.run.app`):

```powershell
docker build -t gcr.io/global-repeater-479306-s2/srishna-manual-posts-ui:latest .
docker push gcr.io/global-repeater-479306-s2/srishna-manual-posts-ui:latest
gcloud run deploy srishna-manual-posts-ui `
  --image gcr.io/global-repeater-479306-s2/srishna-manual-posts-ui:latest `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300
```

Or set `$env:BACKEND_URL` to your backend URL and run `.\deploy.ps1`.
