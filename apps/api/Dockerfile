FROM node:18-alpine AS base
WORKDIR /app

# Copiamos manifest de workspaces
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared-types/package*.json ./packages/shared-types/

RUN npm install --workspace @wedding-registry/api --workspace @wedding-registry/shared-types

COPY apps/api ./apps/api
COPY packages/shared-types ./packages/shared-types

RUN npm run build --workspace @wedding-registry/api

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copiar package.json raíz para que npm reconozca los workspaces
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package*.json ./apps/api/

EXPOSE 8080
CMD ["npm", "run", "start", "--workspace", "@wedding-registry/api"]

