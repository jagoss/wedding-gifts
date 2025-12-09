FROM node:18-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN npm install --workspace @wedding-registry/web --workspace @wedding-registry/shared-types

COPY apps/web ./apps/web
COPY packages/shared-types ./packages/shared-types

RUN npm run build --workspace @wedding-registry/web

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copiar package.json raíz para que npm reconozca los workspaces
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/apps/web/.next ./apps/web/.next
COPY --from=base /app/apps/web/public ./apps/web/public
COPY --from=base /app/apps/web/package*.json ./apps/web/

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@wedding-registry/web"]

