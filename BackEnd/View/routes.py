"""
Routes API untuk Toko Sembako AI
Termasuk endpoint baru untuk email service, OTP, forgot password, invoice, dll.
"""
import os
from datetime import datetime
from flask import Blueprint, jsonify, request, send_file
from BackEnd.Controller import (
    auth_controller,
    chatbot_controller,
    keranjang_controller,
    mba_controller,
    pesanan_controller,
    produk_controller,
)
from BackEnd.Database.database import PesananItem, Pesanan, Produk, User, EmailLog, db
from BackEnd.Services.email_service import send_invoice_email, send_order_status_email

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _cors_preflight():
    return "", 204


def _get_user_from_request():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth_controller.get_user_by_token(auth[7:].strip())
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
    """POST /api/chat - Chat with AI"""
    if request.method == "OPTIONS":
        return _cors_preflight()

    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Login diperlukan untuk menggunakan chatbot"}), 401

    data = request.json or {}
    messages = data.get("messages", [])
    if not isinstance(messages, list):
        return jsonify({"error": "Format messages tidak valid"}), 400

    reply, err = chatbot_controller.chat_completion(messages, user_name=user.nama)
    if err:
        return jsonify({"error": err}), 502 if chatbot_controller.is_configured() else 503

    return jsonify({"reply": reply, "user": user.nama})


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
# EMAIL LOG ENDPOINT
# ============================================

@api_bp.route("/email-logs", methods=["GET", "OPTIONS"])
def api_email_logs():
    """
    GET /api/email-logs - Get email sending history
    """
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401

    logs = EmailLog.query.filter_by(recipient=user.email).order_by(EmailLog.sent_at.desc()).limit(50).all()
    return jsonify({"logs": [log.to_dict() for log in logs]})


# ============================================
# REGISTER ROUTES
# ============================================

def register_routes(app):
    app.register_blueprint(api_bp)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
        return response
