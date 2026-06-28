"""
Mail Service untuk Toko Sembako AI
Satu-satunya service pengirim email — menggunakan smtplib langsung.
Semua modul lain harus mengimpor dari sini.
"""
import os
import smtplib
import socket
import traceback
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from datetime import datetime
from BackEnd.Database.database import EmailLog, db
from BackEnd.logger import get_logger

log = get_logger("email")

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def get_mail_config():
    """
    Membaca konfigurasi email langsung dari environment variables Railway.
    """
    provider = os.getenv("MAIL_PROVIDER", "console").strip().lower()
    smtp_server = os.getenv("MAIL_SMTP_SERVER", "").strip()
    smtp_port = os.getenv("MAIL_SMTP_PORT", "587").strip()
    use_tls = os.getenv("MAIL_USE_TLS", "True").strip()
    username = os.getenv("MAIL_USERNAME", "").strip()
    password = os.getenv("MAIL_PASSWORD", "").strip()

    if password:
        password = password.replace(" ", "")

    default_sender = os.getenv("MAIL_DEFAULT_SENDER", "").strip()
    if not default_sender:
        if username:
            default_sender = f"Toko Sembako <{username}>"
        else:
            default_sender = "Toko Sembako <noreply@tokosembako.com>"

    # Auto-detect provider jika parameter SMTP lengkap
    if provider == "console" and smtp_server and username and password:
        provider = "smtp"

    return {
        "provider": provider,
        "smtp_server": smtp_server,
        "smtp_port": int(smtp_port) if smtp_port.isdigit() else 587,
        "use_tls": use_tls.lower() in ("true", "1", "yes"),
        "username": username,
        "password": password,
        "default_sender": default_sender,
    }


def log_startup_config():
    """Log konfigurasi email saat startup untuk debugging."""
    config = get_mail_config()
    log.info("=" * 50)
    log.info("KONFIGURASI EMAIL")
    log.info(f"  Provider    : {config['provider']}")
    if config["provider"] == "smtp":
        log.info(f"  SMTP Server : {config['smtp_server']}")
        log.info(f"  SMTP Port   : {config['smtp_port']}")
        log.info(f"  TLS         : {config['use_tls']}")
        log.info(f"  Username    : {config['username']}")
        log.info(f"  Password    : {'***' + config['password'][-4:] if len(config['password']) >= 4 else '(not set)'}")
    log.info(f"  Sender      : {config['default_sender']}")

    if config["provider"] == "console":
        log.warning("  MODE: Console — email TIDAK dikirim, hanya di-log ke database")
    elif config["provider"] == "smtp" and (not config["smtp_server"] or not config["username"] or not config["password"]):
        log.warning("  MODE: Konfigurasi SMTP belum lengkap — email akan di-log saja")
    else:
        log.info("  MODE: SMTP aktif — email akan dikirim")
    log.info("=" * 50)


