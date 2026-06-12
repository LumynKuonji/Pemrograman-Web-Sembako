from BackEnd.Database.database import Produk

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

