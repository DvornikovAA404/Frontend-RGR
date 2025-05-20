document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/videos')
        .then(response => response.json())
        .then(data => {
            const videoList = document.getElementById('video-list');

            if (data.videos && data.videos.length > 0) {
                data.videos.forEach(video => {
                    const videoCard = document.createElement('div');
                    videoCard.classList.add('video-card');

                    const videoElement = document.createElement('video');
                    videoElement.src = `/uploads/${video}`;
                    videoElement.classList.add('video-thumbnail');

                    const title = document.createElement('p');
                    title.textContent = video;

                    videoCard.appendChild(videoElement);
                    videoCard.appendChild(title);
                    videoList.appendChild(videoCard);

                    videoCard.addEventListener('click', () => {
                        window.location.href = `/watch?video=${video}`;
                    });
                });
            } else {
                videoList.innerHTML = '<p>Нет доступных видео</p>';
            }
        })
        .catch(error => console.error('Ошибка загрузки видео:', error));
});
