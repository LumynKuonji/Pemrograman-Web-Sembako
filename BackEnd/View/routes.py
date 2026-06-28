"""
Routes API untuk Toko Sembako AI
Termasuk endpoint baru untuk email service, OTP, forgot password, invoice, dll.
"""
import os
from datetime import datetime
from flask import Blueprint, jsonify, request, send_file, redirect
from BackEnd.Controller import (
    auth_controller,
    chatbot_controller,
    keranjang_controller,
    mba_controller,
    pesanan_controller,
    produk_controller,
)
from BackEnd.Database.database import PesananItem, Pesanan, Produk, User, EmailLog, TokoSetting, ChatHistory, ChatSession, db
from BackEnd.Services.email_service import send_invoice_email, send_order_status_email
from BackEnd.logger import get_logger
import uuid

log = get_logger("api")

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _cors_preflight():
    return "", 204


def _get_user_from_request():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:].strip()
        user = auth_controller.get_user_by_token(token)
        if not user:
            from BackEnd.logger import get_logger
            log = get_logger("routes")
            log.warning(f"Token invalid atau kedaluwarsa: {token[:10]}...")
        return user
    return None


# ============================================
# AUTH ENDPOINTS
# ============================================

@api_bp.route("/auth/register", methods=["POST", "OPTIONS"])
def api_register():
    """
    POST /api/auth/register
    Body: { "nama": "...", "email": "...", "password": "...", "telepon": "..." }
    Response: { "status": "success", "message": "OTP telah dikirim ke email", "user": {...} }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    nama = data.get("nama", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    telepon = data.get("telepon")
    if not nama or not email or not password:
        return jsonify({"error": "Nama, email, dan password wajib diisi"}), 400
    user, err = auth_controller.register_user(nama, email, password, telepon)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({
        "status": "success", 
        "message": "Pendaftaran berhasil. Silakan verifikasi akun Anda via OTP.",
        "user": user.to_dict()
    }), 201


@api_bp.route("/auth/login", methods=["POST", "OPTIONS"])
def api_login():
    """
    POST /api/auth/login
    Body: { "email": "...", "password": "..." }
    Response: { "status": "success", "otp_required": true, "message": "OTP telah dikirim" }
    atau: { "status": "success", "token": "...", "user": {...} }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "")
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400
    user, token, err = auth_controller.login_user(email, password)
    if err:
        if err == "Akun belum terverifikasi":
            return jsonify({
                "status": "unverified",
                "error": err,
                "email": email
            }), 403
        return jsonify({"error": err}), 401
    return jsonify({
        "status": "success",
        "token": token,
        "user": user.to_dict(),
    })


@api_bp.route("/auth/verify-register", methods=["POST", "OPTIONS"])
def api_verify_register():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()
    if not email or not code:
        return jsonify({"error": "Email dan kode OTP wajib diisi"}), 400
    success, err = auth_controller.verify_register_otp(email, code)
    if err:
        return jsonify({"error": err}), 400
    
    # Auto login upon successful verification
    user = auth_controller.User.query.filter_by(email=email).first()
    import secrets
    from datetime import datetime, timedelta
    token = secrets.token_urlsafe(32)
    session = auth_controller.UserSession(
        user_id=user.id,
        token=token,
        expired_at=datetime.utcnow() + timedelta(days=7),
    )
    auth_controller.db.session.add(session)
    auth_controller.db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": "Akun berhasil diverifikasi",
        "token": token,
        "user": user.to_dict()
    })


@api_bp.route("/auth/request-login-otp", methods=["POST", "OPTIONS"])
def api_request_login_otp():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email wajib diisi"}), 400
    success, err = auth_controller.request_login_otp(email)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"status": "success", "message": "Kode OTP masuk akun telah dikirim ke email Anda"})


@api_bp.route("/auth/verify-login-otp", methods=["POST", "OPTIONS"])
def api_verify_login_otp():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()
    if not email or not code:
        return jsonify({"error": "Email dan kode OTP wajib diisi"}), 400
    user, token, err = auth_controller.verify_login_otp(email, code)
    if err:
        return jsonify({"error": err}), 401
    return jsonify({
        "status": "success",
        "token": token,
        "user": user.to_dict()
    })


@api_bp.route("/auth/request-reset-otp", methods=["POST", "OPTIONS"])
def api_request_reset_otp():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email wajib diisi"}), 400
    success, err = auth_controller.request_reset_password_otp(email)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"status": "success", "message": "Kode OTP untuk atur ulang kata sandi telah dikirim ke email Anda"})


@api_bp.route("/auth/verify-reset-otp", methods=["POST", "OPTIONS"])
def api_verify_reset_otp():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()
    new_password = data.get("password", "")
    if not email or not code or not new_password:
        return jsonify({"error": "Email, kode OTP, dan password baru wajib diisi"}), 400
    success, err = auth_controller.reset_password_with_otp(email, code, new_password)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"status": "success", "message": "Kata sandi Anda berhasil diperbarui"})


