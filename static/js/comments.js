document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoName = urlParams.get('video');

    if (!videoName) return;

    fetch(`/api/comments?video=${videoName}`)
        .then(response => response.json())
        .then(comments => {
            const chatContainer = document.querySelector('.chat-messages');
            chatContainer.innerHTML = "";

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('message');

                commentElement.innerHTML = `
                    <div class="message-header">
                        <span class="username">${comment.username}</span>
                        <div class="like-container">
                            <span class="like-icon" data-id="${comment.id}" aria-label="Лайк">❤</span>
                            <span class="like-count">${comment.likes}</span>
                        </div>
                    </div>
                    <div class="message-body">
                        ${comment.comment}
                    </div>
                `;
                chatContainer.appendChild(commentElement);

                const likeButton = commentElement.querySelector('.like-icon');
                const likeCount = commentElement.querySelector('.like-count');

                likeButton.addEventListener('click', () => {
                    fetch('/api/like', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comment_id: comment.id })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            likeCount.textContent = data.new_likes;
                            likeButton.classList.add('liked');
                        }
                    })
                    .catch(error => console.error("Ошибка лайка:", error));
                });
            });
        })
        .catch(error => console.error("Ошибка загрузки комментариев:", error));
});
