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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = db.relationship("UserSession", backref="user", lazy=True, cascade="all, delete-orphan")
    keranjang_items = db.relationship("ItemKeranjang", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_email=True):
        data = {
            "id": self.id,
            "nama": self.nama,
            "telepon": self.telepon,
            "foto": self.foto,
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
    total_harga = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Sedang Diproses")
    metode_bayar = db.Column(db.String(50), default="COD")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PesananItem(db.Model):
    __tablename__ = "pesanan_item"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pesanan_id = db.Column(db.Integer, db.ForeignKey("pesanan.id"), nullable=False, index=True)
    produk_id = db.Column(db.Integer, db.ForeignKey("produk.id"), nullable=False)
    nama_produk = db.Column(db.String(100), nullable=False)
    harga = db.Column(db.Integer, nullable=False)
    qty = db.Column(db.Integer, nullable=False)