@api_bp.route("/auth/resend-otp", methods=["POST", "OPTIONS"])
def api_resend_otp():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    otp_type = data.get("otp_type", "register").strip()
    if not email:
        return jsonify({"error": "Email wajib diisi"}), 400
    success, err = auth_controller.resend_otp(email, otp_type)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"status": "success", "message": "Kode OTP baru telah dikirim ke email Anda"})


@api_bp.route("/auth/logout", methods=["POST", "OPTIONS"])
def api_logout():
    """POST /api/auth/logout - Logout user"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    auth = request.headers.get("Authorization", "")
    token = auth[7:].strip() if auth.startswith("Bearer ") else None
    auth_controller.logout_user(token)
    return jsonify({"status": "success"})


@api_bp.route("/auth/me", methods=["GET", "OPTIONS"])
def api_me():
    """GET /api/auth/me - Get current user info"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    return jsonify({"user": user.to_dict()})


@api_bp.route("/auth/delete-account", methods=["DELETE", "OPTIONS"])
def api_delete_account():
    """DELETE /api/auth/delete-account - Hapus akun sendiri (hanya unverified)"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    
    if not email:
        return jsonify({"error": "Email wajib diisi"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User tidak ditemukan"}), 404
    
    # Hanya bisa delete akun sendiri jika belum terverifikasi
    if user.is_verified:
        return jsonify({"error": "Tidak bisa menghapus akun yang sudah terverifikasi"}), 403
    
    try:
        # Hapus sessions
        UserSession.query.filter_by(user_id=user.id).delete()
        # Hapus keranjang
        from BackEnd.Database.database import ItemKeranjang
        ItemKeranjang.query.filter_by(user_id=user.id).delete()
        # Hapus user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Akun berhasil dihapus"})
    except Exception as e:
        return jsonify({"error": f"Gagal menghapus akun: {e}"}), 500


@api_bp.route("/auth/cleanup-unverified", methods=["POST", "OPTIONS"])
def api_cleanup_unverified():
    """POST /api/auth/cleanup-unverified - Cleanup unverified accounts (maintenance)"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    
    hours = request.json.get("hours", 1) if request.json else 1
    
    try:
        count = auth_controller.cleanup_unverified_accounts(hours)
        return jsonify({
            "status": "success",
            "message": f"Dihapus {count} akun unverified yang lebih dari {hours} jam",
            "deleted_count": count
        })
    except Exception as e:
        return jsonify({"error": f"Gagal cleanup: {e}"}), 500


@api_bp.route("/auth/profile", methods=["PUT", "OPTIONS"])
def api_update_profile():
    """PUT /api/auth/profile - Update user profile"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    data = request.json or {}
    nama = data.get("nama")
    telepon = data.get("telepon")
    foto = data.get("foto")
    if nama is not None and not nama.strip():
        return jsonify({"error": "Nama tidak boleh kosong"}), 400
    updated = auth_controller.update_user_profile(user, nama=nama, telepon=telepon, foto=foto)
    return jsonify({"status": "success", "user": updated.to_dict()})


@api_bp.route("/auth/address", methods=["GET", "PUT", "OPTIONS"])
def api_user_address():
    """GET /api/auth/address - Dapatkan alamat user
    PUT /api/auth/address - Simpan/Update alamat user"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
        
    if request.method == "GET":
        addr = auth_controller.get_user_address(user.id)
        if not addr:
            return jsonify({
                "alamatLengkap": "",
                "kecamatan": "",
                "kota": "",
                "kodePos": "",
                "catatan": ""
            })
        return jsonify({
            "alamatLengkap": addr.alamat_lengkap,
            "kecamatan": addr.kecamatan,
            "kota": addr.kota,
            "kodePos": addr.kode_pos,
            "catatan": addr.catatan
        })
        
    elif request.method == "PUT":
        data = request.json or {}
        addr = auth_controller.update_user_address(user.id, data)
        return jsonify({
            "status": "success",
            "address": {
                "alamatLengkap": addr.alamat_lengkap,
                "kecamatan": addr.kecamatan,
                "kota": addr.kota,
                "kodePos": addr.kode_pos,
                "catatan": addr.catatan
            }
        })


