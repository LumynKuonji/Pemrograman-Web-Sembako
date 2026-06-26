"""
Email Service — Thin wrapper yang mendelegasikan ke mail_service.py
File ini dipertahankan agar import lama tetap berfungsi:
  from BackEnd.Services.email_service import send_invoice_email, send_order_status_email, ...
"""
from BackEnd.Services.mail_service import (
    send_email,
    send_otp_email,
    send_invoice_email,
    send_order_status_email,
    send_security_email,
    generate_otp_email,
    generate_receipt_email,
    log_startup_config,
)


def init_mail(app):
    """
    No-op — Flask-Mail tidak lagi digunakan.
    Email dikirim langsung via smtplib di mail_service.py.
    Fungsi ini dipertahankan agar app.py tidak error.
    """
    log_startup_config()
    return None


__all__ = [
    "init_mail",
    "send_email",
    "send_otp_email",
    "send_invoice_email",
    "send_order_status_email",
    "send_security_email",
    "generate_otp_email",
    "generate_receipt_email",
]
