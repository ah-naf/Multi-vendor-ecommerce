# Stage 1: Build
FROM node:18 AS builder

WORKDIR /usr/src/app/frontend

COPY package*.json ./
RUN npm install

ENV NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
ENV NEXT_PUBLIC_BACKEND_BASE_URL=http://127.0.0.1:5000

COPY . .

# Stage 2: Production
# Use distroless image for prod
FROM node:18-alpine

WORKDIR /usr/src/app/frontend

COPY --from=builder /usr/src/app/frontend/public /usr/src/app/frontend/public
COPY --from=builder /usr/src/app/frontend/.next /usr/src/app/frontend/.next
COPY --from=builder /usr/src/app/frontend/node_modules /usr/src/app/frontend/node_modules
COPY --from=builder /usr/src/app/frontend/package.json /usr/src/app/frontend/package.json


EXPOSE 3000
CMD ["npm", "run", "dev"]
