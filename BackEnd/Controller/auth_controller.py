"""
Auth Controller untuk menangani autentikasi user
Termasuk registrasi dengan OTP, login dengan 2FA, dan forgot password
"""
import secrets
import random
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash
from BackEnd.Database.database import User, UserSession, AlamatPengiriman, db
from BackEnd.Services import mail_service
from BackEnd.Services.mail_service import send_security_email
from BackEnd.logger import get_logger

log = get_logger("auth")

def generate_digit_otp(length=6):
    return "".join(random.choices("0123456789", k=length))

def register_user(nama, email, password, telepon=None, foto=None):
    """
    Registrasi user baru - akun tidak langsung aktif, perlu verifikasi OTP
    
    Returns:
        tuple: (user, error_message)
        - Jika sukses: user akan dibuat dengan email_verified=False, OTP dikirim
        - Jika gagal: None, error_message
    """
    email = email.strip().lower()
    log.info(f"Register request untuk email: {email}")
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        if existing_user.is_verified:
            log.warning(f"Register gagal: email {email} sudah terdaftar dan terverifikasi")
            return None, "Email sudah terdaftar"

        if len(password) < 6:
            return None, "Password minimal 6 karakter"

        # Update data akun unverified yang sudah ada
        existing_user.nama = nama.strip()
        existing_user.password_hash = generate_password_hash(password)
        existing_user.telepon = telepon
        existing_user.foto = foto
        existing_user.is_verified = False

        otp = generate_digit_otp()
        existing_user.otp_code = otp
        existing_user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        existing_user.otp_type = "register"

        db.session.commit()
        log.info(f"Akun unverified {email} diperbarui, OTP baru di-generate")

        try:
            email_content = mail_service.generate_otp_email(existing_user.nama, otp, "register")
            success, err = mail_service.send_email(existing_user.email, "Verifikasi Akun Toko Sembako", email_content, email_type="otp")
            if not success:
                log.error(f"Gagal mengirim email verifikasi ulang ke {email}: {err}")
            else:
                log.info(f"Email verifikasi ulang berhasil dikirim ke {email}")
        except Exception as e:
            log.error(f"Exception saat mengirim email verifikasi ulang register: {e}")

        return existing_user, None

    if len(password) < 6:
        return None, "Password minimal 6 karakter"

    # Buat user dengan email_verified = False
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
    db.session.flush()  # Dapatkan ID user sebelum commit
    
    db.session.commit()
    log.info(f"User baru dibuat: {email} (id={user.id}), menunggu verifikasi OTP")

    # Send verification email
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "register")
        success, err = mail_service.send_email(user.email, "Verifikasi Akun Toko Sembako", email_content, email_type="otp")
        if not success:
            log.error(f"Gagal mengirim email verifikasi ke {email}: {err}")
        else:
            log.info(f"Email verifikasi berhasil dikirim ke {email}")
    except Exception as e:
        log.error(f"Exception saat mengirim email verifikasi register: {e}")

    return user, None

def verify_register_otp(email, code):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        log.warning(f"Verify OTP gagal: user {email} tidak ditemukan")
        return False, "User tidak ditemukan"
    
    if user.is_verified:
        log.info(f"User {email} sudah terverifikasi sebelumnya")
        return True, "Akun sudah terverifikasi sebelumnya"
        
    if not user.otp_code or user.otp_type != "register" or user.otp_code != code:
        log.warning(f"Verify OTP gagal: kode salah untuk {email}")
        return False, "Kode OTP salah"
        
    if user.otp_expiry and user.otp_expiry < datetime.utcnow():
        log.warning(f"Verify OTP gagal: kode kedaluwarsa untuk {email}")
        return False, "Kode OTP sudah kedaluwarsa"
        
    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    user.otp_type = None
    db.session.commit()
    
    log.info(f"✅ User {email} berhasil diverifikasi")
    return True, None

