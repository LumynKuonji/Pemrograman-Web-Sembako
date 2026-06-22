"""
Auth Controller untuk menangani autentikasi user
Termasuk registrasi dengan OTP, login dengan 2FA, dan forgot password
"""
import secrets
from datetime import datetime, timedelta

from werkzeug.security import check_password_hash, generate_password_hash

from BackEnd.Database.database import User, UserSession, db
from BackEnd.Controller.otp_controller import create_and_send_otp, verify_otp, clear_otp
from BackEnd.Services.email_service import send_security_email


def register_user(nama, email, password, telepon=None, foto=None):
    """
    Registrasi user baru - akun tidak langsung aktif, perlu verifikasi OTP
    
    Returns:
        tuple: (user, error_message)
        - Jika sukses: user akan dibuat dengan email_verified=False, OTP dikirim
        - Jika gagal: None, error_message
    """
    email = email.strip().lower()
    if User.query.filter_by(email=email).first():
        return None, "Email sudah terdaftar"

    if len(password) < 6:
        return None, "Password minimal 6 karakter"

    # Buat user dengan email_verified = False
    user = User(
        nama=nama.strip(),
        email=email,
        password_hash=generate_password_hash(password),
        telepon=telepon,
        foto=foto,
        email_verified=False,
    )
    db.session.add(user)
    db.session.flush()  # Dapatkan ID user sebelum commit
    
    # Generate dan kirim OTP
    success, error = create_and_send_otp(user, otp_type='register')
    if not success:
        db.session.rollback()
        return None, error
    
    db.session.commit()
    return user, None


def verify_registration_otp(email, otp_code):
    """
    Verifikasi OTP untuk registrasi
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    success, error = verify_otp(user, otp_code)
    if success:
        # Kirim email selamat datang
        send_security_email(user.email, user.nama, 'account_verified')
    
    return success, error


def login_user(email, password):
    """
    Login user - jika email dan password benar, kirim OTP untuk 2FA
    
    Returns:
        tuple: (user, token, error_message)
        - Jika perlu OTP: user, None, "OTP_REQUIRED"
        - Jika sukses: user, token, None
        - Jika gagal: None, None, error_message
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return None, None, "Email atau password salah"
    
    # Cek apakah email sudah diverifikasi
    if not user.email_verified:
        return None, None, "Email belum diverifikasi. Silakan verifikasi terlebih dahulu"
    
    # Generate dan kirim OTP untuk 2FA
    success, error = create_and_send_otp(user, otp_type='login')
    if not success:
        return None, None, error
    
    return user, None, "OTP_REQUIRED"


def verify_login_otp(email, otp_code):
    """
    Verifikasi OTP untuk login (2FA)
    
    Returns:
        tuple: (user, token, error_message)
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return None, None, "User tidak ditemukan"
    
    success, error = verify_otp(user, otp_code)
    if not success:
        return None, None, error
    
    # Buat session token
    token = secrets.token_urlsafe(32)
    session = UserSession(
        user_id=user.id,
        token=token,
        expired_at=datetime.utcnow() + timedelta(days=7),
    )
    
    # Update last_login
    user.last_login = datetime.utcnow()
    
    db.session.add(session)
    db.session.commit()
    
    return user, token, None


def forgot_password_request(email):
    """
    Request forgot password - kirim OTP ke email
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        # Jangan beri tahu apakah email terdaftar atau tidak (security)
        return True, None
    
    success, error = create_and_send_otp(user, otp_type='forgot_password')
    return success, error


def verify_forgot_password_otp(email, otp_code):
    """
    Verifikasi OTP untuk forgot password
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    return verify_otp(user, otp_code)


def reset_password(email, new_password):
    """
    Reset password setelah verifikasi OTP
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    if len(new_password) < 6:
        return False, "Password minimal 6 karakter"
    
    # Update password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    # Kirim email notifikasi password berhasil diubah
    send_security_email(user.email, user.nama, 'password_changed')
    
    return True, None


def resend_otp(email, otp_type='register'):
    """
    Kirim ulang OTP
    
    Args:
        email: Email user
        otp_type: 'register', 'login', atau 'forgot_password'
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    # Hapus OTP lama
    clear_otp(user)
    
    # Generate dan kirim OTP baru
    return create_and_send_otp(user, otp_type)


def logout_user(token):
    """Logout user - hapus session"""
    if not token:
        return False
    session = UserSession.query.filter_by(token=token).first()
    if session:
        db.session.delete(session)
        db.session.commit()
    return True


def get_user_by_token(token):
    """Get user by session token"""
    if not token:
        return None
    session = UserSession.query.filter_by(token=token).first()
    if not session:
        return None
    if session.expired_at and session.expired_at < datetime.utcnow():
        db.session.delete(session)
        db.session.commit()
        return None
    return User.query.get(session.user_id)