@api_bp.route("/auth/change-password", methods=["PUT", "OPTIONS"])
def api_change_password():
    """PUT /api/auth/change-password - Change password via backend"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    data = request.json or {}
    current = data.get("current_password", "")
    new_pass = data.get("new_password", "")
    confirm = data.get("confirm_password", "")
    if not current or not new_pass:
        return jsonify({"error": "Password lama dan baru wajib diisi"}), 400
    if new_pass != confirm:
        return jsonify({"error": "Konfirmasi password tidak sesuai"}), 400
    success, err = auth_controller.change_user_password(user, current, new_pass)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"status": "success", "message": "Password berhasil diperbarui"})


# ============================================
# FORGOT PASSWORD ENDPOINTS
# ============================================

@api_bp.route("/auth/forgot-password", methods=["POST", "OPTIONS"])
def api_forgot_password():
    """
    POST /api/auth/forgot-password
    Body: { "email": "..." }
    Response: { "status": "success", "message": "OTP telah dikirim ke email" }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "")
    if not email:
        return jsonify({"error": "Email wajib diisi"}), 400
    
    success, err = auth_controller.forgot_password_request(email)
    if err:
        return jsonify({"error": err}), 400
    
    return jsonify({
        "status": "success",
        "message": "Jika email terdaftar, OTP akan dikirim ke email Anda"
    })


@api_bp.route("/auth/verify-forgot-otp", methods=["POST", "OPTIONS"])
def api_verify_forgot_otp():
    """
    POST /api/auth/verify-forgot-otp
    Body: { "email": "...", "otp_code": "123456" }
    Response: { "status": "success", "message": "OTP valid. Silakan reset password" }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "")
    otp_code = data.get("otp_code", "")
    
    if not email or not otp_code:
        return jsonify({"error": "Email dan OTP wajib diisi"}), 400
    
    success, err = auth_controller.verify_forgot_password_otp(email, otp_code)
    if err:
        return jsonify({"error": err}), 400
    
    return jsonify({
        "status": "success",
        "message": "OTP valid. Silakan masukkan password baru."
    })


@api_bp.route("/auth/reset-password", methods=["POST", "OPTIONS"])
def api_reset_password():
    """
    POST /api/auth/reset-password
    Body: { "email": "...", "new_password": "..." }
    Response: { "status": "success", "message": "Password berhasil diubah" }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "")
    new_password = data.get("new_password", "")
    
    if not email or not new_password:
        return jsonify({"error": "Email dan password baru wajib diisi"}), 400
    
    success, err = auth_controller.reset_password(email, new_password)
    if err:
        return jsonify({"error": err}), 400
    
    return jsonify({
        "status": "success",
        "message": "Password berhasil diubah. Silakan login dengan password baru."
    })


# ============================================
# PRODUCT ENDPOINTS
# ============================================

@api_bp.route('/products', methods=['GET'])
def api_products():
    """
    GET /api/products?kategori=Bahan+Pokok&search=Indomie
    """
    kategori = request.args.get('kategori', 'Semua')
    search = request.args.get('search', '')

    if search or (kategori and kategori != 'Semua'):
        data = produk_controller.cari_produk(search, kategori)
    else:
        data = produk_controller.get_semua_produk()
        
    return jsonify([p.to_dict() for p in data])


@api_bp.route('/products', methods=['POST', 'OPTIONS'])
def api_products_add():
    if request.method == "OPTIONS":
        return _cors_preflight()
        
    # Check if request is multipart/form-data
    if request.content_type and "multipart/form-data" in request.content_type:
        nama = request.form.get("nama", "").strip()
        harga = request.form.get("harga")
        stok = request.form.get("stok", 0)
        kategori = request.form.get("kategori", "").strip()
        desc = request.form.get("desc", "").strip()
        
        file = request.files.get("img")
        img_data = file.read() if file else None
    else:
        # JSON fallback
        data = request.json or {}
        nama = data.get("nama", "").strip()
        harga = data.get("harga")
        stok = data.get("stok", 0)
        kategori = data.get("kategori", "").strip()
        img_url = data.get("img", "").strip()
        
        # If a URL is sent via JSON, save it as bytes (text representation)
        img_data = img_url.encode("utf-8") if img_url else None
        desc = data.get("desc", "").strip()
        
    if not nama or harga is None or not kategori:
        return jsonify({"error": "Nama, harga, dan kategori produk wajib diisi"}), 400
        
    try:
        harga_int = int(harga)
    except ValueError:
        return jsonify({"error": "Harga harus berupa angka"}), 400
        
    try:
        stok_int = int(stok)
    except (ValueError, TypeError):
        stok_int = 0
        
    produk = produk_controller.tambah_produk(nama, harga_int, kategori, img_data, desc or None, stok=stok_int)
    return jsonify({"status": "success", "message": "Produk berhasil ditambahkan", "product": produk.to_dict()}), 201
 
 
