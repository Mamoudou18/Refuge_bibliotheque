# Étape 1 : Build de l'application Angular
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# Étape 2 : Conteneur léger qui copie le build vers le volume partagé
FROM alpine:3.23

# Copier le build Angular depuis l'étape précédente
COPY --from=build /app/dist/frontend/browser /shared_build

# Copie vers le volume monté au runtime, puis reste actif pour le healthcheck
CMD ["sh", "-c", "cp -r /shared_build/* /shared/ && tail -f /dev/null"]