def login_user(email, password):
    """
    Login user - jika email dan password benar, buat session token
    
    Returns:
        tuple: (user, token, error_message)
    """
    email = email.strip().lower()
    log.info(f"Login request untuk email: {email}")
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        log.warning(f"Login gagal: email/password salah untuk {email}")
        return None, None, "Email atau password salah"
    
    if not user.is_verified:
        # Trigger verification OTP resend if not verified
        otp = generate_digit_otp()
        user.otp_code = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        user.otp_type = "register"
        db.session.commit()
        
        log.info(f"Login dari akun belum terverifikasi {email}, mengirim OTP verifikasi")
        
        try:
            email_content = mail_service.generate_otp_email(user.nama, otp, "register")
            success, err = mail_service.send_email(user.email, "Verifikasi Akun Toko Sembako", email_content, email_type="otp")
            if not success:
                log.error(f"Gagal kirim ulang verifikasi ke {email}: {err}")
        except Exception as e:
            log.error(f"Exception kirim ulang verifikasi: {e}")
            
        return user, None, "Akun belum terverifikasi"

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
    
    log.info(f"✅ Login berhasil untuk {email}")
    return user, token, None

def request_login_otp(email):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        log.warning(f"Request login OTP gagal: email {email} tidak terdaftar")
        return False, "Email tidak terdaftar. Silakan daftar terlebih dahulu."
        
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    user.otp_type = "login"
    db.session.commit()
    
    log.info(f"Mengirim OTP login ke {email}")
    
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "login")
        success, err = mail_service.send_email(user.email, "OTP Login Toko Sembako", email_content, email_type="otp")
        if not success:
            log.error(f"Gagal mengirim OTP login ke {email}: {err}")
            return False, f"Gagal mengirim OTP login: {err}"
        log.info(f"OTP login berhasil dikirim ke {email}")
        return True, None
    except Exception as e:
        log.error(f"Exception mengirim OTP login: {e}")
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
    
    log.info(f"✅ Login OTP berhasil untuk {email}")
    return user, token, None

def request_reset_password_otp(email):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        log.warning(f"Request reset OTP gagal: email {email} tidak terdaftar")
        return False, "Email tidak terdaftar"
        
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    user.otp_type = "reset"
    db.session.commit()
    
    log.info(f"Mengirim OTP reset password ke {email}")
    
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "reset")
        success, err = mail_service.send_email(user.email, "Atur Ulang Kata Sandi - Toko Sembako", email_content, email_type="otp")
        if not success:
            log.error(f"Gagal mengirim OTP reset ke {email}: {err}")
            return False, f"Gagal mengirim OTP reset: {err}"
        return True, None
    except Exception as e:
        log.error(f"Exception mengirim OTP reset: {e}")
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
    
    log.info(f"Password berhasil di-reset untuk {email}")
    return True, None

def resend_otp(email, otp_type):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        log.warning(f"Resend OTP gagal: email {email} tidak terdaftar")
        return False, "Email tidak terdaftar"
        
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10 if otp_type != "login" else 5)
    user.otp_type = otp_type
    db.session.commit()
    
    log.info(f"Resend OTP ({otp_type}) ke {email}")
    
    subjects = {
        "register": "Verifikasi Akun Toko Sembako",
        "login": "OTP Login Toko Sembako",
        "reset": "Atur Ulang Kata Sandi - Toko Sembako",
        "forgot_password": "Atur Ulang Kata Sandi - Toko Sembako"
    }
    
    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, otp_type)
        success, err = mail_service.send_email(user.email, subjects.get(otp_type, "OTP Toko Sembako"), email_content, email_type="otp")
        if not success:
            log.error(f"Gagal mengirim ulang OTP ke {email}: {err}")
            return False, f"Gagal mengirim ulang OTP: {err}"
        log.info(f"OTP baru berhasil dikirim ke {email}")
        return True, None
    except Exception as e:
        log.error(f"Exception mengirim ulang OTP: {e}")
        return False, f"Gagal mengirim ulang OTP: {e}"

def forgot_password_request(email):
    """
    Request forgot password - kirim OTP ke email
    """
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        # Jangan beri tahu apakah email terdaftar atau tidak (security)
        log.info(f"Forgot password request untuk email tidak terdaftar: {email} (tetap return success)")
        return True, None
    
    otp = generate_digit_otp()
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    user.otp_type = "forgot_password"
    db.session.commit()

    log.info(f"Mengirim OTP forgot password ke {email}")

    try:
        email_content = mail_service.generate_otp_email(user.nama, otp, "forgot_password")
        success, err = mail_service.send_email(user.email, "Atur Ulang Kata Sandi - Toko Sembako", email_content, email_type="otp")
        if not success:
            log.error(f"Gagal mengirim OTP forgot password ke {email}: {err}")
            return False, f"Gagal mengirim OTP reset: {err}"
        return True, None
    except Exception as e:
        log.error(f"Exception mengirim OTP forgot password: {e}")
        return False, f"Gagal mengirim OTP reset: {e}"


