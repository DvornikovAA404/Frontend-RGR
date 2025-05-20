document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.querySelector('.upload-video-btn');
    const fileInput = document.getElementById('video-upload');


    if (!uploadButton || !fileInput) {
        console.error("Ошибка: Кнопка или поле загрузки видео отсутствуют в DOM!");
        return;
    }

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error("Файл не выбран.");
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Видео успешно загружено!');
                console.log("Загружен файл:", data.filename);
            } else {
                alert('Ошибка загрузки: ' + data.message);
                console.error("Ошибка загрузки:", data.message);
            }
        })
        .catch(error => console.error("Ошибка запроса:", error));
    });
});
