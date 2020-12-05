FROM node:15-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clear --force
COPY . .
RUN npm run build

FROM node:15-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/dist ./
USER node
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["node", "main.js"]
