document.addEventListener('DOMContentLoaded', () => {
  // === Скрытие кнопок для гостей при загрузке ===
  const authorizedButtons = document.querySelector('.authorized-buttons');
  if (authorizedButtons && !authorizedButtons.classList.contains('hidden')) {
    authorizedButtons.classList.add('hidden');
  }

  // === Переключение вкладок чата ===
  document.querySelectorAll('.chat-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Убираем активные классы
      document.querySelectorAll('.chat-tabs .tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.chat-tab-content').forEach(c => c.classList.add('hidden'));

      // Добавляем активный класс текущей вкладке и контенту
      tab.classList.add('active');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  // === Модальное окно: открытие/закрытие ===
  const modal = document.querySelector('.modal');
  const openButtons = document.querySelectorAll('.auth-button, .prompt-btn.register, .prompt-btn.login');
  const closeBtn = document.querySelector('.close-btn');

  // Открытие по кнопкам
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  });

  // Закрытие по крестику
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Закрытие по клику вне окна
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // === Переключение форм внутри модального окна ===
  const tabs = document.querySelectorAll('.modal-tabs .tab');
  const forms = document.querySelectorAll('.modal-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Сброс активных классов
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.add('hidden'));

      // Активируем нужное
      tab.classList.add('active');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  document.querySelectorAll('.modal-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const isLogin = this.id === 'login';
      const errorMessage = this.querySelector('.error-message');
      if (errorMessage) errorMessage.textContent = '';
      let errorText = '';
  
      // Получаем данные формы
      const inputs = this.querySelectorAll('input');
  
      if (isLogin) {
        const email = inputs[0].value.trim();
        const password = inputs[1].value;
  
        // Простая валидация
        if (!email || !password) {
          errorText = 'Пожалуйста, заполните все поля.';
        } else if (!isValidEmail(email)) {
          errorText = 'Некорректный адрес электронной почты.';
        }
      } else {
        const name = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const password = inputs[2].value;
        const confirmPassword = inputs[3].value;
  
        if (!name || !email || !password || !confirmPassword) {
          errorText = 'Пожалуйста, заполните все поля.';
        } else if (!isValidEmail(email)) {
          errorText = 'Некорректный адрес электронной почты.';
        } else if (password.length < 6) {
          errorText = 'Пароль должен содержать минимум 6 символов.';
        } else if (password !== confirmPassword) {
          errorText = 'Пароли не совпадают!';
        }
      }
  
      // Показываем ошибку, если есть
      if (errorText && errorMessage) {
        errorMessage.textContent = errorText;
        errorMessage.style.display = 'block';
        return;
      }
  
      // Эмуляция успешного входа
      const username = isLogin ? 'User' : inputs[0].value.trim();
      setTimeout(() => {
        handleLoginSuccess(username);
        alert(`${isLogin ? 'Добро пожаловать,' : 'Вы зарегистрированы,'} ${username}!`);
      }, 500);
    });
  });
  
  // Проверка email
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // === Логика при успешном входе/регистрации ===
  function handleLoginSuccess(username) {
    // Обновляем имя пользователя
    document.querySelector('.username').textContent = username;

    // Скрываем старую кнопку "Вход / Регистрация"
    const authButton = document.querySelector('.auth-button');
    if (authButton) authButton.classList.add('hidden');

    // Показываем новые кнопки
    const authorizedButtons = document.querySelector('.authorized-buttons');
    if (authorizedButtons) authorizedButtons.classList.remove('hidden');

    // Скрываем промо-блок
    const prompt = document.querySelector('.login-prompt');
    if (prompt) prompt.remove();

    // Проверяем, есть ли уже форма чата
    const existingForm = document.querySelector('.chat-form-container');
    if (!existingForm) {
      const chatContent = document.querySelector('.chat-tab-content#chat');

      // Создаём форму чата с кнопкой отправки через изображение
      const formHTML = `
        <div class="chat-form-container">
          <div class="chat-input-wrapper">
            <input type="text" class="chat-input" placeholder="Введите сообщение..." />
            <button class="send-button" aria-label="Отправить">
              <img src="img/send.png" alt="Отправить" class="send-icon" />
            </button>
          </div>
          <div class="name-tag">Ваше имя: ${username}</div>
        </div>
      `;

      chatContent.insertAdjacentHTML('beforeend', formHTML);
    }

    // Разблокируем лайки
    document.querySelectorAll('.like-icon').forEach(icon => {
      icon.classList.add('like-button');
      icon.classList.remove('like-icon');
      icon.setAttribute('role', 'button');
      icon.setAttribute('tabindex', '0');
      icon.style.pointerEvents = 'auto';
      icon.addEventListener('click', handleLikeClick);
    });

    // Закрываем модальное окно
    modal.classList.add('hidden');
  }

  // === Логика лайков ===
  function handleLikeClick(e) {
    const button = e.currentTarget;
    const countSpan = button.nextElementSibling;
    let count = parseInt(countSpan.textContent);

    if (button.classList.contains('liked')) {
      count--;
      button.classList.remove('liked');
    } else {
      count++;
      button.classList.add('liked');
    }

    countSpan.textContent = count;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const authorizedButtons = document.querySelector('.authorized-buttons');

  // Гарантируем, что кнопки скрыты при загрузке
  if (authorizedButtons) {
    authorizedButtons.classList.add('hidden');
  }
  if (authorizedButtons && !authorizedButtons.classList.contains('hidden')) {
    authorizedButtons.classList.add('hidden');
  }

  // === Переключение вкладок чата ===
  document.querySelectorAll('.chat-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      document.querySelectorAll('.chat-tabs .tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.chat-tab-content').forEach(c => c.classList.add('hidden'));

      tab.classList.add('active');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  // === Модальное окно: открытие/закрытие ===
  const modal = document.querySelector('.modal');
  const openButtons = document.querySelectorAll('.auth-button, .prompt-btn.register, .prompt-btn.login');
  const closeBtn = document.querySelector('.close-btn');

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // === Переключение форм внутри модального окна ===
  const tabs = document.querySelectorAll('.modal-tabs .tab');
  const forms = document.querySelectorAll('.modal-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.add('hidden'));

      tab.classList.add('active');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  // === Обработка форм входа и регистрации ===
  document.querySelectorAll('.modal-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const isLogin = this.id === 'login';

      const inputs = this.querySelectorAll('input');
      const data = {
        name: isLogin ? 'User' : inputs[0].value.trim(),
        email: isLogin ? inputs[0].value.trim() : inputs[1].value.trim(),
        password: isLogin ? inputs[1].value : inputs[2].value,
      };

      if (!isLogin) {
        const confirmPassword = inputs[3].value;
        if (data.password !== confirmPassword) {
          alert('Пароли не совпадают!');
          return;
        }
      }

      setTimeout(() => {
        handleLoginSuccess(data.name);
        alert(`${isLogin ? 'Добро пожаловать,' : 'Вы зарегистрированы,'} ${data.name}!`);
      }, 500);
    });
  });

  // === Логика при успешном входе/регистрации ===
  function handleLoginSuccess(username) {
    document.querySelector('.username').textContent = username;

    const authButton = document.querySelector('.auth-button');
    if (authButton) authButton.classList.add('hidden');

    const authorizedButtons = document.querySelector('.authorized-buttons');
    if (authorizedButtons) authorizedButtons.classList.remove('hidden');

    const prompt = document.querySelector('.login-prompt');
    if (prompt) prompt.remove();

    const existingForm = document.querySelector('.chat-form-container');
    if (!existingForm) {
      const chatContent = document.querySelector('.chat-tab-content#chat');

      const formHTML = `
  <div class="chat-form-container">
    <div class="chat-input-wrapper">
      <input type="text" class="chat-input" placeholder="Введите сообщение..." />
      <button class="send-button" aria-label="Отправить">
        <img src="send.png" alt="Отправить" class="send-icon" />
      </button>
    </div>
    <div class="name-tag">Ваше имя: ${username}</div>
  </div>
`;

      chatContent.insertAdjacentHTML('beforeend', formHTML);
    }

    document.querySelectorAll('.like-icon').forEach(icon => {
      icon.classList.add('like-button');
      icon.classList.remove('like-icon');
      icon.setAttribute('role', 'button');
      icon.setAttribute('tabindex', '0');
      icon.style.pointerEvents = 'auto';
      icon.addEventListener('click', handleLikeClick);
    });

    modal.classList.add('hidden');
  }

  // === Логика лайков ===
  function handleLikeClick(e) {
    const button = e.currentTarget;
    const countSpan = button.nextElementSibling;
    let count = parseInt(countSpan.textContent);

    if (button.classList.contains('liked')) {
      count--;
      button.classList.remove('liked');
    } else {
      count++;
      button.classList.add('liked');
    }

    countSpan.textContent = count;
  }
});