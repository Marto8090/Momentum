FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
RUN npm ci --workspace @momentum/api

COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/migrations ./apps/api/migrations
RUN npm run build:api && npm prune --omit=dev --workspace @momentum/api

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/apps/mobile/package.json ./apps/mobile/

USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
