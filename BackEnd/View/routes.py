from flask import Blueprint, request, jsonify
from Controller import produk_controller, keranjang_controller
from Database.database import db, Produk

api_bp = Blueprint('api', __name__, url_prefix='/api')

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
    return jsonify(keranjang_controller.get_isi_keranjang())

@api_bp.route('/cart', methods=['POST'])
def api_cart_add():
    """
    Endpoint: POST /api/cart { "produk_id": 1, "qty": 1 }
    Logic: Menambah barang ke database.
    """
    data = request.json
    if not data or 'produk_id' not in
        return jsonify({'error': 'ID Produk diperlukan'}), 400
    
    keranjang_controller.tambah_ke_keranjang(data['produk_id'], data.get('qty', 1))
    return jsonify({'status': 'success', 'cart': keranjang_controller.get_isi_keranjang()})

@api_bp.route('/cart/<int:produk_id>', methods=['PUT'])
def api_cart_update(produk_id):
    """
    Endpoint: PUT /api/cart/1 { "qty": 5 }
    Logic: Update jumlah barang.
    """
    data = request.json
    keranjang_controller.update_qty_keranjang(produk_id, data.get('qty', 0))
    return jsonify({'status': 'success', 'cart': keranjang_controller.get_isi_keranjang()})

@api_bp.route('/cart/clear', methods=['POST'])
def api_cart_clear():
    """
    Endpoint: POST /api/cart/clear
    Logic: Checkout -> Kosongkan keranjang.
    """
    keranjang_controller.kosongkan_keranjang()
    return jsonify({'status': 'success'})

def register_routes(app):
    app.register_blueprint(api_bp)
