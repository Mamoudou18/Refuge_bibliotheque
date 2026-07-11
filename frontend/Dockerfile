# Stage commun
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage DEV : watch mode
FROM base AS dev
COPY . .
CMD ["npx", "ng", "build", "--watch", "--output-path=/shared", "--poll", "2000"]

# Stage PROD : build unique
FROM base AS prod-build
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine AS prod
COPY --from=prod-build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80