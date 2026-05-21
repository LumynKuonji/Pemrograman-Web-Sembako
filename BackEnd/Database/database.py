from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Produk(db.Model):
    __tablename__ = 'produk'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nama = db.Column(db.String(100), nullable=False)
    harga = db.Column(db.Integer, nullable=False)
    kategori = db.Column(db.String(50), nullable=False)
    img = db.Column(db.String(255))
    desc = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'nama': self.nama,
            'harga': self.harga,
            'kategori': self.kategori,
            'img': self.img,
            'desc': self.desc
        }
    
class ItemKeranjang(db.Model):
    __tablename__ = 'keranjang'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    produk_id = db.Column(db.Integer, db.ForeignKey('produk.id'), nullable=False)
    qty = db.Column(db.Integer, nullable=False, default=1)
    
    produk = db.relationship('Produk', backref=db.backref('keranjang_items', lazy=True))

    @property
    def subtotal(self):
        return self.harga * self.qty