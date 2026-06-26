import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from datetime import datetime
from BackEnd.Database.database import EmailLog, db

BACKEND_ROOT = Path(__file__).resolve().parent.parent

def _parse_env_file(path: Path) -> dict:
    data = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data

def get_mail_config():
    file_cfg = _parse_env_file(BACKEND_ROOT / "config_mail.env")
    
    provider = os.environ.get("MAIL_PROVIDER") or file_cfg.get("MAIL_PROVIDER") or "console"
    smtp_server = os.environ.get("MAIL_SMTP_SERVER") or os.environ.get("MAIL_SERVER") or file_cfg.get("MAIL_SMTP_SERVER") or ""
    smtp_port = os.environ.get("MAIL_SMTP_PORT") or os.environ.get("MAIL_PORT") or file_cfg.get("MAIL_SMTP_PORT") or "587"
    use_tls = os.environ.get("MAIL_USE_TLS") or file_cfg.get("MAIL_USE_TLS") or "True"
    username = os.environ.get("MAIL_USERNAME") or file_cfg.get("MAIL_USERNAME") or ""
    password = os.environ.get("MAIL_PASSWORD") or file_cfg.get("MAIL_PASSWORD") or ""
    
    # Strip spaces from password if it is a Gmail app password
    if password:
        password = password.replace(" ", "")
        
    default_sender = os.environ.get("MAIL_DEFAULT_SENDER") or file_cfg.get("MAIL_DEFAULT_SENDER") or "Toko Sembako <noreply@tokosembako.com>"
    
    # If SMTP settings are fully filled, default to smtp provider
    if provider == "console" and smtp_server and username and password:
        provider = "smtp"
        
    return {
        "provider": provider,
        "smtp_server": smtp_server,
        "smtp_port": int(smtp_port) if str(smtp_port).isdigit() else 587,
        "use_tls": str(use_tls).lower() in ("true", "1", "yes"),
        "username": username,
        "password": password,
        "default_sender": default_sender
    }

def log_email_to_db(to_email, subject, html_content, email_type, status, error_message=None):
    """Log email ke database"""
    try:
        log = EmailLog(
            recipient=to_email,
            subject=subject,
            html_content=html_content,
            email_type=email_type,
            status=status,
            error_message=error_message
        )
        db.session.add(log)
        db.session.commit()
        print(f"[Mail Log] Email log tersimpan untuk {to_email}")
    except Exception as e:
        print(f"[Mail Log Error] Gagal menyimpan log ke database: {e}")

def send_email(to_email, subject, html_content, email_type="general"):
    """
    Mengirim email via SMTP atau log ke database jika provider console
    
    Args:
        to_email: Email penerima
        subject: Subject email
        html_content: Konten HTML email
        email_type: Tipe email ('otp', 'invoice', 'status', 'security')
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    config = get_mail_config()
    
    # Redirection untuk development (jika diset)
    redirect_to = os.environ.get("MAIL_REDIRECT_TO")
    original_recipient = to_email
    if redirect_to and redirect_to.strip():
        to_email = redirect_to.strip()
        subject = f"[DEV REDIRECT to {original_recipient}] {subject}"
        
    if config["provider"] == "console" or not config["smtp_server"] or not config["username"]:
        # Log ke database tanpa mengirim SMTP
        log_email_to_db(original_recipient, subject, html_content, email_type, status="logged")
        print(f"[Mail Console] Email disimulasikan ke {original_recipient}. Log tersimpan di database.")
        return True, None
        
    try:
        # Create SMTP session
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config["default_sender"]
        msg["To"] = to_email
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        server = smtplib.SMTP(config["smtp_server"], config["smtp_port"])
        server.ehlo()
        if config["use_tls"]:
            server.starttls()
            server.ehlo()
            
        server.login(config["username"], config["password"])
        server.sendmail(config["default_sender"], to_email, msg.as_string())
        server.close()
        
        # Log sukses ke database
        log_email_to_db(to_email, subject, html_content, email_type, status="sent")
        print(f"[Mail SMTP] Email berhasil dikirim ke {to_email}. Subjek: '{subject}'")
        return True, None
    except Exception as e:
        # Log error ke database
        log_email_to_db(to_email, subject, html_content, email_type, status="failed", error_message=str(e))
        print(f"[Mail SMTP Error] Gagal mengirim email ke {to_email}: {e}")
        return False, str(e)

# HTML Templates
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
        /* Receipt Styles */
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
        intro = f"Halo <strong>{nama}</strong>,<br>Terima kasih telah mendaftar di Toko Sembako! Silakan gunakan kode OTP di bawah ini untuk memverifikasi akun Anda:"
        note = "Kode ini berlaku selama 10 menit. Jangan membagikan kode ini kepada siapa pun."
    elif otp_type == "login":
        title = "Kode OTP Masuk Akun"
        intro = f"Halo <strong>{nama}</strong>,<br>Kami menerima permintaan masuk menggunakan OTP ke akun Anda. Silakan masukkan kode OTP di bawah ini untuk melanjutkan:"
        note = "Kode ini berlaku selama 5 menit. Jika Anda tidak meminta masuk, abaikan saja email ini."
    else: # reset
        title = "Atur Ulang Kata Sandi"
        intro = f"Halo <strong>{nama}</strong>,<br>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Gunakan kode verifikasi berikut untuk melakukan reset:"
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
        # format values
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