def verify_forgot_password_otp(email, otp_code):
    """Verifikasi OTP untuk forgot password"""
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    if not user.otp_code or user.otp_type != "forgot_password" or user.otp_code != otp_code.strip():
        return False, "Kode OTP salah"
        
    if user.otp_expiry and user.otp_expiry < datetime.utcnow():
        return False, "Kode OTP sudah kedaluwarsa"
        
    return True, None


def reset_password(email, new_password):
    """Reset password setelah verifikasi OTP"""
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "User tidak ditemukan"
    
    if len(new_password) < 6:
        return False, "Password minimal 6 karakter"
    
    # Update password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    log.info(f"Password berhasil diubah untuk {email}")
    
    # Kirim email notifikasi password berhasil diubah
    send_security_email(user.email, user.nama, 'password_changed')
    
    return True, None


def logout_user(token):
    """Logout user - hapus session"""
    if not token:
        return False
    session = UserSession.query.filter_by(token=token).first()
    if session:
        log.info(f"Logout user_id={session.user_id}")
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


def update_user_profile(user, nama=None, telepon=None, foto=None):
    """Update profile user"""
    if nama is not None:
        user.nama = nama.strip()
    if telepon is not None:
        user.telepon = telepon.strip() if telepon else None
    if foto is not None:
        user.foto = foto
    user.updated_at = datetime.utcnow()
    db.session.commit()
    log.info(f"Profile diperbarui untuk user_id={user.id}")
    return user


def change_user_password(user, current_password, new_password):
    """Ganti password user via backend"""
    if not check_password_hash(user.password_hash, current_password):
        return False, "Password saat ini salah"
    if len(new_password) < 6:
        return False, "Password baru minimal 6 karakter"
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    log.info(f"Password berhasil diganti untuk user_id={user.id}")
    send_security_email(user.email, user.nama, 'password_changed')
    return True, None


def cleanup_unverified_accounts(hours=1):
    """
    Hapus akun yang tidak terverifikasi setelah X jam
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    unverified = User.query.filter(
        User.is_verified == False,
        User.created_at < cutoff_time
    ).all()
    
    count = 0
    for user in unverified:
        try:
            UserSession.query.filter_by(user_id=user.id).delete()
            db.session.delete(user)
            count += 1
        except Exception as e:
            log.error(f"Error menghapus user {user.email}: {e}")
    
    db.session.commit()
    log.info(f"Cleanup: Dihapus {count} akun unverified yang lebih dari {hours} jam")
    return count


def get_user_address(user_id):
    """Ambil alamat default user"""
    addr = AlamatPengiriman.query.filter_by(user_id=user_id, is_default=True).order_by(AlamatPengiriman.id.desc()).first()
    if not addr:
        addr = AlamatPengiriman.query.filter_by(user_id=user_id).order_by(AlamatPengiriman.id.desc()).first()
    return addr


def update_user_address(user_id, data):
    """Update atau create alamat default user"""
    alamat_lengkap = data.get("alamatLengkap") or data.get("alamat_lengkap") or ""
    kecamatan = data.get("kecamatan") or ""
    kota = data.get("kota") or ""
    kode_pos = data.get("kodePos") or data.get("kode_pos") or ""
    catatan = data.get("catatan") or ""
    
    # Cari alamat default yang ada
    addr = AlamatPengiriman.query.filter_by(user_id=user_id, is_default=True).order_by(AlamatPengiriman.id.desc()).first()
    if not addr:
        addr = AlamatPengiriman.query.filter_by(user_id=user_id).order_by(AlamatPengiriman.id.desc()).first()
        
    if addr:
        addr.alamat_lengkap = alamat_lengkap
        addr.kecamatan = kecamatan
        addr.kota = kota
        addr.kode_pos = kode_pos
        addr.catatan = catatan
        addr.is_default = True
    else:
        addr = AlamatPengiriman(
            user_id=user_id,
            alamat_lengkap=alamat_lengkap,
            kecamatan=kecamatan,
            kota=kota,
            kode_pos=kode_pos,
            catatan=catatan,
            is_default=True
        )
        db.session.add(addr)
        
    db.session.commit()
    return addr
