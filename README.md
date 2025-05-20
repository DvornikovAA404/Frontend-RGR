
Это веб-приложение для загрузки и просмотра видео с возможностью комментирования и лайков.

## 🚀 Установка и запуск

### 🔧 Установка зависимостей

pip install -r requirements.txt

### ▶️ Запуск сервера

python app.py

---

## 🔗 API-методы

### 📌 Регистрация пользователя
- URL: /api/register  
- Метод: POST  
- Тело запроса:
  
{
  "username": "TestUser",
  "email": "test@example.com",
  "password": "securepass",
  "confirm_password": "securepass"
}

- Ответ:

{ "success": true, "message": "Пользователь зарегистрирован!" }

---

### 📌 Вход в систему
- URL: /api/login  
- Метод: POST  
- Тело запроса:
  
{
  "email": "test@example.com",
  "password": "securepass"
}

- Ответ:

{ "success": true, "username": "TestUser" }

---

### 📌 Загрузка видео
- URL: /api/upload  
- Метод: POST  
- Тело запроса (multipart/form-data):

curl -X POST http://127.0.0.1:5000/api/upload -F "video=@video.mp4"

- Ответ:

{ "success": true, "filename": "video.mp4" }

---

### 📌 Получение списка комментариев
- URL: /api/comments?video=video.mp4  
- Метод: GET  
- Ответ:

[
  { "id": 1, "username": "User1", "comment": "Отличное видео!", "likes": 5 },
  { "id": 2, "username": "User2", "comment": "Интересный контент!", "likes": 3 }
]

---

### 📌 Добавление комментария
- URL: /api/comments  
- Метод: POST  
- Тело запроса:
  
{
  "video_name": "video.mp4",
  "username": "User1",
  "comment": "Очень интересно!"
}

- Ответ:

{ "success": true, "comment_id": 3 }

---

### 📌 Лайк комментария
- URL: /api/like  
- Метод: POST  
- Тело запроса:
  
{ "comment_id": 1 }

- Ответ:

{ "success": true, "new_likes": 6 }

---

## 🎬 Интерфейс

- Кнопка "Загрузить видео" – Загружает видео в папку uploads/.
- Комментарии и лайки – Работают динамически.
- Авторизация – Сохраняет данные пользователя в localStorage.

---

## Дополнительно

Проект разработан в целях обучения.

---

## Зависимости

- Flask
- Werkzeug
- psycopg2
- gunicorn
