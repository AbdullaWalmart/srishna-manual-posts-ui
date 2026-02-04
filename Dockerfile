# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# API base URL for production (backend Cloud Run service)
ARG VITE_API_URL=https://srishna-image-upload-712085419978.asia-south1.run.app/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Run stage: serve static files on port 8080 (Cloud Run default)
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

# Cloud Run sets PORT; fallback to 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