def log_email_to_db(to_email, subject, html_content, email_type, status, error_message=None):
    """Log email ke database"""
    try:
        entry = EmailLog(
            recipient=to_email,
            subject=subject,
            html_content=html_content,
            email_type=email_type,
            status=status,
            error_message=error_message,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        log.error(f"Gagal menyimpan email log ke database: {e}")


def _handle_smtp_exception(e, error_msg, recipient, subject, html_content, email_type, server):
    """Helper untuk logging error SMTP, stack trace, dan menyimpan kegagalan ke DB."""
    tb_str = traceback.format_exc()
    log.error("=" * 60)
    log.error(f"[SMTP ERROR] {error_msg}")
    log.error("STACK TRACE:")
    log.error(tb_str)
    log.error("=" * 60)

    if server:
        try:
            log.info("Mencoba menutup koneksi server secara paksa setelah terjadi error...")
            server.close()
        except Exception as e_close:
            log.warning(f"Gagal menutup koneksi server secara paksa: {e_close}")

    log_email_to_db(recipient, subject, html_content, email_type, status="failed", error_message=f"{error_msg}\n\nStacktrace:\n{tb_str}")
    return False, error_msg


def send_email(to_email, subject, html_content, email_type="general"):
    """
    Mengirim email via SMTP atau log ke database jika provider console.

    Args:
        to_email: Email penerima
        subject: Subject email
        html_content: Konten HTML email
        email_type: Tipe email ('otp', 'invoice', 'status', 'security')

    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    config = get_mail_config()

    # Redirection untuk development
    redirect_to = os.getenv("MAIL_REDIRECT_TO")
    original_recipient = to_email
    if redirect_to and redirect_to.strip():
        to_email = redirect_to.strip()
        subject = f"[DEV REDIRECT to {original_recipient}] {subject}"
        log.info(f"Email redirect aktif: {original_recipient} → {to_email}")

    provider = config["provider"]

    is_console = provider == "console"
    is_incomplete_smtp = (provider == "smtp" and (not config["smtp_server"] or not config["username"]))
    is_unsupported_provider = provider != "smtp"
    
    if is_console or is_incomplete_smtp or is_unsupported_provider:
        log_email_to_db(original_recipient, subject, html_content, email_type, status="logged")
        log.info(f"[CONSOLE MODE] Email disimulasikan ke {original_recipient} — subject: '{subject}'")
        return True, None

    # Logging detail sebelum setiap langkah SMTP
    log.info("=" * 60)
    log.info("MEMULAI PROSES PENGIRIMAN EMAIL SMTP")
    log.info(f"  Penerima        : {to_email}")
    log.info(f"  Subject         : {subject}")
    log.info(f"  Tipe Email      : {email_type}")
    log.info(f"  Provider        : {provider}")
    log.info(f"  SMTP Server     : {config['smtp_server']}")
    log.info(f"  Port            : {config['smtp_port']}")
    log.info(f"  TLS Aktif       : {config['use_tls']}")
    log.info(f"  Username SMTP   : {config['username']}")
    log.info(f"  Default Sender  : {config['default_sender']}")
    log.info("=" * 60)

    server = None
    start_time = time.time()

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config["default_sender"]
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        # ----------------------------------------------------
        # 1. LANGKAH: CONNECT()
        # ----------------------------------------------------
        connect_start = datetime.now()
        log.info(f"[{connect_start.isoformat()}] SMTP STEP: Memulai koneksi (connect) ke {config['smtp_server']}:{config['smtp_port']}...")
        
        step_connect_start = time.time()
        # Jika port 465, gunakan SMTP_SSL langsung
        if config["smtp_port"] == 465:
            server = smtplib.SMTP_SSL(config["smtp_server"], config["smtp_port"], timeout=30)
        else:
            server = smtplib.SMTP(config["smtp_server"], config["smtp_port"], timeout=30)
        step_connect_end = time.time()
        
        connect_end = datetime.now()
        log.info(f"[{connect_end.isoformat()}] SMTP STEP SUCCESS: Koneksi berhasil. Waktu mulai: {connect_start.isoformat()}, Selesai: {connect_end.isoformat()} (Durasi: {step_connect_end - step_connect_start:.2f}s)")

        # EHLO setelah connect
        log.info(f"[{datetime.now().isoformat()}] Mengirim EHLO awal...")
        server.ehlo()

        # ----------------------------------------------------
        # 2. LANGKAH: STARTTLS()
        # ----------------------------------------------------
        if config["use_tls"] and config["smtp_port"] != 465:
            tls_start = datetime.now()
            log.info(f"[{tls_start.isoformat()}] SMTP STEP: Memulai starttls()...")
            
            step_tls_start = time.time()
            server.starttls()
            server.ehlo()
            step_tls_end = time.time()
            
            tls_end = datetime.now()
            log.info(f"[{tls_end.isoformat()}] SMTP STEP SUCCESS: STARTTLS berhasil. Waktu mulai: {tls_start.isoformat()}, Selesai: {tls_end.isoformat()} (Durasi: {step_tls_end - step_tls_start:.2f}s)")
        else:
            if config["smtp_port"] == 465:
                log.info("STARTTLS dilewati karena menggunakan koneksi SSL murni (Port 465)")
            else:
                log.info("STARTTLS dilewati karena MAIL_USE_TLS = False")

        # ----------------------------------------------------
        # 3. LANGKAH: LOGIN()
        # ----------------------------------------------------
        login_start = datetime.now()
        log.info(f"[{login_start.isoformat()}] SMTP STEP: Memulai login() sebagai {config['username']}...")
        
        step_login_start = time.time()
        server.login(config["username"], config["password"])
        step_login_end = time.time()
        
        login_end = datetime.now()
        log.info(f"[{login_end.isoformat()}] SMTP STEP SUCCESS: Login berhasil. Waktu mulai: {login_start.isoformat()}, Selesai: {login_end.isoformat()} (Durasi: {step_login_end - step_login_start:.2f}s)")

        # ----------------------------------------------------
        # 4. LANGKAH: SENDMAIL()
        # ----------------------------------------------------
        send_start = datetime.now()
        log.info(f"[{send_start.isoformat()}] SMTP STEP: Memulai sendmail()...")
        
        step_send_start = time.time()
        server.sendmail(config["default_sender"], to_email, msg.as_string())
        step_send_end = time.time()
        
        send_end = datetime.now()
        log.info(f"[{send_end.isoformat()}] SMTP STEP SUCCESS: Pengiriman email berhasil. Waktu mulai: {send_start.isoformat()}, Selesai: {send_end.isoformat()} (Durasi: {step_send_end - step_send_start:.2f}s)")

        # ----------------------------------------------------
        # 5. LANGKAH: QUIT()
        # ----------------------------------------------------
        quit_start = datetime.now()
        log.info(f"[{quit_start.isoformat()}] SMTP STEP: Memulai quit()...")
        
        step_quit_start = time.time()
        try:
            server.quit()
        except Exception as e_quit:
            log.warning(f"Error minor saat quit: {e_quit}")
        step_quit_end = time.time()
        
        quit_end = datetime.now()
        log.info(f"[{quit_end.isoformat()}] SMTP STEP SUCCESS: Koneksi ditutup (quit). Waktu mulai: {quit_start.isoformat()}, Selesai: {quit_end.isoformat()} (Durasi: {step_quit_end - step_quit_start:.2f}s)")

        total_duration = time.time() - start_time
        log.info(f"[SUCCESS] Email BERHASIL dikirim ke {to_email}. Total durasi: {total_duration:.2f}s")
        log.info("=" * 60)

        log_email_to_db(original_recipient, subject, html_content, email_type, status="sent")
        return True, None

    except TimeoutError as e:
        error_msg = f"TimeoutError (Batas waktu koneksi/operasi OS terlampaui): {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)

    except socket.timeout as e:
        error_msg = f"socket.timeout (Batas waktu operasi socket terlampaui): {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)

    except smtplib.SMTPServerDisconnected as e:
        error_msg = f"smtplib.SMTPServerDisconnected (Server terputus tiba-tiba): {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)

    except smtplib.SMTPConnectError as e:
        error_msg = f"smtplib.SMTPConnectError (Gagal melakukan koneksi awal): {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)

    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"smtplib.SMTPAuthenticationError (Kredensial SMTP ditolak oleh provider): {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)

    except smtplib.SMTPException as e:
        error_msg = f"smtplib.SMTPException (Kesalahan protokol SMTP): {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)

    except Exception as e:
        error_msg = f"Exception umum: {type(e).__name__}: {e}"
        return _handle_smtp_exception(e, error_msg, original_recipient, subject, html_content, email_type, server)


# ============================================
# HTML Templates
# ============================================

BASE_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
            color: #2d3748;
        }}
        .email-container {{
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }}
        .header {{
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }}
        .content {{
            padding: 40px 30px;
            line-height: 1.6;
        }}
        .otp-box {{
            background: #f0fdf4;
            border: 2px dashed #34d399;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }}
        .otp-code {{
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #047857;
            margin: 0;
        }}
        .footer {{
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #edf2f7;
        }}
        .btn {{
            display: inline-block;
            background-color: #10b981;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }}
        .btn:hover {{
            background-color: #059669;
        }}
        .divider {{
            height: 1px;
            background-color: #e2e8f0;
            margin: 20px 0;
        }}
        .receipt-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        .receipt-table th {{
            text-align: left;
            padding: 10px;
            background-color: #f8fafc;
            border-bottom: 2px solid #edf2f7;
            color: #4a5568;
            font-size: 14px;
        }}
        .receipt-table td {{
            padding: 12px 10px;
            border-bottom: 1px solid #edf2f7;
            font-size: 14px;
        }}
        .receipt-summary {{
            margin-top: 20px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
        }}
        .summary-row {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }}
        .summary-row.total {{
            font-weight: bold;
            font-size: 16px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            color: #10b981;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }}
        .badge-success {{
            background-color: #d1fae5;
            color: #065f46;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Toko Sembako</h1>
        </div>
        <div class="content">
            {{body}}
        </div>
        <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Toko Sembako.</p>
            <p>&copy; 2026 Toko Sembako S1 Pemrograman Web. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""


def generate_otp_email(nama, otp, otp_type="register"):
    if otp_type == "register":
        title = "Verifikasi Akun Baru Anda"
        intro = f'Halo <strong>{nama}</strong>,<br>Terima kasih telah mendaftar di Toko Sembako! Silakan gunakan kode OTP di bawah ini untuk memverifikasi akun Anda:'
        note = "Kode ini berlaku selama 10 menit. Jangan membagikan kode ini kepada siapa pun."
    elif otp_type == "login":
        title = "Kode OTP Masuk Akun"
        intro = f'Halo <strong>{nama}</strong>,<br>Kami menerima permintaan masuk menggunakan OTP ke akun Anda. Silakan masukkan kode OTP di bawah ini untuk melanjutkan:'
        note = "Kode ini berlaku selama 5 menit. Jika Anda tidak meminta masuk, abaikan saja email ini."
    else:  # reset / forgot_password
        title = "Atur Ulang Kata Sandi"
        intro = f'Halo <strong>{nama}</strong>,<br>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Gunakan kode verifikasi berikut untuk melakukan reset:'
        note = "Kode ini berlaku selama 10 menit. Jika Anda tidak meminta reset kata sandi, abaikan email ini."

    body = f"""
    <p style="font-size: 16px;">{intro}</p>

    <div class="otp-box">
        <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; font-weight: 600; text-transform: uppercase;">Kode OTP Verifikasi</p>
        <h2 class="otp-code">{otp}</h2>
    </div>

    <p style="font-size: 14px; color: #718096; text-align: center;">{note}</p>
    """

    return BASE_EMAIL_TEMPLATE.replace("{{title}}", title).replace("{{body}}", body)


def generate_receipt_email(nama, order_code, items, subtotal, ongkir, total, payment_method, address_details):
    title = f"Struk Pembelian {order_code}"

    items_rows = ""
    for item in items:
        price_fmt = f"Rp {item['harga']:,}".replace(",", ".")
        sub_fmt = f"Rp {item['harga'] * item['qty']:,}".replace(",", ".")
        items_rows += f"""
        <tr>
            <td>
                <strong>{item['nama']}</strong><br>
                <span style="color: #718096; font-size: 12px;">{price_fmt} x {item['qty']}</span>
            </td>
            <td style="text-align: right; vertical-align: bottom;">{sub_fmt}</td>
        </tr>
        """

    subtotal_fmt = f"Rp {subtotal:,}".replace(",", ".")
    ongkir_fmt = f"Rp {ongkir:,}".replace(",", ".")
    total_fmt = f"Rp {total:,}".replace(",", ".")

    date_str = datetime.now().strftime("%d %B %Y, %H:%M WIB")

    body = f"""
    <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-success">Pesanan Berhasil</span>
        <h2 style="margin: 10px 0 5px 0; font-size: 20px;">Terima Kasih atas Pembelian Anda!</h2>
        <p style="color: #718096; margin: 0; font-size: 14px;">Detail pesanan dan struk pembayaran Anda tercantum di bawah ini.</p>
    </div>

    <div class="divider"></div>

    <table style="width: 100%; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
        <tr>
            <td style="width: 50%; vertical-align: top;">
                <span style="color: #718096; font-size: 12px; text-transform: uppercase;">ID Pesanan:</span><br>
                <strong>{order_code}</strong><br>
                <span style="color: #718096; font-size: 12px; text-transform: uppercase; display: inline-block; margin-top: 8px;">Tanggal:</span><br>
                <span>{date_str}</span>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: right;">
                <span style="color: #718096; font-size: 12px; text-transform: uppercase;">Metode Pembayaran:</span><br>
                <strong>{payment_method}</strong><br>
                <span style="color: #718096; font-size: 12px; text-transform: uppercase; display: inline-block; margin-top: 8px;">Pengiriman Ke:</span><br>
                <span style="font-size: 12px;">{nama}<br>{address_details}</span>
            </td>
        </tr>
    </table>

    <h3 style="font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">Daftar Belanja</h3>

    <table class="receipt-table">
        <thead>
            <tr>
                <th>Produk</th>
                <th style="text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            {items_rows}
        </tbody>
    </table>

    <div class="receipt-summary">
        <div class="summary-row">
            <span>Subtotal</span>
            <span>{subtotal_fmt}</span>
        </div>
        <div class="summary-row">
            <span>Ongkos Kirim</span>
            <span>{ongkir_fmt}</span>
        </div>
        <div class="summary-row total">
            <span>Total Pembayaran</span>
            <span>{total_fmt}</span>
        </div>
    </div>

    <div style="margin-top: 30px; text-align: center; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; background-color: #fafafa;">
        <span style="color: #4a5568; font-size: 12px; font-weight: bold;">STRUK RESMI PEMBELIAN</span><br>
        <span style="color: #a0aec0; font-size: 10px;">Simpan email ini sebagai bukti transaksi yang sah.</span>
        <div style="margin-top: 10px; font-family: monospace; font-size: 18px; letter-spacing: 2px; color: #718096;">
            * {order_code.replace("-", "")} *
        </div>
    </div>
    """

    return BASE_EMAIL_TEMPLATE.replace("{{title}}", title).replace("{{body}}", body)


def send_otp_email(recipient, otp_code, user_name, otp_type="register"):
    """Kirim email OTP (wrapper untuk kompatibilitas dengan email_service.py)"""
    html_content = generate_otp_email(user_name, otp_code, otp_type)

    subjects = {
        "register": "🔐 Verifikasi Email Anda - Toko Sembako",
        "login": "🔐 Kode OTP Login - Toko Sembako",
        "reset": "🔐 Reset Password - Toko Sembako",
        "forgot_password": "🔐 Reset Password - Toko Sembako",
    }
    subject = subjects.get(otp_type, "🔐 OTP - Toko Sembako")

    return send_email(recipient, subject, html_content, email_type="otp")


def send_invoice_email(recipient, user_name, invoice_data):
    """Kirim email invoice setelah checkout"""
    from flask import render_template_string

    subject = f'📧 Invoice #{invoice_data["invoice_number"]} - Toko Sembako'

    html_body = render_template_string(
        INVOICE_EMAIL_TEMPLATE_FLASK,
        user_name=user_name,
        invoice_number=invoice_data["invoice_number"],
        order_date=invoice_data["order_date"],
        items=invoice_data["items"],
        subtotal=invoice_data["subtotal"],
        ongkir=invoice_data["ongkir"],
        total=invoice_data["total"],
        payment_method=invoice_data["payment_method"],
        alamat_lengkap=invoice_data.get("alamat_lengkap", "-"),
        kecamatan=invoice_data.get("kecamatan", "-"),
        kota=invoice_data.get("kota", "-"),
        kode_pos=invoice_data.get("kode_pos", "-"),
        status=invoice_data.get("status", "Pesanan Diterima"),
    )

    return send_email(recipient, subject, html_body, email_type="invoice")


def send_order_status_email(recipient, user_name, invoice_number, old_status, new_status):
    """Kirim email notifikasi perubahan status pesanan"""
    from flask import render_template_string

    status_messages = {
        "Pesanan Diterima": "✅ Pesanan Anda telah kami terima dan sedang kami proses.",
        "Sedang Diproses": "📦 Pesanan Anda sedang kami siapkan dengan teliti.",
        "Sedang Dikirim": "🚚 Pesanan Anda sedang dalam perjalanan menuju alamat Anda.",
        "Pesanan Selesai": "🎉 Pesanan Anda telah selesai. Terima kasih telah berbelanja!",
        "Pesanan Dibatalkan": "❌ Pesanan Anda telah dibatalkan.",
    }

    subject = f"📦 Update Status Pesanan #{invoice_number} - Toko Sembako"
    status_message = status_messages.get(new_status, f"Status pesanan Anda telah diubah menjadi: {new_status}")

    html_body = render_template_string(
        ORDER_STATUS_EMAIL_TEMPLATE_FLASK,
        user_name=user_name,
        invoice_number=invoice_number,
        new_status=new_status,
        status_message=status_message,
    )

    return send_email(recipient, subject, html_body, email_type="status")


def send_security_email(recipient, user_name, security_type, details=""):
    """Kirim email notifikasi keamanan"""
    if security_type == "password_changed":
        subject = "🔒 Password Anda Telah Diubah - Toko Sembako"
        title = "Password Berhasil Diubah"
        message = f'Halo {user_name}, password akun Anda telah berhasil diubah pada {datetime.now().strftime("%d %B %Y, %H:%M")} WIB.'
        action = "Jika Anda tidak melakukan perubahan ini, segera hubungi kami atau reset password Anda."
    elif security_type == "email_changed":
        subject = "📧 Email Anda Telah Diubah - Toko Sembako"
        title = "Email Berhasil Diubah"
        message = f"Halo {user_name}, email akun Anda telah berhasil diubah."
        action = "Jika Anda tidak melakukan perubahan ini, segera hubungi kami."
    elif security_type == "account_verified":
        subject = "✅ Akun Anda Telah Terverifikasi - Toko Sembako"
        title = "Selamat Datang di Toko Sembako!"
        message = f"Halo {user_name}, akun Anda telah berhasil diverifikasi. Selamat berbelanja!"
        action = "Anda sekarang dapat menikmati semua fitur Toko Sembako."
    else:  # new_device_login
        subject = "🔔 Login dari Perangkat Baru - Toko Sembako"
        title = "Aktivitas Login Terdeteksi"
        message = f'Halo {user_name}, kami mendeteksi login ke akun Anda dari perangkat baru pada {datetime.now().strftime("%d %B %Y, %H:%M")} WIB.'
        action = "Jika ini bukan Anda, segera ubah password Anda."

    body = f"""
    <h2 style="margin: 0 0 20px 0; color: #333333;">{title}</h2>
    <p style="font-size: 16px;">{message}</p>
    <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; color: #014361; font-size: 14px;">ℹ️ {action}</p>
    </div>
    {"<p style='color: #999999; font-size: 14px;'>" + details + "</p>" if details else ""}
    """

    html_body = BASE_EMAIL_TEMPLATE.replace("{{title}}", title).replace("{{body}}", body)
    return send_email(recipient, subject, html_body, email_type="security")


# ============================================
# Flask-Jinja2 EMAIL TEMPLATES (for invoice/status)
# These use Jinja2 syntax {{ var }} for render_template_string
# ============================================

INVOICE_EMAIL_TEMPLATE_FLASK = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🛒 Toko Sembako</h1>
                                        <p style="margin: 5px 0 0 0; color: #e0e7ff; font-size: 14px;">Belanja Mudah, Harga Terjangkau</p>
                                    </td>
                                    <td align="right">
                                        <div style="background-color: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 8px;">
                                            <p style="margin: 0; color: #ffffff; font-size: 12px; text-transform: uppercase;">Invoice</p>
                                            <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 18px; font-weight: 700;">#{{ invoice_number }}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%">
                                        <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase;">Kepada</p>
                                        <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600;">{{ user_name }}</p>
                                    </td>
                                    <td width="50%" align="right">
                                        <p style="margin: 0 0 5px 0; color: #999999; font-size: 12px; text-transform: uppercase;">Tanggal</p>
                                        <p style="margin: 0; color: #333333; font-size: 16px;">{{ order_date }}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f8f9fa;">
                                        <th style="padding: 15px; text-align: left; color: #666666; font-size: 12px; text-transform: uppercase; font-weight: 600; border-bottom: 2px solid #e9ecef;">Produk</th>
                                        <th style="padding: 15px; text-align: center; color: #666666; font-size: 12px; text-transform: uppercase; font-weight: 600; border-bottom: 2px solid #e9ecef;">Qty</th>
                                        <th style="padding: 15px; text-align: right; color: #666666; font-size: 12px; text-transform: uppercase; font-weight: 600; border-bottom: 2px solid #e9ecef;">Harga</th>
                                        <th style="padding: 15px; text-align: right; color: #666666; font-size: 12px; text-transform: uppercase; font-weight: 600; border-bottom: 2px solid #e9ecef;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {% for item in items %}
                                    <tr>
                                        <td style="padding: 15px; color: #333333; font-size: 14px; border-bottom: 1px solid #f1f3f5;">{{ item.nama }}</td>
                                        <td style="padding: 15px; text-align: center; color: #666666; font-size: 14px; border-bottom: 1px solid #f1f3f5;">{{ item.qty }}</td>
                                        <td style="padding: 15px; text-align: right; color: #666666; font-size: 14px; border-bottom: 1px solid #f1f3f5;">Rp {{ "{:,}".format(item.harga).replace(',', '.') }}</td>
                                        <td style="padding: 15px; text-align: right; color: #333333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f3f5;">Rp {{ "{:,}".format(item.subtotal).replace(',', '.') }}</td>
                                    </tr>
                                    {% endfor %}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="60%"></td>
                                    <td width="40%">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 10px 0; color: #666666; font-size: 14px;">Subtotal</td>
                                                <td style="padding: 10px 0; text-align: right; color: #333333; font-size: 14px;">Rp {{ "{:,}".format(subtotal).replace(',', '.') }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0; color: #666666; font-size: 14px;">Ongkir</td>
                                                <td style="padding: 10px 0; text-align: right; color: #333333; font-size: 14px;">Rp {{ "{:,}".format(ongkir).replace(',', '.') }}</td>
                                            </tr>
                                            <tr style="border-top: 2px solid #e9ecef;">
                                                <td style="padding: 15px 0 0 0; color: #333333; font-size: 16px; font-weight: 700;">Total</td>
                                                <td style="padding: 15px 0 0 0; text-align: right; color: #667eea; font-size: 20px; font-weight: 700;">Rp {{ "{:,}".format(total).replace(',', '.') }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td width="50%" style="padding-right: 15px;">
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-transform: uppercase; font-weight: 600;">Alamat Pengiriman</p>
                                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                                            {{ alamat_lengkap }}<br>
                                            {{ kecamatan }}, {{ kota }}<br>
                                            {{ kode_pos }}
                                        </p>
                                    </td>
                                    <td width="50%" style="padding-left: 15px; border-left: 1px solid #e9ecef;">
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-transform: uppercase; font-weight: 600;">Metode Pembayaran</p>
                                        <p style="margin: 0 0 15px 0; color: #333333; font-size: 14px;">{{ payment_method }}</p>
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-transform: uppercase; font-weight: 600;">Status Pesanan</p>
                                        <span style="display: inline-block; background-color: #d4edda; color: #155724; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">{{ status }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Terima kasih telah berbelanja di Toko Sembako!</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">&copy; 2026 Toko Sembako. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

ORDER_STATUS_EMAIL_TEMPLATE_FLASK = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Status Pesanan</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🛒 Toko Sembako</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 24px; font-weight: 600;">Update Status Pesanan</h2>
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">Invoice #{{ invoice_number }}</p>
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px;">Status Pesanan Anda:</p>
                                <p style="margin: 0; color: #667eea; font-size: 22px; font-weight: 700;">{{ new_status }}</p>
                            </div>
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">{{ status_message }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Terima kasih telah berbelanja di Toko Sembako</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">&copy; 2026 Toko Sembako. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
