from Database.database import ItemKeranjang, db


def _query_keranjang(user_id):
    q = ItemKeranjang.query
    if user_id is not None:
        return q.filter_by(user_id=user_id)
    return q.filter(ItemKeranjang.user_id.is_(None))


def tambah_ke_keranjang(produk_id, qty=1, user_id=None):
    item = _query_keranjang(user_id).filter_by(produk_id=produk_id).first()
    if item:
        item.qty += qty
    else:
        item = ItemKeranjang(produk_id=produk_id, qty=qty, user_id=user_id)
        db.session.add(item)
    db.session.commit()
    return item


def update_qty_keranjang(produk_id, qty_baru, user_id=None):
    item = _query_keranjang(user_id).filter_by(produk_id=produk_id).first()
    if item:
        if qty_baru <= 0:
            db.session.delete(item)
        else:
            item.qty = qty_baru
        db.session.commit()
    return True

def get_isi_keranjang(user_id=None):
    items = _query_keranjang(user_id).all()
    total_harga = 0
    total_barang = 0
    
    data_items = []
    for item in items:
        subtotal = item.produk.harga * item.qty
        total_harga += subtotal
        total_barang += item.qty
        data_items.append({
            'id': item.produk.id,
            'nama': item.produk.nama,
            'harga': item.produk.harga,
            'img': item.produk.img,
            'qty': item.qty,
            'subtotal': subtotal
        })

    return {
        'items': data_items,
        'total_harga': total_harga,
        'total_barang': total_barang
    }

def kosongkan_keranjang(user_id=None):
    _query_keranjang(user_id).delete(synchronize_session=False)
    db.session.commit()