#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Скрипт бесплатного развертывания WareVision Anti-Fraud System ===${NC}"

# Проверка наличия необходимых инструментов
echo -e "${YELLOW}Проверка наличия необходимых инструментов...${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm не установлен. Установите Node.js и npm, затем повторите попытку.${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}git не установлен. Установите git и повторите попытку.${NC}"
    exit 1
fi

# Проверка наличия Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}Netlify CLI не установлен. Устанавливаю...${NC}"
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo -e "${RED}Не удалось установить Netlify CLI. Проверьте права доступа.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Netlify CLI успешно установлен.${NC}"
fi

# Подготовка репозитория
echo -e "${YELLOW}Подготовка репозитория...${NC}"

# Проверка на чистоту рабочей директории git
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}У вас есть незафиксированные изменения. Хотите продолжить? (y/n)${NC}"
    read -r continue_uncommitted
    if [[ $continue_uncommitted != "y" ]]; then
        echo -e "${YELLOW}Зафиксируйте изменения и запустите скрипт снова.${NC}"
        exit 0
    fi
fi

# Сборка фронтенда
echo -e "${YELLOW}Сборка фронтенда...${NC}"
cd frontend
npm ci
if [ $? -ne 0 ]; then
    echo -e "${RED}Не удалось установить зависимости фронтенда.${NC}"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Не удалось собрать фронтенд.${NC}"
    exit 1
fi
cd ..

# Развертывание на Netlify
echo -e "${YELLOW}Развертывание фронтенда на Netlify...${NC}"
netlify deploy --dir=frontend/build --prod
if [ $? -ne 0 ]; then
    echo -e "${RED}Не удалось развернуть на Netlify. Возможно, вам нужно авторизоваться: netlify login${NC}"
    exit 1
fi

# Вывод инструкций для Render
echo -e "${GREEN}Фронтенд успешно развернут на Netlify!${NC}"
echo -e "${YELLOW}Для развертывания бэкенда на Render:${NC}"
echo -e "1. Зарегистрируйтесь на https://render.com/"
echo -e "2. Подключите ваш GitHub репозиторий"
echo -e "3. Создайте новый Blueprint, используя render.yaml из корня репозитория"
echo -e "4. Следуйте инструкциям Render для завершения развертывания"
echo -e ""
echo -e "${YELLOW}После развертывания бэкенда:${NC}"
echo -e "1. Получите URL вашего бэкенд-сервиса из Render Dashboard"
echo -e "2. Обновите переменную REACT_APP_API_URL в настройках сайта на Netlify"
echo -e ""
echo -e "${GREEN}Откройте ссылку на ваш сайт Netlify для доступа к системе${NC}"

exit 0 