@api_bp.route('/products/<int:produk_id>', methods=['PUT', 'OPTIONS'])
def api_products_edit(produk_id):
    if request.method == "OPTIONS":
        return _cors_preflight()
        
    # Check if request is multipart/form-data
    if request.content_type and "multipart/form-data" in request.content_type:
        nama = request.form.get("nama", "").strip()
        harga = request.form.get("harga")
        stok = request.form.get("stok")
        kategori = request.form.get("kategori", "").strip()
        desc = request.form.get("desc", "").strip()
        
        # If files were uploaded
        if "img" in request.files:
            file = request.files.get("img")
            img_data = file.read() if file else b""
        else:
            img_data = None # Do not update image
    else:
        # JSON fallback
        data = request.json or {}
        nama = data.get("nama", "").strip()
        harga = data.get("harga")
        stok = data.get("stok")
        kategori = data.get("kategori", "").strip()
        desc = data.get("desc", "").strip()
        
        img_url = data.get("img")
        img_data = img_url.encode("utf-8") if img_url is not None else None
        
    if not nama or harga is None or not kategori:
        return jsonify({"error": "Nama, harga, dan kategori produk wajib diisi"}), 400
        
    try:
        harga_int = int(harga)
    except ValueError:
        return jsonify({"error": "Harga harus berupa angka"}), 400
        
    stok_int = None
    if stok is not None:
        try:
            stok_int = int(stok)
        except (ValueError, TypeError):
            return jsonify({"error": "Stok harus berupa angka"}), 400
        
    produk = produk_controller.edit_produk(produk_id, nama, harga_int, kategori, img_data, desc or None, stok=stok_int)
    if not produk:
        return jsonify({"error": "Produk tidak ditemukan"}), 404
        
    return jsonify({"status": "success", "message": "Produk berhasil diperbarui", "product": produk.to_dict()})


@api_bp.route('/products/<int:produk_id>/image', methods=['GET'])
def api_get_product_image(produk_id):
    produk = Produk.query.get_or_404(produk_id)
    img_data = produk.img
    
    # Cek apakah ini URL (disimpan sebagai bytes text)
    img_url = None
    if img_data:
        if isinstance(img_data, str):
            if img_data.startswith("http") or img_data.startswith("/"):
                img_url = img_data
        elif isinstance(img_data, (bytes, bytearray)):
            try:
                decoded = img_data.decode('utf-8')
                if decoded.startswith("http") or decoded.startswith("/"):
                    img_url = decoded
            except Exception:
                pass
    
    if img_url:
        if img_url.startswith("/"):
            img_url = request.host_url.rstrip("/") + img_url
        return redirect(img_url)
    
    # Binary image data (upload dari admin) -> serve langsung
    if img_data and isinstance(img_data, (bytes, bytearray)):
        import io
        mime = "image/jpeg"
        if img_data.startswith(b"\x89PNG"):
            mime = "image/png"
        elif img_data.startswith(b"GIF8"):
            mime = "image/gif"
        elif img_data.startswith(b"RIFF") and b"WEBP" in img_data[:12]:
            mime = "image/webp"
        return send_file(io.BytesIO(img_data), mimetype=mime)
    
    # Fallback ke placeholder
    return redirect(Produk.PLACEHOLDER_IMG)


@api_bp.route('/products/<int:produk_id>', methods=['DELETE', 'OPTIONS'])
def api_products_delete(produk_id):
    if request.method == "OPTIONS":
        return _cors_preflight()
    success = produk_controller.hapus_produk(produk_id)
    if not success:
        return jsonify({"error": "Produk tidak ditemukan atau gagal dihapus"}), 404
    return jsonify({"status": "success", "message": "Produk berhasil dihapus"})


# ============================================
# CART ENDPOINTS
# ============================================

@api_bp.route('/cart', methods=['GET'])
def api_cart_get():
    """GET /api/cart - Get cart items"""
    user = _get_user_from_request()
    uid = user.id if user else None
    return jsonify(keranjang_controller.get_isi_keranjang(uid))


@api_bp.route('/cart', methods=['POST'])
def api_cart_add():
    """POST /api/cart { "produk_id": 1, "qty": 1 }"""
    data = request.json
    if not data or 'produk_id' not in data:
        return jsonify({'error': 'ID Produk diperlukan'}), 400
    
    user = _get_user_from_request()
    uid = user.id if user else None
    keranjang_controller.tambah_ke_keranjang(data["produk_id"], data.get("qty", 1), uid)
    return jsonify({"status": "success", "cart": keranjang_controller.get_isi_keranjang(uid)})


@api_bp.route('/cart/<int:produk_id>', methods=['PUT'])
def api_cart_update(produk_id):
    """PUT /api/cart/1 { "qty": 5 }"""
    data = request.json
    user = _get_user_from_request()
    uid = user.id if user else None
    keranjang_controller.update_qty_keranjang(produk_id, data.get("qty", 0), uid)
    return jsonify({"status": "success", "cart": keranjang_controller.get_isi_keranjang(uid)})


@api_bp.route('/cart/clear', methods=['POST'])
def api_cart_clear():
    """POST /api/cart/clear - Clear cart"""
    user = _get_user_from_request()
    uid = user.id if user else None
    keranjang_controller.kosongkan_keranjang(uid)
    return jsonify({"status": "success"})


# ============================================
# RECOMMENDATIONS ENDPOINTS
# ============================================

