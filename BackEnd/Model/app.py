import sys
from pathlib import Path

# Folder BackEnd harus ada di Python path agar import Database/View/Controller jalan
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from flask import Flask
from Database.database import User, db, Produk
from View.routes import register_routes
from werkzeug.security import generate_password_hash

def create_app():
    app = Flask(__name__)
    db_path = BACKEND_ROOT / "toko_sembako.db"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path.as_posix()}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "sembako-dev-secret-change-in-production"

    db.init_app(app)
    register_routes(app)

    with app.app_context():
        db.create_all()
        if Produk.query.count() == 0:
            seed_data()
        seed_demo_user()

    return app


def seed_demo_user():
    if User.query.filter_by(email="moreno@gmail.com").first():
        return
    demo = User(
        nama="Moreno",
        email="moreno@gmail.com",
        password_hash=generate_password_hash("123456"),
        telepon="+62 812-7891-6777",
        foto="https://i.pravatar.cc/150?img=68",
    )
    db.session.add(demo)
    db.session.commit()

def seed_data():
    products_data = [
        {"id": 1, "nama": "Beras Fortune 5 KG", "harga": 96000, "kategori": "Bahan Pokok", "img": "https://down-id.img.susercontent.com/file/8395b675db848bddc30455bd25ea6541@resize_w900_nl.webp", "desc": "Beras pulen kualitas premium."},
        {"id": 2, "nama": "GULAKU 1KG", "harga": 18000, "kategori": "Bahan Pokok", "img": "https://i.pinimg.com/736x/f7/92/69/f79269dae0c36b6f54f9af5dc9dccf4b.jpg", "desc": "Gula pasir putih berkualitas."},
        {"id": 3, "nama": "Gula Halus Rose Brand 500 GR", "harga": 14000, "kategori": "Bahan Pokok", "img": "https://i.pinimg.com/1200x/e6/6b/a1/e66ba14e4ca583029af940a0517fc314.jpg", "desc": "Gula halus lembut untuk kue."},
        {"id": 4, "nama": "Tepung Segitiga Biru 1KG", "harga": 16000, "kategori": "Bahan Pokok", "img": "https://i.pinimg.com/736x/57/7b/05/577b05da5c698a257d0b1680dec4840f.jpg", "desc": "Tepung serbaguna untuk gorengan."},
        {"id": 5, "nama": "Indomie Goreng 1 dus", "harga": 137500, "kategori": "Makanan Instan", "img": "https://i.pinimg.com/1200x/39/f9/79/39f97924e0ccefe5865900356a9d336b.jpg", "desc": "Indomie goreng favorit keluarga."},
        {"id": 6, "nama": "Indomie Soto Mie 1 dus", "harga": 140500, "kategori": "Makanan Instan", "img": "https://i.pinimg.com/1200x/f2/12/12/f2121200e80b301688d31d1763f40d1a.jpg", "desc": "Rasa kuah soto yang gurih."},
        {"id": 10, "nama": "Garam Kapal 250 Gr", "harga": 3000, "kategori": "Bumbu Dapur", "img": "https://i.pinimg.com/1200x/34/15/5a/34155ad4cb58371c1a59d8d482b78f80.jpg", "desc": "Garam meja halus."},
        {"id": 11, "nama": "Masako Ayam 11 Gr (6 Sachet)", "harga": 13000, "kategori": "Bumbu Dapur", "img": "https://i.pinimg.com/1200x/4f/6d/72/4f6d728d69bbb59f928afb68e15f6592.jpg", "desc": "Penyedap rasa ayam."},
        {"id": 13, "nama": "Teh Kotak Jasmine 200 Ml", "harga": 4000, "kategori": "Minuman", "img": "https://i.pinimg.com/1200x/9f/25/d2/9f25d257a6c644a182cbe026a5eecd84.jpg", "desc": "Teh melati segar."},
        {"id": 16, "nama": "POTABEE BARBEQUE 68 GR", "harga": 28000, "kategori": "Snack", "img": "https://down-id.img.susercontent.com/file/sg-11134201-824g9-mepph5cyvgn9c2@resize_w900_nl.webp", "desc": "Keripik kentang rasa BBQ."},
        {"id": 19, "nama": "Head & Shoulder 350ml", "harga": 87000, "kategori": "Kebutuhan Mandi", "img": "https://i.pinimg.com/1200x/54/7e/12/547e12146ace111fe9d98c2c7598af2a.jpg", "desc": "Shampoo anti ketombe."},
        {"id": 20, "nama": "SUNLIGHT BOTOL 750 ML", "harga": 49000, "kategori": "Kebutuhan Cuci", "img": "https://i.pinimg.com/1200x/4c/78/bb/4c78bb6fd632ed391f2ec25769f1b251.jpg", "desc": "Sabun cuci piring."},
        {"id": 22, "nama": "SO GOOD TELUR OMEGA3 10S", "harga": 34000, "kategori": "Produk Segar", "img": "https://down-id.img.susercontent.com/file/id-11134275-7rbk2-ma7ysj9nanj5a9@resize_w900_nl.webp", "desc": "Telur kaya omega."},
        {"id": 25, "nama": "Minyak Goreng Bimoli 2 L", "harga": 42000, "kategori": "Bahan Pokok", "img": "https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f6789012345678abcdef01.jpg", "desc": "Minyak goreng berkualitas."},
        {"id": 26, "nama": "Sarden King 155 gr", "harga": 18000, "kategori": "Makanan Instan", "img": "https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6789012345678abcdef0123.jpg", "desc": "Ikan sarden dalam saus tomat."},
    ]

    for p in products_data:
        produk = Produk(
            id=p['id'],
            nama=p['nama'],
            harga=p['harga'],
            kategori=p['kategori'],
            img=p['img'],
            desc=p['desc']
        )
        db.session.add(produk)
    db.session.commit()

if __name__ == '__main__':
    print("Server berjalan di http://localhost:5000")
    print("API Produk: http://localhost:5000/api/products")
    print("API Cart: http://localhost:5000/api/cart")
    print("API Rekomendasi: http://localhost:5000/api/recommendations?cart_ids=1")
    create_app().run(debug=True)


    