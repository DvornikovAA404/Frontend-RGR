document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('.modal');
  const authButton = document.querySelector('.auth-button');
  const closeBtn = document.querySelector('.close-btn');
  const logoutButton = document.querySelector('.logout-btn');
  const loginForm = document.getElementById('login');
  const registerForm = document.getElementById('register');
  const chatTabs = document.querySelectorAll('.chat-tabs .tab');
  const chatContents = document.querySelectorAll('.chat-tab-content');
  const modalTabs = document.querySelectorAll('.modal-tabs .tab');
  const modalForms = document.querySelectorAll('.modal-form');
  const promptButtons = document.querySelectorAll('.prompt-btn.register, .prompt-btn.login');
  const savedUsername = localStorage.getItem('username');
  const urlParams = new URLSearchParams(window.location.search);
  const videoName = urlParams.get('video');

  if (videoName) {
        const videoElement = document.querySelector('.video-section video');
        const sourceElement = document.getElementById('video-source');

        if (!videoElement || !sourceElement) {
            console.error("Ошибка: видеоплеер не найден!");
            return;
        }

        sourceElement.src = `/uploads/${videoName}`;
        videoElement.load();
        videoElement.play().catch(error => console.error("Ошибка автостарта видео:", error));
  }

  if (savedUsername) {
    document.querySelector('.username').textContent = savedUsername;
    document.querySelector('.auth-button').classList.add('hidden');
    document.querySelector('.authorized-buttons').classList.remove('hidden');

    if (!document.querySelector('.chat-form-container')) {
        document.getElementById('chat').insertAdjacentHTML('beforeend', `
            <div class="chat-form-container">
                <div class="chat-input-wrapper">
                    <input type="text" id="comment-input" class="chat-input" placeholder="Введите комментарий..." />
                    <button id="submit-comment" class="send-button" aria-label="Отправить">
                        <img src="/static/images/send.png" alt="Отправить" class="send-icon" />
                    </button>
                </div>
                <div class="name-tag">Ваше имя: ${savedUsername}</div>
            </div>
        `);
    }

    const loginPrompt = document.querySelector('.login-prompt');
    if (loginPrompt) loginPrompt.remove();
    modal.classList.add('hidden');

    setTimeout(() => {
        const commentInput = document.getElementById('comment-input');
        const submitButton = document.getElementById('submit-comment');
        const chatContainer = document.querySelector('.chat-messages');

        submitButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (!commentText) return;

            fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_name: videoName, username: savedUsername, comment: commentText })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('message');

                    commentElement.innerHTML = `
                        <div class="message-header">
                            <span class="username">${savedUsername}</span>
                            <div class="like-container">
                                <span class="like-icon" data-id="${data.comment_id}" aria-label="Лайк">❤</span>
                                <span class="like-count">0</span>
                            </div>
                        </div>
                        <div class="message-body">${commentText}</div>
                    `;

                    chatContainer.appendChild(commentElement);
                    commentInput.value = "";
                }
            })
            .catch(error => console.error("Ошибка отправки комментария:", error));
        });
    }, 100);
}

  if (authButton) authButton.addEventListener('click', () => modal.classList.remove('hidden'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  window.addEventListener('click', (event) => {
    if (event.target === modal) modal.classList.add('hidden');
  });

  chatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      chatTabs.forEach(t => t.classList.remove('active'));
      chatContents.forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.remove('hidden');
    });
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.removeItem('username');
          document.querySelector('.username').textContent = "Гость";
          document.querySelector('.auth-button').classList.remove('hidden');
          document.querySelector('.authorized-buttons').classList.add('hidden');

          const chatFormContainer = document.querySelector('.chat-form-container');
          if (chatFormContainer) chatFormContainer.remove();
        }
      })
      .catch(error => console.error('Ошибка выхода:', error));
    });
  }


  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => t.classList.remove('active'));
      modalForms.forEach(f => f.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.remove('hidden');
    });
  });


  promptButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      const targetTab = btn.classList.contains('register') ? 'register' : 'login';
      modalTabs.forEach(t => t.classList.remove('active'));
      modalForms.forEach(f => f.classList.add('hidden'));
      document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
      document.getElementById(targetTab).classList.remove('hidden');
    });
  });

  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);

  document.querySelectorAll('.like-icon').forEach(icon => {
    icon.addEventListener('click', handleLikeClick);
  });

  function handleLogin(event) {
    event.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value;

    if (!email || !password) return displayError(loginForm, "Заполните все поля!");

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => data.success ? handleLoginSuccess(data.username) : displayError(loginForm, data.message))
      .catch(() => displayError(loginForm, "Ошибка сервера!"));
  }

  function handleRegister(event) {
    event.preventDefault();
    const name = registerForm.querySelector('input[name="name"]').value.trim();
    const email = registerForm.querySelector('input[name="email"]').value.trim();
    const password = registerForm.querySelector('input[name="password"]').value;
    const confirmPassword = registerForm.querySelector('input[name="confirm_password"]').value;

    if (!name || !email || !password || !confirmPassword) return displayError(registerForm, "Заполните все поля!");
    if (password !== confirmPassword) return displayError(registerForm, "Пароли не совпадают!");

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, email, password, confirm_password: confirmPassword })
    })
      .then(response => response.json())
      .then(data => data.success ? handleLoginSuccess(data.username) : displayError(registerForm, data.message))
      .catch(() => displayError(registerForm, "Ошибка сервера!"));
  }

