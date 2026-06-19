import secrets
import random
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash
from BackEnd.Database.database import User, UserSession, db
from BackEnd.Services import mail_service

def generate_digit_otp(length=6):
    return "".join(random.choices("0123456789", k=length))

def register_user(nama, email, password, telepon=None, foto=None):
    email = email.strip().lower()
    if User.query.filter_by(email=email).first():
        return None, "Email sudah terdaftar"

    if len(password) < 6:
        return None, "Password minimal 6 karakter"

    user = User(
        nama=nama.strip(),
        email=email,
        password_hash=generate_password_hash(password),
        telepon=telepon,
        foto=foto,
        is_verified=False
    )
    
    # Generate registration verification OTP
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    user.otp_type = "register"

    db.session.add(user)
    db.session.commit()

    # Send verification email
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "register")
        mail_service.send_email(user.email, "Verifikasi Akun Toko Sembako", email_content)
    except Exception as e:
        print(f"Gagal mengirim email verifikasi register: {e}")

    return user, None

def verify_register_otp(email, code):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    if user.is_verified:
        return True, "Akun sudah terverifikasi sebelumnya"
        
    if not user.otp_code or user.otp_type != "register" or user.otp_code != code:
        return False, "Kode OTP salah"
        
    if user.otp_expiry and user.otp_expiry < datetime.utcnow():
        return False, "Kode OTP sudah kedaluwarsa"
        
    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    user.otp_type = None
    db.session.commit()
    
    return True, None

def login_user(email, password):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return None, None, "Email atau password salah"

    if not user.is_verified:
        # Trigger verification OTP resend if not verified
        otp = generate_digit_otp()
        user.otp_code = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        user.otp_type = "register"
        db.session.commit()
        
        try:
            email_content = mail_service.generate_otp_email(user.nama, otp, "register")
            mail_service.send_email(user.email, "Verifikasi Akun Toko Sembako", email_content)
        except Exception as e:
            print(f"Gagal kirim ulang verifikasi: {e}")
            
        return user, None, "Akun belum terverifikasi"

    token = secrets.token_urlsafe(32)
    session = UserSession(
        user_id=user.id,
        token=token,
        expired_at=datetime.utcnow() + timedelta(days=7),
    )
    db.session.add(session)
    db.session.commit()
    return user, token, None

def request_login_otp(email):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "Email tidak terdaftar. Silakan daftar terlebih dahulu."
        
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    user.otp_type = "login"
    db.session.commit()
    
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "login")
        mail_service.send_email(user.email, "OTP Login Toko Sembako", email_content)
        return True, None
    except Exception as e:
        return False, f"Gagal mengirim OTP login: {e}"

def verify_login_otp(email, code):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return None, None, "Email tidak terdaftar"
        
    if not user.otp_code or user.otp_type != "login" or user.otp_code != code:
        return None, None, "Kode OTP salah"
        
    if user.otp_expiry and user.otp_expiry < datetime.utcnow():
        return None, None, "Kode OTP sudah kedaluwarsa"
        
    # Mark user verified if they successfully logged in via OTP
    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    user.otp_type = None
    
    token = secrets.token_urlsafe(32)
    session = UserSession(
        user_id=user.id,
        token=token,
        expired_at=datetime.utcnow() + timedelta(days=7),
    )
    db.session.add(session)
    db.session.commit()
    return user, token, None

def request_reset_password_otp(email):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "Email tidak terdaftar"
        
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    user.otp_type = "reset"
    db.session.commit()
    
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "reset")
        mail_service.send_email(user.email, "Atur Ulang Kata Sandi - Toko Sembako", email_content)
        return True, None
    except Exception as e:
        return False, f"Gagal mengirim OTP reset: {e}"

def reset_password_with_otp(email, code, new_password):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
        
    if not user.otp_code or user.otp_type != "reset" or user.otp_code != code:
        return False, "Kode OTP reset salah"
        
    if user.otp_expiry and user.otp_expiry < datetime.utcnow():
        return False, "Kode OTP reset sudah kedaluwarsa"
        
    if len(new_password) < 6:
        return False, "Password minimal 6 karakter"
        
    user.password_hash = generate_password_hash(new_password)
    user.otp_code = None
    user.otp_expiry = None
    user.otp_type = None
    db.session.commit()
    return True, None

def resend_otp(email, otp_type):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "Email tidak terdaftar"
        
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10 if otp_type != "login" else 5)
    user.otp_type = otp_type
    db.session.commit()
    
    subjects = {
        "register": "Verifikasi Akun Toko Sembako",
        "login": "OTP Login Toko Sembako",
        "reset": "Atur Ulang Kata Sandi - Toko Sembako"
    }
    
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, otp_type)
        mail_service.send_email(user.email, subjects.get(otp_type, "OTP Toko Sembako"), email_content)
        return True, None
    except Exception as e:
        return False, f"Gagal mengirim ulang OTP: {e}"

def logout_user(token):
    if not token:
        return False
    session = UserSession.query.filter_by(token=token).first()
    if session:
        db.session.delete(session)
        db.session.commit()
    return True

def get_user_by_token(token):
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
