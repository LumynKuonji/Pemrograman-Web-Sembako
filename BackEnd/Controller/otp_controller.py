"""
OTP Controller untuk menangani verifikasi OTP
"""
import os
import random
from datetime import datetime, timedelta
from BackEnd.Database.database import User, db
from BackEnd.Services.email_service import send_otp_email


def generate_otp():
    """Generate OTP 6 digit secara acak"""
    return str(random.randint(100000, 999999))


def create_and_send_otp(user, otp_type='register'):
    """
    Generate OTP baru dan kirim ke email user
    
    Args:
        user: User object
        otp_type: 'register', 'login', atau 'forgot_password'
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    # Cek cooldown untuk resend OTP (60 detik)
    cooldown_seconds = int(os.getenv('OTP_RESEND_COOLDOWN_SECONDS', 60))
    if user.last_otp_sent:
        time_since_last = (datetime.utcnow() - user.last_otp_sent).total_seconds()
        if time_since_last < cooldown_seconds:
            remaining = int(cooldown_seconds - time_since_last)
            return False, f"Tunggu {remaining} detik sebelum mengirim ulang OTP"
    
    # Generate OTP baru
    otp_code = generate_otp()
    expiry_minutes = int(os.getenv('OTP_EXPIRY_MINUTES', 5))
    
    # Update user dengan OTP baru
    user.otp_code = otp_code
    user.otp_expired_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    user.otp_attempt = 0
    user.otp_type = otp_type
    user.last_otp_sent = datetime.utcnow()
    db.session.commit()
    
    # Kirim email OTP
    success, error = send_otp_email(user.email, otp_code, user.nama, otp_type)
    
    if not success:
        return False, f"Gagal mengirim email: {error}"
    
    return True, None


def verify_otp(user, otp_code):
    """
    Verifikasi OTP yang dimasukkan user
    
    Args:
        user: User object
        otp_code: Kode OTP yang dimasukkan
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    max_attempts = int(os.getenv('OTP_MAX_ATTEMPTS', 5))
    
    # Cek apakah OTP ada
    if not user.otp_code:
        return False, "OTP tidak ditemukan. Silakan kirim ulang OTP"
    
    # Cek apakah OTP sudah expired
    if user.otp_expired_at and user.otp_expired_at < datetime.utcnow():
        # Hapus OTP yang expired
        user.otp_code = None
        user.otp_expired_at = None
        user.otp_attempt = 0
        db.session.commit()
        return False, "OTP telah kadaluarsa. Silakan kirim ulang OTP"
    
    # Cek jumlah percobaan
    if user.otp_attempt >= max_attempts:
        # Hapus OTP setelah terlalu banyak percobaan
        user.otp_code = None
        user.otp_expired_at = None
        user.otp_attempt = 0
        db.session.commit()
        return False, "Terlalu banyak percobaan. Silakan kirim ulang OTP"
    
    # Verifikasi OTP
    if user.otp_code != otp_code.strip():
        user.otp_attempt += 1
        db.session.commit()
        remaining = max_attempts - user.otp_attempt
        return False, f"Kode OTP salah. Sisa percobaan: {remaining}"
    
    # OTP benar - hapus OTP dari database
    otp_type = user.otp_type
    user.otp_code = None
    user.otp_expired_at = None
    user.otp_attempt = 0
    user.otp_type = None
    
    # Jika tipe register, set email_verified = True
    if otp_type == 'register':
        user.email_verified = True
    
    db.session.commit()
    
    return True, None


def clear_otp(user):
    """Hapus OTP dari user (untuk cleanup)"""
    user.otp_code = None
    user.otp_expired_at = None
    user.otp_attempt = 0
    user.otp_type = None
    db.session.commit()
