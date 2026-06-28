import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from BackEnd.Controller import chatbot_controller
from BackEnd.Model.app import create_app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False') == 'True'
    print(f"Server berjalan di http://0.0.0.0:{port}")
    print(f"API Produk:     http://0.0.0.0:{port}/api/products")
    print(f"API Keranjang:  http://0.0.0.0:{port}/api/cart")
    print(f"API MBA:        http://0.0.0.0:{port}/api/recommendations?cart_ids=1")
    print(f"API Register:   POST http://0.0.0.0:{port}/api/auth/register")
    print(f"API Login:      POST http://0.0.0.0:{port}/api/auth/login")
    print(f"API Chatbot:    POST http://0.0.0.0:{port}/api/chat")
    if chatbot_controller.is_configured():
        provider, url, _, model = chatbot_controller.get_ai_config()
        print(f"Chatbot AI:     {provider} [Ready]  model={model}")
        print(f"                {url}")
    else:
        print("Chatbot AI:     isi BackEnd/config_ai.env (NVIDIA NIM / OpenRouter / 9Router)")
    app.run(host='0.0.0.0', port=port, debug=debug, use_reloader=debug)
