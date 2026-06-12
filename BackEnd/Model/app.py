from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent

from flask import Flask
from BackEnd.Database.database import Produk, User, db
from BackEnd.Model.products import PRODUCT_SEEDS
from BackEnd.View.routes import register_routes
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
        sync_seed_products()
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


def sync_seed_products():
    for data in PRODUCT_SEEDS:
        produk = Produk.query.get(data["id"])
        if produk is None:
            produk = Produk(id=data["id"])
            db.session.add(produk)
        produk.nama = data["nama"]
        produk.harga = data["harga"]
        produk.kategori = data["kategori"]
        produk.img = data["img"]
        produk.desc = data["desc"]
    db.session.commit()


if __name__ == "__main__":
    print("Server berjalan di http://localhost:5000")
    print("API Produk: http://localhost:5000/api/products")
    print("API Cart: http://localhost:5000/api/cart")
    print("API Rekomendasi: http://localhost:5000/api/recommendations?cart_ids=1")
    create_app().run(debug=True)
