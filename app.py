import os
from flask import Flask, render_template, request, session, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

import os
import psycopg2


app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.urandom(24)
print("Все файлы в uploads:", os.listdir('uploads'))

conn = psycopg2.connect(
    dbname="video_platform",
    user="postgres",
    password="807455",
    host="localhost",
    port="5432"
)

cursor = conn.cursor()

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/videos')
def get_videos():
    try:
        videos = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith(('.mp4', '.avi', '.mkv'))]
        print("Найденные видео:", videos)
        return jsonify({'videos': videos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments', methods=['GET'])
def get_comments():
    video_name = request.args.get('video')
    if not video_name:
        return jsonify({"error": "Название видео не передано"}), 400

    cursor.execute("SELECT id, username, comment, likes FROM comments WHERE video_name = %s", (video_name,))
    comments = cursor.fetchall()

    return jsonify([{"id": row[0], "username": row[1], "comment": row[2], "likes": row[3]} for row in comments])

@app.route('/api/comments', methods=['POST'])
def add_comment():
    data = request.json
    video_name = data.get("video_name")
    username = data.get("username")
    comment = data.get("comment")

    if not video_name or not username or not comment:
        return jsonify({"error": "Все поля обязательны"}), 400

    cursor.execute("INSERT INTO comments (video_name, username, comment) VALUES (%s, %s, %s) RETURNING id",
                   (video_name, username, comment))
    conn.commit()
    comment_id = cursor.fetchone()[0]

    return jsonify({"success": True, "comment_id": comment_id, "message": "Комментарий добавлен!"}), 201

@app.route('/api/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"success": False, "message": "Файл не найден"}), 400

    video = request.files['video']
    if video.filename == '':
        return jsonify({"success": False, "message": "Выберите файл"}), 400

    if not video.filename.endswith('.mp4'):
        return jsonify({"success": False, "message": "Допустим только формат MP4"}), 400

    filename = secure_filename(video.filename)
    video.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    return jsonify({"success": True, "message": "Видео загружено!", "filename": filename})


@app.route('/api/like', methods=['POST'])
def like_comment():
    data = request.json
    comment_id = data.get("comment_id")

    if not comment_id:
        return jsonify({"error": "ID комментария обязателен"}), 400

    cursor.execute("UPDATE comments SET likes = likes + 1 WHERE id = %s RETURNING likes", (comment_id,))
    conn.commit()
    new_likes = cursor.fetchone()[0]

    return jsonify({"success": True, "new_likes": new_likes})



def register_user(name, email, password_hash):
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
            (name, email, password_hash)
        )
        conn.commit()
        return cursor.fetchone()[0]
    except psycopg2.Error as e:
        conn.rollback()
        print("Ошибка:", e)
        return None

def get_user_by_email(email):
    cursor.execute("SELECT id, name, password FROM users WHERE email = %s", (email,))
    return cursor.fetchone()



@app.route('/')
def home():
    return render_template('catalog.html')

@app.route('/watch')
def watch():
    video = request.args.get('video')
    if not video:
        return "Видео не найдено", 404
    return render_template('index.html', video=video)



@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    print("Полученные данные:", data)
    name = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all([name, email, password, confirm_password]):
        return jsonify({'success': False, 'message': 'Заполните все поля'}), 400

    if password != confirm_password:
        return jsonify({'success': False, 'message': 'Пароли не совпадают'}), 400

    hashed_password = generate_password_hash(password)

    try:
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
                       (name, email, hashed_password))
        conn.commit()
        user_id = cursor.fetchone()[0]
        return jsonify({'success': True, 'user_id': user_id, 'username': name}), 201
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({'success': False, 'message': 'Этот email уже зарегистрирован'}), 400


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Заполните все поля'}), 400

    cursor.execute("SELECT id, name, password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user or not check_password_hash(user[2], password):
        return jsonify({'success': False, 'message': 'Неверные учетные данные'}), 400

    session['user'] = user[1]
    return jsonify({'success': True, 'username': user[1]}), 200


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user', None)
    return jsonify({'success': True}), 200


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)


if __name__ == '__main__':
    app.run(debug=True)
