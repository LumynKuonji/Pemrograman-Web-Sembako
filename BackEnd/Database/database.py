from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nama = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    telepon = db.Column(db.String(30))
    foto = db.Column(db.String(500))
    
    # Verification & Security fields
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    otp_code = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    otp_type = db.Column(db.String(20), nullable=True) 
    last_login = db.Column(db.DateTime)

    @property
    def email_verified(self):
        return self.is_verified

    @email_verified.setter
    def email_verified(self, value):
        self.is_verified = value

    @property
    def otp_expired_at(self):
        return self.otp_expiry

    @otp_expired_at.setter
    def otp_expired_at(self, value):
        self.otp_expiry = value

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = db.relationship("UserSession", backref="user", lazy=True, cascade="all, delete-orphan")
    keranjang_items = db.relationship("ItemKeranjang", backref="user", lazy=True, cascade="all, delete-orphan")
    orders = db.relationship("Pesanan", backref="user", lazy=True)

    def to_dict(self, include_email=True):
        data = {
            "id": self.id,
            "nama": self.nama,
            "telepon": self.telepon,
            "foto": self.foto,
            "is_verified": self.is_verified,
        }
        if include_email:
            data["email"] = self.email
        return data


class UserSession(db.Model):
    __tablename__ = "user_sessions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    token = db.Column(db.String(255), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expired_at = db.Column(db.DateTime)


class Produk(db.Model):
    __tablename__ = "produk"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nama = db.Column(db.String(100), nullable=False)
    harga = db.Column(db.Integer, nullable=False)
    kategori = db.Column(db.String(50), nullable=False)
    img = db.Column(db.String(500))
    desc = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "harga": self.harga,
            "kategori": self.kategori,
            "img": self.img,
            "desc": self.desc,
        }


class ItemKeranjang(db.Model):
    __tablename__ = "keranjang"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    produk_id = db.Column(db.Integer, db.ForeignKey("produk.id"), nullable=False)
    qty = db.Column(db.Integer, nullable=False, default=1)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    produk = db.relationship("Produk", backref=db.backref("keranjang_items", lazy=True))

    @property
    def subtotal(self):
        if self.produk:
            return self.produk.harga * self.qty
        return 0


class AlamatPengiriman(db.Model):
    __tablename__ = "alamat_pengiriman"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    alamat_lengkap = db.Column(db.Text, nullable=False)
    kecamatan = db.Column(db.String(80))
    kota = db.Column(db.String(80), nullable=False)
    kode_pos = db.Column(db.String(10), nullable=False)
    catatan = db.Column(db.String(255))
    is_default = db.Column(db.Boolean, default=True)


class Pesanan(db.Model):
    __tablename__ = "pesanan"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    kode_pesanan = db.Column(db.String(32), nullable=False, unique=True)
    invoice_number = db.Column(db.String(50), nullable=False, unique=True)
    total_harga = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Pesanan Diterima")
    metode_bayar = db.Column(db.String(50), default="COD")
    
    # Shipping information
    alamat_lengkap = db.Column(db.Text)
    kecamatan = db.Column(db.String(80))
    kota = db.Column(db.String(80))
    kode_pos = db.Column(db.String(10))
    catatan = db.Column(db.String(255))
    ongkir = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = db.relationship("PesananItem", backref="pesanan", lazy=True, cascade="all, delete-orphan")


class PesananItem(db.Model):
    __tablename__ = "pesanan_item"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pesanan_id = db.Column(db.Integer, db.ForeignKey("pesanan.id"), nullable=False, index=True)
    produk_id = db.Column(db.Integer, db.ForeignKey("produk.id"), nullable=False)
    nama_produk = db.Column(db.String(100), nullable=False)
    harga = db.Column(db.Integer, nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    
    produk = db.relationship("Produk", backref="pesanan_items")
    
    @property
    def subtotal(self):
        return self.harga * self.qty


class EmailLog(db.Model):
    """Log untuk tracking email yang dikirim"""
    __tablename__ = "email_log"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipient = db.Column(db.String(255), nullable=False, index=True)
    subject = db.Column(db.String(255), nullable=False)
    email_type = db.Column(db.String(50), nullable=False)  # 'otp', 'invoice', 'status', 'security'
    status = db.Column(db.String(20), default="sent")  # 'sent', 'failed'
    error_message = db.Column(db.Text)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "recipient": self.recipient,
            "subject": self.subject,
            "type": self.email_type,
            "status": self.status,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
        }
