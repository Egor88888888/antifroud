#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Запуск WareVision Anti-Fraud System${NC}"
echo -e "${BLUE}=======================================${NC}"

# Переходим в директорию проекта
cd "$(dirname "$0")"

# Проверяем доступность портов
frontend_port=3000
backend_port=5000

check_port() {
  if command -v lsof >/dev/null 2>&1; then
    if lsof -i:$1 > /dev/null 2>&1; then
      echo -e "${RED}Порт $1 занят. Попытка остановить процесс...${NC}"
      if command -v kill >/dev/null 2>&1; then
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 1
      else
        echo -e "${RED}Команда kill не найдена. Пожалуйста, освободите порт $1 вручную.${NC}"
        exit 1
      fi
    fi
  else
    echo -e "${BLUE}Команда lsof не найдена. Пропускаем проверку портов.${NC}"
  fi
}

check_port $frontend_port
check_port $backend_port

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}Устанавливаем зависимости для основного проекта...${NC}"
  npm install
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${BLUE}Устанавливаем зависимости для фронтенда...${NC}"
  cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
  echo -e "${BLUE}Устанавливаем зависимости для бэкенда...${NC}"
  cd backend && npm install && cd ..
fi

# Запускаем проект
echo -e "${GREEN}Запускаем WareVision Anti-Fraud System...${NC}"
echo -e "${BLUE}Фронтенд будет доступен по адресу:${NC} http://localhost:$frontend_port"
echo -e "${BLUE}Бэкенд API будет доступен по адресу:${NC} http://localhost:$backend_port/api"
echo -e "${BLUE}=======================================${NC}"

# Запускаем проект с помощью concurrently
if [ -x "$(command -v npm)" ]; then
  echo -e "${BLUE}Запускаем сервисы с помощью npm...${NC}"
  npm start
else
  echo -e "${RED}npm не найден. Запуск невозможен.${NC}"
  exit 1
fi 