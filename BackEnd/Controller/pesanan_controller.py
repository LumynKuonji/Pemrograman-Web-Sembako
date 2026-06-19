from datetime import datetime

from BackEnd.Database.database import (
    AlamatPengiriman,
    ItemKeranjang,
    Pesanan,
    PesananItem,
    User,
    db,
)
from BackEnd.Services import mail_service


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

    items_list_for_email = []
    for item in items:
        # Collect info for the email receipt
        items_list_for_email.append({
            "produk_id": item.produk_id,
            "nama": item.produk.nama,
            "harga": item.produk.harga,
            "qty": item.qty
        })
        
        db.session.add(PesananItem(
            pesanan_id=pesanan.id,
            produk_id=item.produk_id,
            nama_produk=item.produk.nama,
            harga=item.produk.harga,
            qty=item.qty,
        ))
        db.session.delete(item)

    db.session.commit()
    
    # Send purchase receipt & order notification email
    user = User.query.get(user_id)
    if user and user.email:
        alamat_str = "-"
        if alamat:
            alamat_str = f"{alamat.get('alamat_lengkap') or alamat.get('alamatLengkap') or '-'}, Kec. {alamat.get('kecamatan') or '-'}, {alamat.get('kota') or '-'}, {alamat.get('kode_pos') or alamat.get('kodePos') or '-'}"
        try:
            email_content = mail_service.generate_receipt_email(
                nama=user.nama,
                order_code=pesanan.kode_pesanan,
                items=items_list_for_email,
                subtotal=subtotal,
                ongkir=ongkir,
                total=total,
                payment_method=pesanan.metode_bayar,
                address_details=alamat_str
            )
            mail_service.send_email(
                to_email=user.email,
                subject=f"Konfirmasi Pesanan & Struk Pembelian: {pesanan.kode_pesanan}",
                html_content=email_content
            )
        except Exception as e:
            print(f"Gagal mengirim email struk pembelian: {e}")

    return pesanan, None


def get_pesanan_user(user_id):
    return Pesanan.query.filter_by(user_id=user_id).order_by(Pesanan.created_at.desc()).all()
