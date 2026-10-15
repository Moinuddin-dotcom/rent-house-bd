# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- Runtime stage ----------
FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
EXPOSE 4000
# Apply pending migrations, then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
