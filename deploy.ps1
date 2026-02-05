# Build, push, and deploy srishna-manual-posts-ui to Google Cloud Run
# Usage:
#   1. From project root (srishna-manual-posts-ui): .\deploy.ps1
#   2. If UI changes don't appear, use: .\deploy.ps1 -NoCache
#
# Optional: pass backend URL as argument
#   .\deploy.ps1 -BackendUrl "https://srishna-image-upload-xxxxx-as.a.run.app"

param(
    # Production backend; override if needed
    [string]$BackendUrl = $env:BACKEND_URL,
    # Force full rebuild so UI changes are included (use when deploy shows old version)
    [switch]$NoCache
)
if (-not $BackendUrl) {
    $BackendUrl = "https://srishna-image-upload-712085419978.asia-south1.run.app"
}

$Image = "gcr.io/global-repeater-479306-s2/srishna-manual-posts-ui:latest"
$Service = "srishna-manual-posts-ui"
$Region = "asia-south1"

# API base URL must end with /api (backend serves under /api)
$ApiUrl = if ($BackendUrl) { "$($BackendUrl.TrimEnd('/'))/api" } else { "/api" }

$BuildArgs = @("-t", $Image, "--build-arg", "VITE_API_URL=$ApiUrl")
if ($NoCache) {
    $BuildArgs += "--no-cache"
    Write-Host "Building image with --no-cache (VITE_API_URL=$ApiUrl)..." -ForegroundColor Cyan
} else {
    Write-Host "Building image (VITE_API_URL=$ApiUrl)..." -ForegroundColor Cyan
}
docker build @BuildArgs .

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing to GCR..." -ForegroundColor Cyan
docker push $Image

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $Service `
  --image $Image `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Service URL will be shown above." -ForegroundColor Green
