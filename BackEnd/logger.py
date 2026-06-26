"""
Modul logging terpusat untuk Toko Sembako AI
Menyediakan logger per komponen dengan format konsisten
"""
import logging
import sys

# Format logging: [TIMESTAMP] [LEVEL] [COMPONENT] message
LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _create_handler():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    return handler


_handler = _create_handler()


def get_logger(name: str) -> logging.Logger:
    """
    Buat atau ambil logger untuk komponen tertentu.

    Contoh:
        from BackEnd.logger import get_logger
        log = get_logger("email")
        log.info("Email berhasil dikirim ke user@example.com")
    """
    logger = logging.getLogger(f"sembako.{name}")
    if not logger.handlers:
        logger.addHandler(_handler)
        logger.setLevel(logging.DEBUG)
        logger.propagate = False
    return logger
