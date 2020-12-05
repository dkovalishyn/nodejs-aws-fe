FROM node:slim as builder
RUN apt-get update
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clear --force
COPY . .
RUN npm run build

FROM node:slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/dist ./
USER node
EXPOSE 4000
ENTRYPOINT ["node", "main.js"]
