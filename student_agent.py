import io
import logging
import os
import queue
import threading
import time
import tkinter as tk
from logging.handlers import RotatingFileHandler
from tkinter import ttk

import mss
import requests
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

log_format = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
file_handler = RotatingFileHandler(
    "student_agent.log",
    maxBytes=512 * 1024,
    backupCount=2,
    encoding="utf-8",
)
file_handler.setFormatter(log_format)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(log_format)

logging.basicConfig(level=logging.INFO, handlers=[file_handler, stream_handler])
logger = logging.getLogger("student_agent")

SERVER_URL = os.getenv("SERVER_URL", "").strip()
API_TOKEN = os.getenv("API_TOKEN", "").strip()
STUDENT_NAME = os.getenv("STUDENT_NAME", "").strip()
CAPTURE_INTERVAL = max(float(os.getenv("CAPTURE_INTERVAL", "1")), 0.2)
MAX_WIDTH = max(int(os.getenv("MAX_WIDTH", "1280")), 320)
MAX_HEIGHT = 720
JPEG_QUALITY = min(max(int(os.getenv("JPEG_QUALITY", "60")), 20), 95)


def require_setting(name: str, value: str) -> None:
    if not value:
        raise RuntimeError(f"{name} .env faylida sozlanishi kerak.")


require_setting("SERVER_URL", SERVER_URL)
require_setting("API_TOKEN", API_TOKEN)
require_setting("STUDENT_NAME", STUDENT_NAME)

if not SERVER_URL.lower().startswith("https://"):
    logger.warning("SERVER_URL HTTPS emas. HTTP faqat ishonchli lokal sinov uchun ishlatilsin.")


class StudentAgent:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.stop_event = threading.Event()
        self.status_queue: queue.Queue[str] = queue.Queue()
        self.worker: threading.Thread | None = None

        root.title("Dars nazorati")
        root.geometry("330x150")
        root.resizable(False, False)
        root.attributes("-topmost", True)
        root.protocol("WM_DELETE_WINDOW", self.stop)

        frame = ttk.Frame(root, padding=16)
        frame.pack(fill="both", expand=True)

        ttk.Label(
            frame,
            text="Dars nazorati ishlayapti",
            font=("Segoe UI", 12, "bold"),
        ).pack(anchor="w")

        self.status_label = ttk.Label(frame, text="Holat: Ulanmoqda...")
        self.status_label.pack(anchor="w", pady=(12, 10))

        self.stop_button = ttk.Button(frame, text="Stop", command=self.stop)
        self.stop_button.pack(anchor="e")

        self.root.after(150, self.update_status)

    def start(self) -> None:
        self.worker = threading.Thread(target=self.capture_loop, daemon=True)
        self.worker.start()

    def stop(self) -> None:
        if self.stop_event.is_set():
            return
        logger.info("Student agent foydalanuvchi tomonidan to'xtatildi.")
        self.stop_event.set()
        self.status_label.config(text="Holat: To'xtatildi")
        self.stop_button.config(state="disabled")
        self.root.after(500, self.root.destroy)

    def update_status(self) -> None:
        try:
            while True:
                status = self.status_queue.get_nowait()
                self.status_label.config(text=f"Holat: {status}")
        except queue.Empty:
            pass
        if not self.stop_event.is_set():
            self.root.after(150, self.update_status)

    @staticmethod
    def capture_jpeg(screen_capture: mss.mss) -> bytes:
        # monitors[1] is the primary monitor. monitors[0] would combine all screens.
        screenshot = screen_capture.grab(screen_capture.monitors[1])
        image = Image.frombytes("RGB", screenshot.size, screenshot.rgb)
        image.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)

        output = io.BytesIO()
        image.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return output.getvalue()

    def capture_loop(self) -> None:
        session = requests.Session()
        headers = {"X-API-Token": API_TOKEN}

        while not self.stop_event.is_set():
            try:
                with mss.mss() as screen_capture:
                    while not self.stop_event.is_set():
                        started_at = time.monotonic()
                        try:
                            image_bytes = self.capture_jpeg(screen_capture)
                            response = session.post(
                                SERVER_URL,
                                headers=headers,
                                data={"student_name": STUDENT_NAME},
                                files={
                                    "screenshot": (
                                        "screenshot.jpg",
                                        image_bytes,
                                        "image/jpeg",
                                    )
                                },
                                timeout=8,
                            )
                            response.raise_for_status()
                            self.status_queue.put("Ulandi")
                            logger.info("Screenshot yuborildi (%d bayt).", len(image_bytes))
                        except requests.RequestException as error:
                            self.status_queue.put("Ulanmadi")
                            logger.warning("Serverga yuborib bo'lmadi: %s", error)
                        except Exception:
                            self.status_queue.put("Xatolik")
                            logger.exception("Screenshot olish yoki yuborishda xatolik.")

                        elapsed = time.monotonic() - started_at
                        self.stop_event.wait(max(0, CAPTURE_INTERVAL - elapsed))
            except Exception:
                if self.stop_event.is_set():
                    break
                self.status_queue.put("Xatolik")
                logger.exception("Ekran olish modulini ishga tushirib bo'lmadi.")
                self.stop_event.wait(3)


def main() -> None:
    root = tk.Tk()
    agent = StudentAgent(root)
    agent.start()
    root.mainloop()


if __name__ == "__main__":
    main()
