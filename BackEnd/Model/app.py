from pathlib import Path
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parent.parent

# Load .env file dari root proyek, atau jika tidak ada gunakan BackEnd/config_mail.env
ENV_PATH = BACKEND_ROOT.parent / ".env"
MAIL_ENV_PATH = BACKEND_ROOT / "config_mail.env"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
    print(f"[Config] Root .env dimuat dari {ENV_PATH}")
    if MAIL_ENV_PATH.exists():
        # override=True agar konfigurasi mail di config_mail.env menimpa .env root
        load_dotenv(MAIL_ENV_PATH, override=True)
        print(f"[Config] Konfigurasi email dimuat dari {MAIL_ENV_PATH} (override=True)")
elif MAIL_ENV_PATH.exists():
    load_dotenv(MAIL_ENV_PATH)
    print(f"[Config] Email config dimuat dari {MAIL_ENV_PATH}")
else:
    print(f"[Config Warning] File .env dan config_mail.env tidak ditemukan")
    print("   Buat file BackEnd/config_mail.env untuk mengaktifkan fitur email")

from flask import Flask
from BackEnd.Database.database import Produk, User, TokoSetting, db
from BackEnd.Model.products import PRODUCT_SEEDS
from BackEnd.View.routes import register_routes
from BackEnd.Services.email_service import init_mail
from BackEnd.logger import get_logger
from werkzeug.security import generate_password_hash

log = get_logger("app")


def create_app():
    app = Flask(__name__)
    db_path = BACKEND_ROOT / "toko_sembako.db"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path.as_posix()}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Gunakan SECRET_KEY dari .env jika ada, fallback ke default
    import os
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "sembako-dev-secret-change-in-production")

    db.init_app(app)
    
    # Inisialisasi email service (logs config status)
    init_mail(app)
    
    register_routes(app)

    with app.app_context():
        db.create_all()
        
        # Migrasi SQLite: pastikan kolom html_content ada di tabel email_log
        import sqlite3
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(email_log)")
            columns = [info[1] for info in cursor.fetchall()]
            if columns and "html_content" not in columns:
                cursor.execute("ALTER TABLE email_log ADD COLUMN html_content TEXT")
                conn.commit()
                log.info("Migrasi SQLite: Kolom html_content berhasil ditambahkan ke tabel email_log")
            conn.close()
        except Exception as e:
            log.warning(f"Gagal memeriksa/migrasi kolom html_content di SQLite: {e}")

        sync_seed_products()
        
        seed_demo_user()
        seed_settings()
        
        # Cleanup unverified accounts yang lebih dari 1 jam
        from BackEnd.Controller import auth_controller
        auth_controller.cleanup_unverified_accounts(hours=1)

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
            img_url = data.get("img", "").strip()
            if not img_url or not img_url.startswith("http"):
                img_url = Produk.PLACEHOLDER_IMG
            # Simpan URL sebagai bytes agar kompatibel dengan LargeBinary
            produk = Produk(
                id=data["id"],
                nama=data["nama"],
                harga=data["harga"],
                kategori=data["kategori"],
                img=img_url.encode("utf-8"),
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