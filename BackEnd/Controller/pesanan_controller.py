from datetime import datetime

from BackEnd.Database.database import (
    AlamatPengiriman,
    ItemKeranjang,
    Pesanan,
    PesananItem,
    db,
)


def buat_pesanan_dari_keranjang(user_id, data):
    items = ItemKeranjang.query.filter_by(user_id=user_id).all()
    if not items:
        return None, "Keranjang masih kosong"

    subtotal = sum(item.subtotal for item in items)
    ongkir = int(data.get("ongkir", 0) or 0)
    total = subtotal + ongkir
    alamat = data.get("alamat") or {}

    if alamat:
        db.session.add(AlamatPengiriman(
            user_id=user_id,
            alamat_lengkap=alamat.get("alamat_lengkap") or alamat.get("alamatLengkap") or "-",
            kecamatan=alamat.get("kecamatan"),
            kota=alamat.get("kota") or "-",
            kode_pos=alamat.get("kode_pos") or alamat.get("kodePos") or "-",
            catatan=alamat.get("catatan"),
            is_default=True,
        ))

    pesanan = Pesanan(
        user_id=user_id,
        kode_pesanan=f"ORD-{datetime.utcnow().strftime('%y%m%d%H%M%S%f')[:-3]}",
        total_harga=total,
        metode_bayar=data.get("metode_bayar") or data.get("paymentMethod") or "COD",
    )
    db.session.add(pesanan)
    db.session.flush()

    for item in items:
        db.session.add(PesananItem(
            pesanan_id=pesanan.id,
            produk_id=item.produk_id,
            nama_produk=item.produk.nama,
            harga=item.produk.harga,
            qty=item.qty,
        ))
        db.session.delete(item)

    db.session.commit()
    return pesanan, None


def get_pesanan_user(user_id):
    return Pesanan.query.filter_by(user_id=user_id).order_by(Pesanan.created_at.desc()).all()
