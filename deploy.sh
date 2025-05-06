#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Скрипт развертывания WareVision Anti-Fraud System ===${NC}"

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Установите Docker и повторите попытку.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose не установлен. Установите Docker Compose и повторите попытку.${NC}"
    exit 1
fi

echo -e "${YELLOW}Проверка наличия файла .env${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Файл .env не найден, создаю из шаблона env.example${NC}"
    cp env.example .env
    echo -e "${GREEN}Файл .env создан. Пожалуйста, отредактируйте его с вашими настройками.${NC}"
    echo -e "${YELLOW}Продолжить с настройками по умолчанию? (y/n)${NC}"
    read -r continue_default
    if [[ $continue_default != "y" ]]; then
        echo -e "${YELLOW}Скрипт остановлен. Отредактируйте файл .env и запустите скрипт снова.${NC}"
        exit 0
    fi
fi

# Создание необходимых директорий
echo -e "${YELLOW}Создание необходимых директорий...${NC}"
mkdir -p nginx/ssl nginx/logs

# Проверка наличия SSL-сертификатов
if [ ! -f "nginx/ssl/warevision-antifraud.crt" ] || [ ! -f "nginx/ssl/warevision-antifraud.key" ]; then
    echo -e "${YELLOW}SSL-сертификаты не найдены, создаю самоподписанные сертификаты для разработки${NC}"
    echo -e "${RED}Предупреждение: Для production рекомендуется использовать сертификаты от доверенного центра сертификации${NC}"
    
    # Создание самоподписанных сертификатов
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/warevision-antifraud.key \
        -out nginx/ssl/warevision-antifraud.crt \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=WareVision/OU=IT/CN=warevision-antifraud.example.com"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Не удалось создать SSL-сертификаты. Проверьте, установлен ли OpenSSL.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Самоподписанные SSL-сертификаты созданы успешно.${NC}"
fi

# Подготовка окружения для Production
echo -e "${YELLOW}Подготовка к развертыванию в production...${NC}"

# Остановка и удаление существующих контейнеров
echo -e "${YELLOW}Остановка существующих контейнеров...${NC}"
docker-compose down

# Удаление dangling images
echo -e "${YELLOW}Очистка неиспользуемых образов...${NC}"
docker image prune -f

# Сборка и запуск контейнеров
echo -e "${YELLOW}Запуск контейнеров в production режиме...${NC}"
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}Произошла ошибка при запуске контейнеров. Проверьте логи Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}Контейнеры успешно запущены.${NC}"

# Проверка доступности сервисов
echo -e "${YELLOW}Проверка доступности сервисов...${NC}"

# Ожидание запуска API Gateway
echo -e "${YELLOW}Ожидание запуска API Gateway...${NC}"
timeout=60
counter=0
while ! curl -s http://localhost:8000/health > /dev/null; do
    counter=$((counter+1))
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}Превышено время ожидания запуска API Gateway.${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
if [ $counter -lt $timeout ]; then
    echo -e "${GREEN}API Gateway успешно запущен.${NC}"
fi

# Проверка доступности фронтенда
echo -e "${YELLOW}Проверка доступности фронтенда...${NC}"
if curl -s -I http://localhost | grep -q "200 OK"; then
    echo -e "${GREEN}Фронтенд успешно запущен.${NC}"
else
    echo -e "${RED}Фронтенд недоступен. Проверьте логи контейнера.${NC}"
fi

echo -e "${GREEN}=== Развертывание завершено ===${NC}"
echo -e "${GREEN}Фронтенд доступен по адресу: https://warevision-antifraud.example.com${NC}"
echo -e "${GREEN}API доступен по адресу: https://api.warevision-antifraud.example.com${NC}"
echo -e "${YELLOW}Для просмотра логов используйте команду: docker-compose logs -f${NC}"

exit 0 