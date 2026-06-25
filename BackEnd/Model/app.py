from pathlib import Path
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parent.parent

# Load .env file dari root proyek
ENV_PATH = BACKEND_ROOT.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
    print(f"[Email Config] Email config dimuat dari {ENV_PATH}")
else:
    print(f"[Email Config Warning] File .env tidak ditemukan di {ENV_PATH}")
    print("   Buat file .env dari .env.example untuk mengaktifkan fitur email")

from flask import Flask
from BackEnd.Database.database import Produk, User, TokoSetting, db
from BackEnd.Model.products import PRODUCT_SEEDS
from BackEnd.View.routes import register_routes
from BackEnd.Services.email_service import init_mail
from werkzeug.security import generate_password_hash


def create_app():
    app = Flask(__name__)
    db_path = BACKEND_ROOT / "toko_sembako.db"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path.as_posix()}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Gunakan SECRET_KEY dari .env jika ada, fallback ke default
    import os
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "sembako-dev-secret-change-in-production")

    db.init_app(app)
    
    # Inisialisasi Flask-Mail
    init_mail(app)
    
    register_routes(app)

    with app.app_context():
        db.create_all()
        sync_seed_products()
        seed_demo_user()
        seed_settings()

    return app


def seed_settings():
    if not TokoSetting.query.filter_by(key="logo").first():
        logo_setting = TokoSetting(key="logo", value="")
        db.session.add(logo_setting)
        db.session.commit()


def seed_demo_user():
    # Seed standard user
    if not User.query.filter_by(email="moreno@gmail.com").first():
        demo = User(
            nama="Moreno",
            email="moreno@gmail.com",
            password_hash=generate_password_hash("123456"),
            telepon="+62 812-7891-6777",
            foto="https://i.pravatar.cc/150?img=68",
            is_verified=True,
            is_admin=False
        )
        db.session.add(demo)

    # Seed admin user
    if not User.query.filter_by(email="admin@sembako.com").first():
        admin = User(
            nama="Admin Sembako",
            email="admin@sembako.com",
            password_hash=generate_password_hash("admin123"),
            telepon="+62 812-3456-7890",
            foto="https://img.icons8.com/color/150/admin-settings-male.png",
            is_verified=True,
            is_admin=True
        )
        db.session.add(admin)
        
    db.session.commit()


def sync_seed_products():
    if Produk.query.count() == 0:
        for data in PRODUCT_SEEDS:
            produk = Produk(
                id=data["id"],
                nama=data["nama"],
                harga=data["harga"],
                kategori=data["kategori"],
                img=data["img"],
                desc=data["desc"]
            )
            db.session.add(produk)
        db.session.commit()


if __name__ == "__main__":
    print("Server berjalan di http://localhost:5000")
    print("API Produk: http://localhost:5000/api/products")
    print("API Cart: http://localhost:5000/api/cart")
    print("API Rekomendasi: http://localhost:5000/api/recommendations?cart_ids=1")
    create_app().run(debug=True, use_reloader=False)