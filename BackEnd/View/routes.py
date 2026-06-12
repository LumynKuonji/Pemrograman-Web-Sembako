from flask import Blueprint, jsonify, request
from BackEnd.Controller import (
    auth_controller,
    chatbot_controller,
    keranjang_controller,
    mba_controller,
    pesanan_controller,
    produk_controller,
)
from BackEnd.Database.database import PesananItem, Produk

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _cors_preflight():
    return "", 204


def _get_user_from_request():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth_controller.get_user_by_token(auth[7:].strip())
    return None


@api_bp.route("/auth/register", methods=["POST", "OPTIONS"])
def api_register():
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
    return jsonify({"status": "success", "user": user.to_dict()}), 201


@api_bp.route("/auth/login", methods=["POST", "OPTIONS"])
def api_login():
    if request.method == "OPTIONS":
        return _cors_preflight()
    data = request.json or {}
    email = data.get("email", "")
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400
    user, token, err = auth_controller.login_user(email, password)
    if err:
        return jsonify({"error": err}), 401
    return jsonify({
        "status": "success",
        "token": token,
        "user": user.to_dict(),
    })


@api_bp.route("/auth/logout", methods=["POST", "OPTIONS"])
def api_logout():
    if request.method == "OPTIONS":
        return _cors_preflight()
    auth = request.headers.get("Authorization", "")
    token = auth[7:].strip() if auth.startswith("Bearer ") else None
    auth_controller.logout_user(token)
    return jsonify({"status": "success"})


@api_bp.route("/auth/me", methods=["GET", "OPTIONS"])
def api_me():
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Belum login"}), 401
    return jsonify({"user": user.to_dict()})

@api_bp.route('/products', methods=['GET'])
def api_products():
    """
    Endpoint: GET /api/products?kategori=Bahan+Pokok&search=Indomie
    Logic: Memanggil controller untuk memfilter data.
    """
    kategori = request.args.get('kategori', 'Semua')
    search = request.args.get('search', '')

    if search or (kategori and kategori != 'Semua'):
        data = produk_controller.cari_produk(search, kategori)
    else:
        data = produk_controller.get_semua_produk()
        
    return jsonify([p.to_dict() for p in data])

@api_bp.route('/cart', methods=['GET'])
def api_cart_get():
    """
    Endpoint: GET /api/cart
    Logic: Mengambil isi keranjang dari database.
    """
    user = _get_user_from_request()
    uid = user.id if user else None
    return jsonify(keranjang_controller.get_isi_keranjang(uid))

@api_bp.route('/cart', methods=['POST'])
def api_cart_add():
    """
    Endpoint: POST /api/cart { "produk_id": 1, "qty": 1 }
    Logic: Menambah barang ke database.
    """
    data = request.json
    if not data or 'produk_id' not in data:
        return jsonify({'error': 'ID Produk diperlukan'}), 400
    
    user = _get_user_from_request()
    uid = user.id if user else None
    keranjang_controller.tambah_ke_keranjang(data["produk_id"], data.get("qty", 1), uid)
    return jsonify({"status": "success", "cart": keranjang_controller.get_isi_keranjang(uid)})

@api_bp.route('/cart/<int:produk_id>', methods=['PUT'])
def api_cart_update(produk_id):
    """
    Endpoint: PUT /api/cart/1 { "qty": 5 }
    Logic: Update jumlah barang.
    """
    data = request.json
    user = _get_user_from_request()
    uid = user.id if user else None
    keranjang_controller.update_qty_keranjang(produk_id, data.get("qty", 0), uid)
    return jsonify({"status": "success", "cart": keranjang_controller.get_isi_keranjang(uid)})

@api_bp.route('/recommendations', methods=['GET'])
def api_recommendations():
    """
    Endpoint: GET /api/recommendations?cart_ids=1,25
    Logic: Rekomendasi MBA berdasarkan isi keranjang.
    """
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

@api_bp.route("/chat/models", methods=["GET", "OPTIONS"])
def api_chat_models():
    """Daftar model NVIDIA yang tersedia untuk API key Anda."""
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


@api_bp.route('/cart/clear', methods=['POST'])
def api_cart_clear():
    """
    Endpoint: POST /api/cart/clear
    Logic: Checkout -> Kosongkan keranjang.
    """
    user = _get_user_from_request()
    uid = user.id if user else None
    keranjang_controller.kosongkan_keranjang(uid)
    return jsonify({"status": "success"})


@api_bp.route("/orders", methods=["GET", "OPTIONS"])
def api_orders():
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
    if request.method == "OPTIONS":
        return _cors_preflight()
    user = _get_user_from_request()
    if not user:
        return jsonify({"error": "Login diperlukan untuk checkout"}), 401

    order, err = pesanan_controller.buat_pesanan_dari_keranjang(user.id, request.json or {})
    if err:
        return jsonify({"error": err}), 400

    return jsonify({
        "status": "success",
        "order": {
            "id": order.kode_pesanan,
            "total": order.total_harga,
            "status": order.status,
            "paymentMethod": order.metode_bayar,
        },
    }), 201


def register_routes(app):
    app.register_blueprint(api_bp)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
        return response
