import secrets
from datetime import datetime, timedelta

from werkzeug.security import check_password_hash, generate_password_hash

from BackEnd.Database.database import User, UserSession, db


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
    )
    db.session.add(user)
    db.session.commit()
    return user, None


def login_user(email, password):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return None, None, "Email atau password salah"

    token = secrets.token_urlsafe(32)
    session = UserSession(
        user_id=user.id,
        token=token,
        expired_at=datetime.utcnow() + timedelta(days=7),
    )
    db.session.add(session)
    db.session.commit()
    return user, token, None


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
