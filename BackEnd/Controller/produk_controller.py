from BackEnd.Database.database import Produk, db, ItemKeranjang, PesananItem

def get_semua_produk():
    return Produk.query.all()

def cari_produk(keyword, kategori):
    query = Produk.query
    if kategori and kategori != 'Semua':
        query = query.filter(Produk.kategori.like(f'%{kategori}%'))
    if keyword:
        query = query.filter(Produk.nama.like(f'%{keyword}%'))
    return query.all()

def get_produk_by_id(produk_id):
    return Produk.query.get(produk_id)

def tambah_produk(nama, harga, kategori, img=None, desc=None, stok=0):
    produk = Produk(
        nama=nama,
        harga=harga,
        kategori=kategori,
        img=img,
        desc=desc,
        stok=stok
    )
    db.session.add(produk)
    db.session.commit()
    return produk

def edit_produk(produk_id, nama, harga, kategori, img=None, desc=None, stok=None):
    produk = Produk.query.get(produk_id)
    if not produk:
        return None
    produk.nama = nama
    produk.harga = harga
    produk.kategori = kategori
    if img is not None:
        produk.img = img
    if desc is not None:
        produk.desc = desc
    if stok is not None:
        produk.stok = stok
    db.session.commit()
    return produk

def hapus_produk(produk_id):
    produk = Produk.query.get(produk_id)
    if not produk:
        return False
    try:
        # Hapus item keranjang yang berkaitan terlebih dahulu
        ItemKeranjang.query.filter_by(produk_id=produk_id).delete()
        # Hapus item pesanan yang berkaitan untuk mencegah kegagalan foreign key
        PesananItem.query.filter_by(produk_id=produk_id).delete()
        
        db.session.delete(produk)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Gagal menghapus produk: {e}")
        return False

