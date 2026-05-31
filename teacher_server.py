import hmac
import io
import logging
import os
import re
import threading
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, Response, abort, jsonify, render_template, request
from PIL import Image, UnidentifiedImageError

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("teacher_server")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 3 * 1024 * 1024

API_TOKEN = os.getenv("API_TOKEN", "")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
OFFLINE_SECONDS = int(os.getenv("OFFLINE_SECONDS", "10"))

STUDENT_NAME_PATTERN = re.compile(r"^[\w .-]{1,64}$", re.UNICODE)
students: dict[str, dict] = {}
students_lock = threading.Lock()


def require_setting(name: str, value: str) -> None:
    if not value:
        raise RuntimeError(f"{name} .env faylida sozlanishi kerak.")


require_setting("API_TOKEN", API_TOKEN)
require_setting("ADMIN_USERNAME", ADMIN_USERNAME)
require_setting("ADMIN_PASSWORD", ADMIN_PASSWORD)


def is_dashboard_authorized() -> bool:
    auth = request.authorization
    return bool(
        auth
        and hmac.compare_digest(auth.username or "", ADMIN_USERNAME)
        and hmac.compare_digest(auth.password or "", ADMIN_PASSWORD)
    )


def dashboard_login_required(view):
    def wrapped(*args, **kwargs):
        if not is_dashboard_authorized():
            return Response(
                "Dashboard login va parol bilan himoyalangan.",
                401,
                {"WWW-Authenticate": 'Basic realm="Dars nazorati"'},
            )
        return view(*args, **kwargs)

    wrapped.__name__ = view.__name__
    return wrapped


def upload_token_is_valid() -> bool:
    supplied_token = request.headers.get("X-API-Token", "")
    return hmac.compare_digest(supplied_token, API_TOKEN)


def valid_jpeg(image_bytes: bytes) -> bool:
    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            image.verify()
            return image.format == "JPEG"
    except (UnidentifiedImageError, OSError):
        return False


@app.post("/upload")
def upload():
    if not upload_token_is_valid():
        abort(401, description="API token noto'g'ri.")

    student_name = request.form.get("student_name", "").strip()
    if not STUDENT_NAME_PATTERN.fullmatch(student_name):
        abort(400, description="Student nomi noto'g'ri.")

    screenshot = request.files.get("screenshot")
    if screenshot is None:
        abort(400, description="Screenshot yuborilmadi.")

    image_bytes = screenshot.read()
    if not image_bytes or not valid_jpeg(image_bytes):
        abort(400, description="Faqat haqiqiy JPEG screenshot qabul qilinadi.")

    now = time.time()
    with students_lock:
        students[student_name] = {
            "image": image_bytes,
            "last_seen": now,
        }

    logger.info("%s screenshot yubordi (%d bayt).", student_name, len(image_bytes))
    return jsonify({"ok": True})


@app.get("/")
@dashboard_login_required
def dashboard():
    return render_template("dashboard.html", offline_seconds=OFFLINE_SECONDS)


@app.get("/api/students")
@dashboard_login_required
def student_list():
    now = time.time()
    with students_lock:
        result = [
            {
                "name": name,
                "last_seen": datetime.fromtimestamp(
                    data["last_seen"], tz=timezone.utc
                ).isoformat(),
                "online": now - data["last_seen"] <= OFFLINE_SECONDS,
                "screenshot_url": f"/screenshots/{name}",
            }
            for name, data in sorted(students.items())
        ]
    return jsonify(result)


@app.get("/screenshots/<student_name>")
@dashboard_login_required
def latest_screenshot(student_name: str):
    with students_lock:
        student = students.get(student_name)
        if student is None:
            abort(404)
        image_bytes = student["image"]

    return Response(
        image_bytes,
        mimetype="image/jpeg",
        headers={"Cache-Control": "no-store, max-age=0"},
    )


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "Screenshot hajmi juda katta."}), 413


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    logger.info("Teacher server http://%s:%d manzilida ishga tushmoqda.", host, port)
    app.run(host=host, port=port, debug=debug)
