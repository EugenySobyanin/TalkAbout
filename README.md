# Локальный запуск проекта TalkAbout

Репозиторий: `https://github.com/EugenySobyanin/TalkAbout`

Проект состоит из двух основных частей:

- `backend` — сервер на Django + Django REST Framework
- `frontend` — клиент на React + Vite

Ниже — пошаговая инструкция для локального запуска проекта с нуля.

---

## 1. Что нужно установить заранее

Перед началом убедитесь, что у вас установлены:

- **Git**
- **Python 3**
- **pip**
- **Node.js**
- **npm**

Проверить можно так:

```bash
git --version
python --version
pip --version
node --version
npm --version
```

> Рекомендуется использовать актуальную версию Python 3 и современную версию Node.js.

---

## 2. Клонирование репозитория

Откройте терминал и выполните:

```bash
git clone https://github.com/EugenySobyanin/TalkAbout.git
cd TalkAbout
```

После клонирования у вас должны быть как минимум папки:

```text
backend
frontend
```

---

## 3. Запуск backend (Django + DRF)

### 3.1. Перейдите в папку backend

```bash
cd backend
```

### 3.2. Создайте виртуальное окружение

#### Windows

```bash
python -m venv venv
```

#### macOS / Linux

```bash
python3 -m venv venv
```

### 3.3. Активируйте виртуальное окружение


#### Windows (cmd)

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

После активации в терминале обычно появляется префикс `(venv)`.

### 3.4. Установите зависимости backend

```bash
pip install -r requirements.txt
```

### 3.5. Примените миграции

```bash
python manage.py migrate
```

Эта команда создаст локальную базу данных SQLite, если её ещё нет.

### 3.6. Создайте суперпользователя (необязательно, но полезно)

```bash
python manage.py createsuperuser
```

Заполните логин, email и пароль.

### 3.7. Запустите backend

```bash
python manage.py runserver
```

После запуска backend будет доступен по адресу:

```text
http://127.0.0.1:8000/
```

Swagger / документация API:

```text
http://127.0.0.1:8000/api/docs/
```

---

## 4. Запуск frontend (React + Vite)

Откройте **второй терминал**.

### 4.1. Перейдите в папку frontend

Из корня проекта:

```bash
cd frontend
```

Если вы всё ещё находитесь в папке `backend`, сначала вернитесь в корень:

```bash
cd ..
cd frontend
```

### 4.2. Установите зависимости frontend

```bash
npm install
```

### 4.3. Запустите frontend

```bash
npm run dev
```

После запуска Vite обычно поднимает приложение на адресе:

```text
http://localhost:5173/
```

---

## 5. В каком порядке запускать

Правильный порядок такой:

1. Запустить **backend** в папке `backend`
2. Запустить **frontend** в папке `frontend`
3. Открыть в браузере:

```text
http://localhost:5173/
```

---
