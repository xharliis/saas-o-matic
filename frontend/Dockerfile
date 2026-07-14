# frontend/Dockerfile
FROM node:18-alpine as builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción
RUN pnpm run build

# Servir con nginx
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/dist/saas-o-matic/browser /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]