@api_bp.route('/recommendations', methods=['GET'])
def api_recommendations():
    """GET /api/recommendations?cart_ids=1,25"""
    cart_ids_param = request.args.get('cart_ids', '')
    cart_ids = []
    if cart_ids_param:
        try:
            cart_ids = [int(x.strip()) for x in cart_ids_param.split(',') if x.strip()]
        except ValueError:
            return jsonify({'error': 'cart_ids harus berupa angka dipisah koma'}), 400

    result = mba_controller.get_recommendations(cart_ids)
    produk_map = {p.id: p.to_dict() for p in Produk.query.all()}
    result['products'] = [
        produk_map[pid] for pid in result['product_ids'] if pid in produk_map
    ]
    return jsonify(result)


# ============================================
# CHATBOT ENDPOINTS
# ============================================

@api_bp.route("/chat/models", methods=["GET", "OPTIONS"])
def api_chat_models():
    """GET /api/chat/models - List available AI models"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    provider, base_url, api_key, current = chatbot_controller.get_ai_config()
    if provider != "nvidia":
        return jsonify({"error": "Endpoint ini hanya untuk AI_PROVIDER=nvidia"}), 400
    models, err = chatbot_controller.list_nvidia_models(api_key, base_url)
    if err:
        return jsonify({"error": err, "current_model": current}), 502
    return jsonify({"models": models, "current_model": current, "hint": "Salin id persis ke AI_MODEL"})


@api_bp.route("/chat/status", methods=["GET", "OPTIONS"])
def api_chat_status():
    """GET /api/chat/status - Check AI configuration status"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    provider, base_url, _, model = chatbot_controller.get_ai_config()
    return jsonify({
        "configured": chatbot_controller.is_configured(),
        "provider": provider,
        "base_url_set": bool(base_url),
        "model": model,
    })


@api_bp.route("/chat", methods=["POST", "OPTIONS"])
def api_chat():
    """POST /api/chat - Chat with AI, menyimpan riwayat ke database"""
    if request.method == "OPTIONS":
        return _cors_preflight()

    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Login diperlukan untuk menggunakan chatbot"}), 401

    data = request.json or {}
    messages = data.get("messages", [])
    session_id = data.get("session_id", "")
    if not isinstance(messages, list):
        return jsonify({"error": "Format messages tidak valid"}), 400

    # Buat session baru jika belum ada
    if not session_id:
        session_id = str(uuid.uuid4())

    reply, err = chatbot_controller.chat_completion(messages, user_name=user.nama)
    if err:
        return jsonify({"error": err, "session_id": session_id}), 502 if chatbot_controller.is_configured() else 503

    # Simpan pesan user terakhir dan reply AI ke database
    try:
        chat_session = ChatSession.query.filter_by(session_id=session_id).first()
        if not chat_session:
            # Ambil judul dari pesan pertama user
            first_msg = next((m.get("content", "")[:80] for m in messages if m.get("role") == "user"), "Chat Baru")
            chat_session = ChatSession(
                session_id=session_id,
                user_id=user.id,
                title=first_msg or "Chat Baru"
            )
            db.session.add(chat_session)
            db.session.flush()

        # Simpan pesan user terakhir
        last_user_msg = None
        for m in reversed(messages):
            if m.get("role") == "user" and m.get("content"):
                last_user_msg = m["content"]
                break

        if last_user_msg:
            user_entry = ChatHistory(
                user_id=user.id,
                session_id=session_id,
                role="user",
                content=last_user_msg
            )
            db.session.add(user_entry)

        # Simpan reply AI
        ai_entry = ChatHistory(
            user_id=user.id,
            session_id=session_id,
            role="assistant",
            content=reply
        )
        db.session.add(ai_entry)

        chat_session.updated_at = datetime.utcnow()
        db.session.commit()
    except Exception as e:
        log.error(f"Gagal menyimpan chat history: {e}")
        db.session.rollback()

    return jsonify({"reply": reply, "user": user.nama, "session_id": session_id})


# ============================================
# CHAT HISTORY ENDPOINTS
# ============================================

@api_bp.route("/chat/history", methods=["GET", "OPTIONS"])
def api_chat_history_list():
    """GET /api/chat/history - Daftar sesi chat user"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    sessions = ChatSession.query.filter_by(user_id=user.id).order_by(ChatSession.updated_at.desc()).all()
    return jsonify({"sessions": [s.to_dict() for s in sessions]})


@api_bp.route("/chat/history/<session_id>", methods=["GET", "OPTIONS"])
def api_chat_history_detail(session_id):
    """GET /api/chat/history/<session_id> - Detail percakapan satu sesi"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    session = ChatSession.query.filter_by(session_id=session_id, user_id=user.id).first()
    if not session:
        return jsonify({"error": "Sesi chat tidak ditemukan"}), 404
    return jsonify({"session": session.to_dict(include_messages=True)})


