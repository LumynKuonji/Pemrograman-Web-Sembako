"""
Cara menjalankan server Flask (dari folder BackEnd):

    cd BackEnd
    python run.py

Uji endpoint MBA di browser atau terminal:
    http://localhost:5000/api/recommendations?cart_ids=1
"""
from Model.app import create_app

if __name__ == "__main__":
    app = create_app()
    print("Server berjalan di http://localhost:5000")
    print("API Produk:     http://localhost:5000/api/products")
    print("API Keranjang:  http://localhost:5000/api/cart")
    print("API MBA:        http://localhost:5000/api/recommendations?cart_ids=1")
    app.run(debug=True)
