# --- Stage 1: build du front Vite/Vue ---
FROM node:22-alpine AS build
WORKDIR /app

# Cache des deps : on copie d'abord les manifests
COPY package.json package-lock.json ./
RUN npm ci

# Copie de la source + build
COPY . .

# URL de l'API backend, injectée au build (Vite fige les VITE_* à la compilation)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- Stage 2: service statique via Nginx ---
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
