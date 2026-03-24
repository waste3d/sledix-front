# --- Этап сборки ---
FROM node:20-alpine AS builder

WORKDIR /app
    
    # Копируем package.json и package-lock.json
COPY package.json package-lock.json ./
    
    # Устанавливаем зависимости
RUN npm install
    
    # Копируем все файлы приложения
COPY . .
    
    # Собираем Next.js приложение
RUN npm run build
    
    # --- Этап Production (меньший образ для рантайма) ---
FROM node:20-alpine AS runner
    
WORKDIR /app
    
    # Устанавливаем необходимые пакеты (если нужны для рантайма, например, imagemagick для обработки изображений)
    # RUN apk add --no-cache some-runtime-dependency
    
    # Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
    
    # Устанавливаем порт, который будет слушать приложение (обычно 3000 для Next.js)
ENV PORT 3000
EXPOSE 3000
    
    # Запускаем приложение
CMD ["npm", "start"]