@api_bp.route("/chat/history/<session_id>", methods=["DELETE", "OPTIONS"])
def api_chat_history_delete(session_id):
    """DELETE /api/chat/history/<session_id> - Hapus satu sesi chat"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    session = ChatSession.query.filter_by(session_id=session_id, user_id=user.id).first()
    if not session:
        return jsonify({"error": "Sesi chat tidak ditemukan"}), 404
    ChatHistory.query.filter_by(session_id=session_id).delete()
    db.session.delete(session)
    db.session.commit()
    return jsonify({"status": "success", "message": "Sesi chat dihapus"})


@api_bp.route("/chat/history", methods=["DELETE", "OPTIONS"])
def api_chat_history_clear():
    """DELETE /api/chat/history - Hapus semua riwayat chat user"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    sessions = ChatSession.query.filter_by(user_id=user.id).all()
    for s in sessions:
        ChatHistory.query.filter_by(session_id=s.session_id).delete()
        db.session.delete(s)
    db.session.commit()
    return jsonify({"status": "success", "message": "Semua riwayat chat dihapus"})


@api_bp.route("/admin/sales-statistics", methods=["GET", "OPTIONS"])
def api_admin_sales_statistics():
    """GET /api/admin/sales-statistics - Statistik penjualan mingguan (admin only)"""
    if request.method == "OPTIONS":
        return _cors_preflight()

    user = _get_user_from_request()
    if not user or not user.is_admin:
        return jsonify({"error": "Akses ditolak: Hanya admin"}), 403

    orders = (
        Pesanan.query.filter(Pesanan.status != "Pesanan Dibatalkan")
        .order_by(Pesanan.created_at.asc())
        .all()
    )

    if not orders:
        return jsonify({
            "weeks": [],
            "summary": {
                "total_revenue": 0,
                "total_profit": 0,
                "average_per_week": 0,
                "peak_week": "Belum ada data"
            }
        })

    weekly_data = {}
    for order in orders:
        created_at = order.created_at or datetime.utcnow()
        start_date = orders[0].created_at.date() if orders[0].created_at else created_at.date()
        week_index = ((created_at.date() - start_date).days // 7) + 1
        bucket = weekly_data.setdefault(week_index, {
            "label": f"Minggu {week_index}",
            "revenue": 0,
            "profit": 0,
            "orders": 0,
        })
        revenue = int(order.total_harga or 0)
        profit = max(0, revenue - int(order.ongkir or 0))
        bucket["revenue"] += revenue
        bucket["profit"] += profit
        bucket["orders"] += 1

    weeks = [weekly_data[key] for key in sorted(weekly_data.keys())]
    total_revenue = sum(item["revenue"] for item in weeks)
    total_profit = sum(item["profit"] for item in weeks)
    peak_week = max(weeks, key=lambda item: item["revenue"])["label"] if weeks else "Belum ada data"

    return jsonify({
        "weeks": weeks,
        "summary": {
            "total_revenue": total_revenue,
            "total_profit": total_profit,
            "average_per_week": total_revenue // len(weeks) if weeks else 0,
            "peak_week": peak_week,
        }
    })


# ============================================
# ORDER / CHECKOUT ENDPOINTS
# ============================================

@api_bp.route("/orders", methods=["GET", "OPTIONS"])
def api_orders():
    """
    GET /api/orders - Get user's order history
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401

    data = []
    for order in pesanan_controller.get_pesanan_user(user.id):
        items = PesananItem.query.filter_by(pesanan_id=order.id).all()
        data.append({
            "id": order.kode_pesanan,
            "invoice_number": order.invoice_number,
            "tanggal": order.created_at.isoformat(),
            "total": order.total_harga,
            "status": order.status,
            "paymentMethod": order.metode_bayar,
            "items": [
                {
                    "produk_id": item.produk_id,
                    "nama": item.nama_produk,
                    "harga": item.harga,
                    "qty": item.qty,
                }
                for item in items
            ],
        })
    return jsonify({"orders": data})


@api_bp.route("/orders/checkout", methods=["POST", "OPTIONS"])
def api_checkout():
    """
    POST /api/orders/checkout
    Body: { "metode_bayar": "COD", "ongkir": 10000, "alamat": {...} }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Login diperlukan untuk checkout"}), 401

    order, err = pesanan_controller.buat_pesanan_dari_keranjang(user.id, request.json or {})
    if err:
        return jsonify({"error": err}), 400

    # Kirim email invoice
    try:
        items = PesananItem.query.filter_by(pesanan_id=order.id).all()
        invoice_data = {
            "invoice_number": order.invoice_number,
            "order_date": order.created_at.strftime("%d %B %Y, %H:%M") + " WIB",
            "items": [{"nama": i.nama_produk, "harga": i.harga, "qty": i.qty, "subtotal": i.subtotal} for i in items],
            "subtotal": sum(i.subtotal for i in items),
            "ongkir": order.ongkir or 0,
            "total": order.total_harga,
            "payment_method": order.metode_bayar,
            "alamat_lengkap": order.alamat_lengkap,
            "kecamatan": order.kecamatan,
            "kota": order.kota,
            "kode_pos": order.kode_pos,
            "status": order.status,
        }
        send_invoice_email(user.email, user.nama, invoice_data)
    except Exception as e:
        # Jangan gagalkan checkout jika email gagal
        pass

    return jsonify({
        "status": "success",
        "order": {
            "id": order.kode_pesanan,
            "invoice_number": order.invoice_number,
            "total": order.total_harga,
            "status": order.status,
            "paymentMethod": order.metode_bayar,
        },
    }), 201


@api_bp.route("/orders/<invoice_number>", methods=["GET", "OPTIONS"])
def api_order_detail(invoice_number):
    """
    GET /api/orders/INV-XXXXX - Get order detail by invoice number
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401

    order = Pesanan.query.filter_by(invoice_number=invoice_number, user_id=user.id).first()
    if not order:
        return jsonify({"error": "Pesanan tidak ditemukan"}), 404

    items = PesananItem.query.filter_by(pesanan_id=order.id).all()
    return jsonify({
        "order": {
            "id": order.kode_pesanan,
            "invoice_number": order.invoice_number,
            "tanggal": order.created_at.isoformat(),
            "total": order.total_harga,
            "subtotal": sum(i.subtotal for i in items),
            "ongkir": order.ongkir or 0,
            "status": order.status,
            "paymentMethod": order.metode_bayar,
            "alamat_lengkap": order.alamat_lengkap,
            "kecamatan": order.kecamatan,
            "kota": order.kota,
            "kode_pos": order.kode_pos,
            "catatan": order.catatan,
            "items": [
                {
                    "produk_id": item.produk_id,
                    "nama": item.nama_produk,
                    "harga": item.harga,
                    "qty": item.qty,
                    "subtotal": item.subtotal,
                }
                for item in items
            ],
        }
    })


@api_bp.route("/orders/<invoice_number>/status", methods=["PUT", "OPTIONS"])
def api_update_order_status(invoice_number):
    """
    PUT /api/orders/INV-XXXXX/status
    Body: { "status": "Sedang Diproses" }
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401

    data = request.json or {}
    new_status = data.get("status", "")
    valid_statuses = ["Pesanan Diterima", "Sedang Diproses", "Sedang Dikirim", "Pesanan Selesai", "Pesanan Dibatalkan"]
    
    if new_status not in valid_statuses:
        return jsonify({"error": f"Status tidak valid. Pilihan: {', '.join(valid_statuses)}"}), 400

    order = Pesanan.query.filter_by(invoice_number=invoice_number, user_id=user.id).first()
    if not order:
        return jsonify({"error": "Pesanan tidak ditemukan"}), 404

    old_status = order.status
    order.status = new_status
    order.updated_at = datetime.utcnow()
    db.session.commit()

    # Kirim email notifikasi perubahan status
    try:
        send_order_status_email(user.email, user.nama, order.invoice_number, old_status, new_status)
    except Exception as e:
        pass

    return jsonify({
        "status": "success",
        "message": f"Status pesanan diubah dari '{old_status}' menjadi '{new_status}'"
    })


@api_bp.route("/orders/<invoice_number>/invoice", methods=["GET", "OPTIONS"])
def api_download_invoice(invoice_number):
    """
    GET /api/orders/INV-XXXXX/invoice - Download invoice as PDF
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401

    order = Pesanan.query.filter_by(invoice_number=invoice_number, user_id=user.id).first()
    if not order:
        return jsonify({"error": "Pesanan tidak ditemukan"}), 404

    try:
        pdf_file = pesanan_controller.generate_invoice_pdf(order)
        return send_file(
            pdf_file,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'invoice_{invoice_number}.pdf'
        )
    except Exception as e:
        return jsonify({"error": f"Gagal generate PDF: {str(e)}"}), 500


# ============================================
# SETTINGS ENDPOINTS
# ============================================

@api_bp.route("/settings/<key>", methods=["GET", "OPTIONS"])
def api_get_setting(key):
    if request.method == "OPTIONS":
        return _cors_preflight()
    setting = TokoSetting.query.get(key)
    if not setting:
        return jsonify({"key": key, "value": ""})
    return jsonify(setting.to_dict())


@api_bp.route("/settings", methods=["POST", "OPTIONS"])
def api_save_setting():
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user or not user.is_admin:
        return jsonify({"error": "Akses ditolak: Hanya admin yang dapat mengubah pengaturan logo toko"}), 403
    
    data = request.json or {}
    key = data.get("key", "").strip()
    value = data.get("value", "").strip()
    if not key:
        return jsonify({"error": "Key wajib diisi"}), 400
        
    setting = TokoSetting.query.get(key)
    if not setting:
        setting = TokoSetting(key=key)
        db.session.add(setting)
    setting.value = value
    db.session.commit()
    return jsonify({"status": "success", "setting": setting.to_dict()})


@api_bp.route("/settings/upload-logo", methods=["POST", "OPTIONS"])
def api_upload_logo():
    if request.method == "OPTIONS":
        return _cors_preflight()
        
    user = _get_user_from_request()
    if not user or not user.is_admin:
        from BackEnd.logger import get_logger
        log = get_logger("routes")
        log.warning(f"Upload logo ditolak. User: {user.email if user else 'None'}, is_admin: {user.is_admin if user else 'N/A'}")
        return jsonify({"error": "Akses ditolak: Hanya admin yang dapat mengubah logo toko"}), 403
        
    if "logo" not in request.files:
        return jsonify({"error": "File logo tidak ditemukan dalam request"}), 400
        
    file = request.files["logo"]
    if file.filename == "":
        return jsonify({"error": "Tidak ada file yang dipilih"}), 400
        
    allowed_extensions = {"png", "jpg", "jpeg", "gif", "svg", "webp"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        return jsonify({"error": f"Format file tidak didukung. Gunakan: {', '.join(allowed_extensions)}"}), 400
        
    from pathlib import Path
    backend_root = Path(__file__).resolve().parent.parent
    upload_dir = backend_root / "uploads"
    upload_dir.mkdir(exist_ok=True)
    
    # Baca data biner berkas yang diunggah
    file_bytes = file.read()
    
    # Cari berkas logo yang sudah ada dengan konten biner yang sama
    matched_filename = None
    for existing_file in upload_dir.glob("logo_*.*"):
        if existing_file.is_file():
            try:
                with open(existing_file, "rb") as ef:
                    existing_bytes = ef.read()
                if existing_bytes == file_bytes:
                    matched_filename = existing_file.name
                    break
            except Exception:
                pass
                
    if matched_filename:
        filename = matched_filename
    else:
        # Generate nama file unik jika tidak ada gambar yang sama
        filename = f"logo_{uuid.uuid4().hex[:8]}.{ext}"
        file_path = upload_dir / filename
        try:
            with open(file_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            return jsonify({"error": f"Gagal menyimpan file logo: {e}"}), 500
    
    logo_url = f"{request.host_url.rstrip('/')}/api/uploads/{filename}"
    
    setting = TokoSetting.query.get("logo")
    if not setting:
        setting = TokoSetting(key="logo")
        db.session.add(setting)
    setting.value = logo_url
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": "Logo berhasil diupload dan disimpan",
        "value": logo_url
    })


@api_bp.route("/uploads/<filename>", methods=["GET"])
def api_get_uploaded_file(filename):
    from flask import send_from_directory
    from pathlib import Path
    backend_root = Path(__file__).resolve().parent.parent
    upload_dir = backend_root / "uploads"
    return send_from_directory(str(upload_dir), filename)


# ============================================
# REGISTER ROUTES
# ============================================

@api_bp.route("/admin/email-logs", methods=["GET", "OPTIONS"])
def api_email_logs():
    """GET /api/admin/email-logs - View email logs (admin only)"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    
    user = _get_user_from_request()
    if not user or not user.is_admin:
        return jsonify({"error": "Akses ditolak: Hanya admin"}), 403
    
    # Filter by email_type, recipient, status, etc
    email_type = request.args.get("type", "")
    recipient = request.args.get("recipient", "")
    status = request.args.get("status", "")
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    
    query = EmailLog.query
    
    if email_type:
        query = query.filter_by(email_type=email_type)
    if recipient:
        query = query.filter(EmailLog.recipient.ilike(f"%{recipient}%"))
    if status:
        query = query.filter_by(status=status)
    
    total = query.count()
    logs = query.order_by(EmailLog.sent_at.desc()).limit(limit).offset(offset).all()
    
    return jsonify({
        "status": "success",
        "total": total,
        "limit": limit,
        "offset": offset,
        "logs": [log.to_dict() for log in logs]
    })


@api_bp.route("/admin/email-logs/<int:log_id>", methods=["GET", "OPTIONS"])
def api_email_log_detail(log_id):
    """GET /api/admin/email-logs/:id - View email log detail dengan HTML content"""
    if request.method == "OPTIONS":
        return _cors_preflight()
    
    user = _get_user_from_request()
    if not user or not user.is_admin:
        return jsonify({"error": "Akses ditolak: Hanya admin"}), 403
    
    log = EmailLog.query.get(log_id)
    if not log:
        return jsonify({"error": "Email log tidak ditemukan"}), 404
    
    return jsonify({
        "status": "success",
        "log": log.to_dict(include_html=True)
    })


def register_routes(app):
    app.register_blueprint(api_bp)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response