function handleLoginSuccess(username) {
    localStorage.setItem('username', username);

    document.querySelector('.username').textContent = username;
    document.querySelector('.auth-button').classList.add('hidden');
    document.querySelector('.authorized-buttons').classList.remove('hidden');
    document.querySelector('.login-prompt')?.remove();

    if (!document.querySelector('.chat-form-container')) {
        document.getElementById('chat').insertAdjacentHTML('beforeend', `
            <div class="chat-form-container">
                <div class="chat-input-wrapper">
                    <input type="text" id="comment-input" class="chat-input" placeholder="Введите комментарий..." />
                    <button id="submit-comment" class="send-button" aria-label="Отправить">
                        <img src="/static/images/send.png" alt="Отправить" class="send-icon" />
                    </button>
                </div>
                <div class="name-tag">Ваше имя: ${username}</div>
            </div>
        `);
    }

    modal.classList.add('hidden');

    setTimeout(() => {
        const commentInput = document.getElementById('comment-input');
        const submitButton = document.getElementById('submit-comment');
        const chatContainer = document.querySelector('.chat-messages');
        const urlParams = new URLSearchParams(window.location.search);
        const videoName = urlParams.get('video');

        submitButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (!commentText) return;

            fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_name: videoName, username: username, comment: commentText })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('message');

                    commentElement.innerHTML = `
                        <div class="message-header">
                            <span class="username">${username}</span>
                            <div class="like-container">
                                <span class="like-icon" data-id="${data.comment_id}" aria-label="Лайк">❤</span>
                                <span class="like-count">0</span>
                            </div>
                        </div>
                        <div class="message-body">${commentText}</div>
                    `;

                    chatContainer.appendChild(commentElement);
                    commentInput.value = "";
                }
            })
            .catch(error => console.error("Ошибка отправки комментария:", error));
        });
    }, 100);
}


  function displayError(form, message) {
    const errorMessage = form.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  }

  function handleLikeClick(event) {
    const button = event.currentTarget;
    const countSpan = button.nextElementSibling;
    let count = parseInt(countSpan.textContent, 10);

    button.classList.toggle('liked');
    countSpan.textContent = button.classList.contains('liked') ? count + 1 : count - 1;
  }


});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('logout-btn')) {
        fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('username');
                document.querySelector('.username').textContent = "Гость";
                document.querySelector('.auth-button').classList.remove('hidden');
                document.querySelector('.authorized-buttons').classList.add('hidden');

                const chatFormContainer = document.querySelector('.chat-form-container');
                if (chatFormContainer) chatFormContainer.remove();
            }
        })
        .catch(error => console.error('Ошибка выхода:', error));
    }
});
