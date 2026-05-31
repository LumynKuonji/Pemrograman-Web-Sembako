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
    print("API Register:   POST http://localhost:5000/api/auth/register")
    print("API Login:      POST http://localhost:5000/api/auth/login")
    print("API Chatbot:    POST http://localhost:5000/api/chat")
    from Controller import chatbot_controller
    if chatbot_controller.is_configured():
        provider, url, _, model = chatbot_controller.get_ai_config()
        print(f"Chatbot AI:     {provider} ✓  model={model}")
        print(f"                {url}")
    else:
        print("Chatbot AI:     isi BackEnd/config_ai.env (NVIDIA NIM / OpenRouter / 9Router)")
    app.run(debug=True)
