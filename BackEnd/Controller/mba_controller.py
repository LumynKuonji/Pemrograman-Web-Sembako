"""
Market Basket Analysis (MBA) - aturan asosiasi sederhana.

Cara kerja:
- Setiap aturan punya "trigger" (produk pemicu di keranjang) dan "recommend" (produk disarankan).
- Saat user punya trigger di keranjang, produk recommend ditampilkan (kecuali sudah ada di keranjang).

Nanti bisa diganti dengan algoritma Apriori dari data transaksi riil.
"""

MBA_RULES = [
    {
        "id": "paket-beras",
        "nama": "Paket Dapur Lengkap",
        "deskripsi": "Pelanggan yang beli beras sering juga membeli minyak goreng dan sarden.",
        "triggers": [1],
        "recommends": [25, 26],
        "confidence": 0.72,
    },
    {
        "id": "paket-indomie",
        "nama": "Lengkapi Masakan Instan",
        "deskripsi": "Sering dibeli bersama: bumbu penyedap dan minuman.",
        "triggers": [5, 6, 7, 8, 9],
        "recommends": [11, 13],
        "confidence": 0.65,
    },
    {
        "id": "paket-teh",
        "nama": "Temani Teh dengan Camilan",
        "deskripsi": "Pelanggan pembeli teh sering menambah snack.",
        "triggers": [13, 14, 15],
        "recommends": [16, 17],
        "confidence": 0.58,
    },
    {
        "id": "paket-cuci",
        "nama": "Kebutuhan Rumah Tangga",
        "deskripsi": "Sabun cuci piring sering dibeli bersama kebutuhan mandi.",
        "triggers": [20],
        "recommends": [19, 21],
        "confidence": 0.55,
    },
]

DEFAULT_RECOMMENDS = [1, 25, 26, 5, 13]


def get_recommendations(cart_produk_ids=None):
    """
    Mengembalikan daftar rekomendasi berdasarkan isi keranjang.
    cart_produk_ids: list[int] id produk di keranjang
    """
    cart_ids = set(cart_produk_ids or [])
    scored = {}
    matched_rules = []

    for rule in MBA_RULES:
        if not cart_ids.intersection(rule["triggers"]):
            continue
        matched_rules.append({
            "id": rule["id"],
            "nama": rule["nama"],
            "deskripsi": rule["deskripsi"],
            "confidence": rule["confidence"],
        })
        for pid in rule["recommends"]:
            if pid in cart_ids:
                continue
            scored[pid] = scored.get(pid, 0) + rule["confidence"]

    if not scored:
        product_ids = [pid for pid in DEFAULT_RECOMMENDS if pid not in cart_ids]
        return {
            "mode": "default",
            "rules": [],
            "product_ids": product_ids[:6],
        }

    sorted_ids = sorted(scored.keys(), key=lambda x: scored[x], reverse=True)
    return {
        "mode": "mba",
        "rules": matched_rules,
        "product_ids": sorted_ids[:6],
    }
