Мануал по интеграции фронтенда и бэкенда
Этот документ предназначен для бэкенд-разработчика, которому нужно подключить готовый интерфейс к серверной части на Python (Flask, FastAPI и т.д.) с использованием баз данных.   

    Структура фронтенда
    Фронтенд состоит из:
     

    index.html — основная страница сайта  
    style.css — визуальный стиль сайта  
    script.js — логика работы чата, форм, лайков, модальных окон  
    img/send.png — иконка кнопки отправки сообщения
     

    Основные элементы интерфейса
     

    .auth-button — кнопка "Вход / Регистрация" (открывает модальное окно)  
    .authorized-buttons — блок с кнопками после входа (Загрузить видео, Начать трансляцию, Выйти)  
    .chat-input-wrapper — поле ввода сообщений (появляется после входа)  
    .like-button — лайк сообщения (кликабельный только для авторизованных)  
    .logout-btn — выход из аккаунта
     

    API-методы
    3.1. Регистрация и вход
    POST /register (тело: name, email, password)
    POST /login (тело: email, password)
    GET /logout
     

3.2. Сообщения чата
GET /api/chat/messages — получение списка сообщений
POST /api/chat/messages — отправка нового сообщения   

3.3. Лайки
POST /api/chat/like (тело: message_id, action)   

3.4. Загрузка видео
POST /api/video/upload — загрузка файла (multipart/form-data)
GET /api/video/current — данные текущего видео   

3.5. Трансляции
GET /stream — ссылка на трансляцию
WebSocket /ws/stream — общение между участниками   

    Пример структуры БД (SQLAlchemy)
    User: id, name, email, password
    Message: id, user_id, text, likes
    Like: id, message_id, user_id   

    Связь фронтенд ↔ бэкенд 
     

    Регистрация: fetch('/register') + JSON  
    Вход: fetch('/login') + JSON  
    Выход: fetch('/logout')  
    Получить сообщения: fetch('/api/chat/messages')  
    Отправить сообщение: fetch('/api/chat/messages', { method: POST })  
    Лайкнуть сообщение: fetch('/api/chat/like', { body: JSON })
     

    Авторизация
    Используйте сессии или JWT. Храните пароли в хэшированном виде. Используйте CSRF-защиту.   

    Дополнительно 
     

    WebSockets для реального времени  
    Админка для управления  
    Аватары и уведомления
     