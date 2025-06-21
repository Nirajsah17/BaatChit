# Multi-stage build for client
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy client package files
COPY package*.json ./
RUN npm ci --only=production

# Copy client source
COPY . .

# Build client
RUN npm run build

# Server stage
FROM node:18-alpine AS server

WORKDIR /app

# Copy server package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server source
COPY server/ .

# Copy built client files
COPY --from=client-build /app/client/dist ./public

EXPOSE 3001

CMD ["npm", "start"]