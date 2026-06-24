"""
Email Service untuk Toko Sembako AI
Menangani pengiriman email menggunakan Gmail SMTP
"""
import os
from datetime import datetime
from flask_mail import Mail, Message
from flask import render_template_string
from BackEnd.Database.database import EmailLog, db

mail = Mail()


def init_mail(app):
    """Initialize Flask-Mail dengan konfigurasi dari environment variables"""
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER') or os.getenv('MAIL_SMTP_SERVER') or 'smtp.gmail.com'
    
    port_val = os.getenv('MAIL_PORT') or os.getenv('MAIL_SMTP_PORT') or '587'
    app.config['MAIL_PORT'] = int(port_val) if str(port_val).isdigit() else 587
    
    app.config['MAIL_USE_TLS'] = (os.getenv('MAIL_USE_TLS') or 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    
    pwd_val = os.getenv('MAIL_PASSWORD')
    if pwd_val:
        pwd_val = pwd_val.replace(" ", "")
    app.config['MAIL_PASSWORD'] = pwd_val
    
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER') or os.getenv('MAIL_USERNAME')
    
    mail.init_app(app)
    return mail


def send_email(recipient, subject, html_body, email_type='general'):
    """
    Fungsi utama untuk mengirim email
    
    Args:
        recipient: Email penerima
        subject: Subject email
        html_body: Konten HTML email
        email_type: Tipe email untuk logging ('otp', 'invoice', 'status', 'security')
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    try:
        # Redirection untuk development (jika diset di .env)
        redirect_to = os.getenv("MAIL_REDIRECT_TO")
        original_recipient = recipient
        if redirect_to:
            recipient = redirect_to.strip()
            subject = f"[DEV REDIRECT to {original_recipient}] {subject}"
            
        msg = Message(
            subject=subject,
            recipients=[recipient],
            html=html_body
        )
        mail.send(msg)
        
        # Log email yang berhasil dikirim
        log = EmailLog(
            recipient=recipient,
            subject=subject,
            email_type=email_type,
            status='sent'
        )
        db.session.add(log)
        db.session.commit()
        
        return True, None
        
    except Exception as e:
        error_msg = str(e)
        
        # Log email yang gagal
        log = EmailLog(
            recipient=recipient,
            subject=subject,
            email_type=email_type,
            status='failed',
            error_message=error_msg
        )
        db.session.add(log)
        db.session.commit()
        
        return False, error_msg


def send_otp_email(recipient, otp_code, user_name, otp_type='register'):
    """
    Kirim email OTP untuk registrasi, login, atau forgot password
    
    Args:
        recipient: Email penerima
        otp_code: Kode OTP 6 digit
        user_name: Nama user
        otp_type: 'register', 'login', atau 'forgot_password'
    """
    
    if otp_type == 'register':
        subject = '🔐 Verifikasi Email Anda - Toko Sembako'
        title = 'Verifikasi Email Anda'
        message = f'Halo {user_name}, terima kasih telah mendaftar di Toko Sembako! Gunakan kode OTP berikut untuk memverifikasi email Anda:'
    elif otp_type == 'login':
        subject = '🔐 Kode OTP Login - Toko Sembako'
        title = 'Verifikasi Login Anda'
        message = f'Halo {user_name}, gunakan kode OTP berikut untuk melanjutkan login:'
    else:  # forgot_password
        subject = '🔐 Reset Password - Toko Sembako'
        title = 'Reset Password Anda'
        message = f'Halo {user_name}, gunakan kode OTP berikut untuk mereset password Anda:'
    
    html_body = render_template_string(OTP_EMAIL_TEMPLATE, 
        title=title,
        message=message,
        otp_code=otp_code,
        user_name=user_name
    )
    
    return send_email(recipient, subject, html_body, email_type='otp')


def send_invoice_email(recipient, user_name, invoice_data):
    """
    Kirim email invoice setelah checkout
    
    Args:
        recipient: Email penerima
        user_name: Nama pelanggan
        invoice_data: Dictionary berisi data invoice
    """
    subject = f'📧 Invoice #{invoice_data["invoice_number"]} - Toko Sembako'
    
    html_body = render_template_string(INVOICE_EMAIL_TEMPLATE,
        user_name=user_name,
        invoice_number=invoice_data['invoice_number'],
        order_date=invoice_data['order_date'],
        items=invoice_data['items'],
        subtotal=invoice_data['subtotal'],
        ongkir=invoice_data['ongkir'],
        total=invoice_data['total'],
        payment_method=invoice_data['payment_method'],
        alamat_lengkap=invoice_data.get('alamat_lengkap', '-'),
        kecamatan=invoice_data.get('kecamatan', '-'),
        kota=invoice_data.get('kota', '-'),
        kode_pos=invoice_data.get('kode_pos', '-'),
        status=invoice_data.get('status', 'Pesanan Diterima')
    )
    
    return send_email(recipient, subject, html_body, email_type='invoice')


def send_order_status_email(recipient, user_name, invoice_number, old_status, new_status):
    """
    Kirim email notifikasi perubahan status pesanan
    
    Args:
        recipient: Email penerima
        user_name: Nama pelanggan
        invoice_number: Nomor invoice
        old_status: Status lama
        new_status: Status baru
    """
    
    status_messages = {
        'Pesanan Diterima': '✅ Pesanan Anda telah kami terima dan sedang kami proses.',
        'Sedang Diproses': '📦 Pesanan Anda sedang kami siapkan dengan teliti.',
        'Sedang Dikirim': '🚚 Pesanan Anda sedang dalam perjalanan menuju alamat Anda.',
        'Pesanan Selesai': '🎉 Pesanan Anda telah selesai. Terima kasih telah berbelanja!',
        'Pesanan Dibatalkan': '❌ Pesanan Anda telah dibatalkan.'
    }
    
    subject = f'📦 Update Status Pesanan #{invoice_number} - Toko Sembako'
    status_message = status_messages.get(new_status, f'Status pesanan Anda telah diubah menjadi: {new_status}')
    
    html_body = render_template_string(ORDER_STATUS_EMAIL_TEMPLATE,
        user_name=user_name,
        invoice_number=invoice_number,
        new_status=new_status,
        status_message=status_message
    )
    
    return send_email(recipient, subject, html_body, email_type='status')


def send_security_email(recipient, user_name, security_type, details=''):
    """
    Kirim email notifikasi keamanan
    
    Args:
        recipient: Email penerima
        user_name: Nama user
        security_type: 'password_changed', 'email_changed', 'account_verified', 'new_device_login'
        details: Detail tambahan
    """
    
    if security_type == 'password_changed':
        subject = '🔒 Password Anda Telah Diubah - Toko Sembako'
        title = 'Password Berhasil Diubah'
        message = f'Halo {user_name}, password akun Anda telah berhasil diubah pada {datetime.now().strftime("%d %B %Y, %H:%M")} WIB.'
        action = 'Jika Anda tidak melakukan perubahan ini, segera hubungi kami atau reset password Anda.'
    elif security_type == 'email_changed':
        subject = '📧 Email Anda Telah Diubah - Toko Sembako'
        title = 'Email Berhasil Diubah'
        message = f'Halo {user_name}, email akun Anda telah berhasil diubah.'
        action = 'Jika Anda tidak melakukan perubahan ini, segera hubungi kami.'
    elif security_type == 'account_verified':
        subject = '✅ Akun Anda Telah Terverifikasi - Toko Sembako'
        title = 'Selamat Datang di Toko Sembako!'
        message = f'Halo {user_name}, akun Anda telah berhasil diverifikasi. Selamat berbelanja!'
        action = 'Anda sekarang dapat menikmati semua fitur Toko Sembako.'
    else:  # new_device_login
        subject = '🔔 Login dari Perangkat Baru - Toko Sembako'
        title = 'Aktivitas Login Terdeteksi'
        message = f'Halo {user_name}, kami mendeteksi login ke akun Anda dari perangkat baru pada {datetime.now().strftime("%d %B %Y, %H:%M")} WIB.'
        action = 'Jika ini bukan Anda, segera ubah password Anda.'
    
    html_body = render_template_string(SECURITY_EMAIL_TEMPLATE,
        user_name=user_name,
        title=title,
        message=message,
        action=action,
        details=details
    )
    
    return send_email(recipient, subject, html_body, email_type='security')


# ============================================
# EMAIL TEMPLATES
# ============================================

OTP_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🛒 Toko Sembako</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">{{ title }}</h2>
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">{{ message }}</p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; display: inline-block;">
                                            <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Kode OTP Anda</p>
                                            <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">{{ otp_code }}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    ⚠️ <strong>Penting:</strong> Kode OTP ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapapun.
                                </p>
                            </div>
                            
                            <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                Jika Anda tidak melakukan permintaan ini, abaikan email ini.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Terima kasih telah berbelanja di Toko Sembako</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">© 2026 Toko Sembako. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

INVOICE_EMAIL_TEMPLATE = """
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
                    <!-- Header -->
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
                    
                    <!-- Customer Info -->
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
                    
                    <!-- Items Table -->
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
                    
                    <!-- Summary -->
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
                    
                    <!-- Shipping & Payment Info -->
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
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Terima kasih telah berbelanja di Toko Sembako!</p>
                            <p style="margin: 0 0 20px 0; color: #999999; font-size: 12px;">Jika ada pertanyaan, hubungi customer service kami.</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">© 2026 Toko Sembako. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

ORDER_STATUS_EMAIL_TEMPLATE = """
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
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🛒 Toko Sembako</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <div style="margin-bottom: 30px;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; line-height: 80px; font-size: 40px;">
                                    📦
                                </div>
                            </div>
                            
                            <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 24px; font-weight: 600;">Update Status Pesanan</h2>
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">Invoice #{{ invoice_number }}</p>
                            
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px;">Status Pesanan Anda:</p>
                                <p style="margin: 0; color: #667eea; font-size: 22px; font-weight: 700;">{{ new_status }}</p>
                            </div>
                            
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">{{ status_message }}</p>
                            
                            <p style="margin: 0; color: #999999; font-size: 14px;">
                                Anda dapat melihat detail pesanan di halaman riwayat pembelian.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Terima kasih telah berbelanja di Toko Sembako</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">© 2026 Toko Sembako. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

SECURITY_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🛒 Toko Sembako</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">{{ title }}</h2>
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">{{ message }}</p>
                            
                            <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #014361; font-size: 14px;">
                                    ℹ️ {{ action }}
                                </p>
                            </div>
                            
                            {% if details %}
                            <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">{{ details }}</p>
                            {% endif %}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Terima kasih telah berbelanja di Toko Sembako</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">© 2026 Toko Sembako. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
