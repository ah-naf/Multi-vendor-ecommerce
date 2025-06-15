# Stage 1: Build
FROM node:18 AS builder

WORKDIR /usr/src/app/backend

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Production
# Use distroless image for prod
FROM node:18-alpine

WORKDIR /usr/src/app/backend

COPY --from=builder /usr/src/app/backend /usr/src/app/backend

EXPOSE 5000
CMD ["node", "server.js"]
