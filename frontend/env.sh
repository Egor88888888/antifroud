#!/bin/bash

# Директория с файлами приложения
ROOT_DIR=/usr/share/nginx/html

# Проверяем наличие файла с переменными окружения
if [ ! -f "$ROOT_DIR/env-config.js" ]; then
  echo "Creating env-config.js"
  echo "window._env_ = {" > "$ROOT_DIR/env-config.js"
  echo "  API_URL: \"${API_URL:-http://localhost:5000}\"," >> "$ROOT_DIR/env-config.js"
  echo "  ENV: \"${ENV:-production}\"," >> "$ROOT_DIR/env-config.js"
  echo "  APP_VERSION: \"${APP_VERSION:-1.0.0}\"" >> "$ROOT_DIR/env-config.js"
  echo "}" >> "$ROOT_DIR/env-config.js"
fi

# Замена URL API в файлах JavaScript
find "$ROOT_DIR" -type f -name "*.js" -exec sed -i "s|http://localhost:5000|${API_URL:-http://localhost:5000}|g" {} \;

exec "$@" 