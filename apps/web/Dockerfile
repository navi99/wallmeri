# ── Stage 1: install deps & build ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_API_URL must be passed as a build arg so it is baked into the
# client bundle (Next.js public env vars are resolved at build time, not runtime).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ENV NODE_ENV=production
RUN npm run build

# ── Stage 2: minimal runtime image ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output bundles everything needed to run the server.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# public/ assets served by the standalone server
COPY --from=builder /app/public ./public

# Render injects PORT; fall back to 3000 for local testing.
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
