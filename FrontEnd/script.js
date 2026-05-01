const products = [
    { id: 1, nama: "Beras Fortune 5 KG", harga: 96000, kategori: "Bahan Pokok", img: "https://down-id.img.susercontent.com/file/8395b675db848bddc30455bd25ea6541@resize_w900_nl.webp", desc: "Beras pulen kualitas premium, cocok untuk keluarga besar." },
    { id: 2, nama: "GULAKU 1KG", harga: 18000, kategori: "Bahan Pokok", img: "https://i.pinimg.com/736x/f7/92/69/f79269dae0c36b6f54f9af5dc9dccf4b.jpg", desc: "Gula pasir putih berkualitas, manis alami." },
    { id: 3, nama: "Gula Halus Rose Brand 500 GR", harga: 14000, kategori: "Bahan Pokok", img: "https://i.pinimg.com/1200x/e6/6b/a1/e66ba14e4ca583029af940a0517fc314.jpg", desc: "Gula halus lembut untuk kue dan minuman." },
    { id: 4, nama: "Tepung Segitiga Biru 1KG", harga: 16000, kategori: "Bahan Pokok", img: "https://i.pinimg.com/736x/57/7b/05/577b05da5c698a257d0b1680dec4840f.jpg", desc: "Tepung serbaguna untuk gorengan dan baking." },
    { id: 5, nama: "Indomie Goreng 1 dus", harga: 137500, kategori: "Makanan Instan", img: "https://i.pinimg.com/1200x/39/f9/79/39f97924e0ccefe5865900356a9d336b.jpg", desc: "Indomie goreng favorit keluarga, isi 40 bungkus." },
    { id: 6, nama: "Indomie Soto Mie 1 dus", harga: 140500, kategori: "Makanan Instan", img: "https://i.pinimg.com/1200x/f2/12/12/f2121200e80b301688d31d1763f40d1a.jpg", desc: "Rasa kuah soto yang gurih dan segar." },
    { id: 7, nama: "Indomie Ayam Bawang 1 dus", harga: 125000, kategori: "Makanan Instan", img: "https://i.pinimg.com/1200x/58/ee/94/58ee946df496b196e19602b5acfec46b.jpg", desc: "Cita rasa bawang yang harum dan khas." },
    { id: 8, nama: "Mie Sedap Goreng 1 dus", harga: 140000, kategori: "Makanan Instan", img: "https://i.pinimg.com/1200x/23/db/35/23db35506192154250286ccea47a7a15.jpg", desc: "Mie goreng dengan bumbu kaya rempah." },
    { id: 9, nama: "Indomie Ayam Geprek 1 dus", harga: 143500, kategori: "Makanan Instan", img: "https://i.pinimg.com/736x/56/bb/26/56bb260308f663879bf8034b4b01d2b8.jpg", desc: "Pedas nikmat ala ayam geprek." },
    { id: 10, nama: "Garam Kapal 250 Gr", harga: 3000, kategori: "Bumbu Dapur", img: "https://i.pinimg.com/1200x/34/15/5a/34155ad4cb58371c1a59d8d482b78f80.jpg", desc: "Garam meja halus untuk masakan sehari-hari." },
    { id: 11, nama: "Masako Ayam 11 Gr (6 Sachet)", harga: 13000, kategori: "Bumbu Dapur", img: "https://i.pinimg.com/1200x/4f/6d/72/4f6d728d69bbb59f928afb68e15f6592.jpg", desc: "Penyedap rasa ayam praktis." },
    { id: 12, nama: "Royco Sapi (12 Sachet)", harga: 15000, kategori: "Bumbu Dapur", img: "https://i.pinimg.com/736x/fe/a0/a8/fea0a8a998a10a3a2e2cb40c00b2a9af.jpg", desc: "Bumbu penyedap sapi berkualitas." },
    { id: 13, nama: "Teh Kotak Jasmine 200 Ml", harga: 4000, kategori: "Minuman", img: "https://i.pinimg.com/1200x/9f/25/d2/9f25d257a6c644a182cbe026a5eecd84.jpg", desc: "Teh melati segar dalam kemasan kotak." },
    { id: 14, nama: "Teh Pucuk Harum 350 Ml", harga: 3500, kategori: "Minuman", img: "https://i.pinimg.com/1200x/ae/9e/55/ae9e55c743331663f05f42407271d04a.jpg", desc: "Teh hijau pucuk terbaik, segar dan sehat." },
    { id: 15, nama: "FRUIT TEA Apple 350ML", harga: 4000, kategori: "Minuman", img: "https://i.pinimg.com/1200x/4e/37/4d/4e374dc7e88a804fee0e79e5d209c74e.jpg", desc: "Teh rasa apel yang menyegarkan." },
    { id: 16, nama: "POTABEE BARBEQUE 68 GR", harga: 28000, kategori: "Snack", img: "https://down-id.img.susercontent.com/file/sg-11134201-824g9-mepph5cyvgn9c2@resize_w900_nl.webp", desc: "Keripik kentang rasa BBQ yang renyah." },
    { id: 17, nama: "KitKat 45gr", harga: 11000, kategori: "Snack", img: "https://i.pinimg.com/736x/5a/71/84/5a7184e1d347ebbdb920c49ae5c99266.jpg", desc: "Coklat renyah berlapis wafer." },
    { id: 18, nama: "CHEETOS Puffs 60 gr", harga: 21000, kategori: "Snack", img: "https://i.pinimg.com/736x/94/b2/48/94b248e82908bfc2a82a824fcc313356.jpg", desc: "Snack keju yang ringan dan renyah." },
    { id: 19, nama: "Head & Shoulder 350ml", harga: 87000, kategori: "Kebutuhan Mandi", img: "https://i.pinimg.com/1200x/54/7e/12/547e12146ace111fe9d98c2c7598af2a.jpg", desc: "Shampoo anti ketombe cool menthol." },
    { id: 20, nama: "SUNLIGHT BOTOL 750 ML", harga: 49000, kategori: "Kebutuhan Cuci", img: "https://i.pinimg.com/1200x/4c/78/bb/4c78bb6fd632ed391f2ec25769f1b251.jpg", desc: "Sabun cuci piring pemotong lemak." },
    { id: 21, nama: "Pepsodent Action 123 180 GR", harga: 27000, kategori: "Kebutuhan Mandi", img: "https://i.pinimg.com/1200x/34/a8/4d/34a84dac30633b6cff4085bd3f778223.jpg", desc: "Sikat gigi 3 arah bersih maksimal." },
    { id: 22, nama: "SO GOOD TELUR OMEGA3 10S", harga: 34000, kategori: "Produk Segar", img: "https://down-id.img.susercontent.com/file/id-11134275-7rbk2-ma7ysj9nanj5a9@resize_w900_nl.webp", desc: "Telur kaya omega untuk tumbuh kembang." },
    { id: 23, nama: "Smoked Beef Metzger 100gr", harga: 23000, kategori: "Produk Segar", img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSLxvY__qk9kjbgXOHQ5e2CwtDzMZqPDASukce-bu22olpginNVvA1ZOTdOpE78BwC1X7vzTX0wBeq8esRfG0ZYQ-A1xpikOi_-crX6_c7ZSUtt4h0yJAppv5A", desc: "Daging sapi asap halal siap saji." },
    { id: 24, nama: "Telur 1 Kg", harga: 34000, kategori: "Produk Segar", img: "https://via.placeholder.com/150", desc: "Telur ayam segar pilihan per kilogram." }
];

const categories = ["Semua", "Bahan Pokok", "Makanan Instan", "Bumbu Dapur", "Minuman", "Snack", "Kebutuhan Mandi", "Kebutuhan Cuci", "Produk Segar"];
let currentCategory = "Semua";
let cart = JSON.parse(localStorage.getItem("sembako_cart")) || [];

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    badge.innerText = count;
    badge.classList.toggle("hidden", count === 0);
}

function saveCart() {
    localStorage.setItem("sembako_cart", JSON.stringify(cart));
    updateCartBadge();
}

function renderCategories() {
    const container = document.getElementById("categoryList");
    if (!container) return;
    container.innerHTML = categories.map(cat => 
        `<button class="category-chip ${cat === currentCategory ? 'active' : ''}" onclick="filterProduk('${cat}')">${cat}</button>`
    ).join('');
}

function renderProducts(list) {
    const container = document.getElementById("productGrid");
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-msg" style="grid-column: 1/-1;">Produk tidak ditemukan</div>`;
        return;
    }
    container.innerHTML = list.map(p => `
        <div class="card" onclick="goDetail(${p.id})">
            <img src="${p.img}" alt="${p.nama}" class="card-img" loading="lazy">
            <div class="card-content">
                <h4 class="card-title">${p.nama}</h4>
                <p class="card-price">${formatRupiah(p.harga)}</p>
            </div>
        </div>
    `).join('');
}

function filterProduk(kategori) {
    currentCategory = kategori === "Semua" ? "Semua" : kategori;
    renderCategories();
    
    const searchVal = document.getElementById("searchInput")?.value.toLowerCase() || "";
    let filtered = products;
    
    if (currentCategory !== "Semua") {
        filtered = filtered.filter(p => p.kategori.includes(currentCategory));
    }
    if (searchVal) {
        filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchVal));
    }
    
    renderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    const isIndex = window.location.pathname.includes("index.html") || window.location.pathname === "/";
    const isCart = window.location.pathname.includes("keranjang.html");
    const isDetail = window.location.pathname.includes("detailproduk.html");
    const isProfile = window.location.pathname.includes("profile.html");

    if (isIndex) {
        updateCartBadge();
        renderCategories();
        renderProducts(products);
        
        document.getElementById("searchInput")?.addEventListener("input", () => filterProduk(currentCategory));
        
        document.querySelector(".search-box input")?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") filterProduk(currentCategory);
        });
    }

    if (isCart) {
        renderCartPage();
    }

    if (isDetail) {
        renderDetailPage();
    }

    if (isProfile) {
    }
});

function toggleSidebar() {
    document.getElementById("sidebar")?.classList.toggle("active");
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

function goDetail(id) {
    window.location.href = `detailproduk.html?id=${id}`;
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, nama: product.nama, harga: product.harga, img: product.img, qty: 1 });
    }
    saveCart();
    alert(`${product.nama} ditambahkan ke keranjang!`);
}

function renderCartPage() {
    const container = document.getElementById("cartList");
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-msg">Keranjang masih kosong.</div>`;
        document.getElementById("cartSummary")?.classList.add("hidden");
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.nama}">
            <div class="cart-info">
                <div class="cart-title">${item.nama}</div>
                <div class="cart-price">${formatRupiah(item.harga)}</div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    <button class="qty-btn" style="background:#fee2e2; color:#ef4444; border-color:#fca5a5; margin-left:auto;" onclick="removeItem(${item.id})">Hapus</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    document.getElementById("totalPrice").innerText = formatRupiah(total);
    document.getElementById("totalItems").innerText = cart.reduce((acc, i) => acc + i.qty, 0);
}

function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCartPage();
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCartPage();
}

function renderDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));
    const product = products.find(p => p.id === id);
    
    if (!product) {
        document.getElementById("detailContainer").innerHTML = `<div class="empty-msg">Produk tidak ditemukan.</div>`;
        return;
    }

    document.getElementById("detailImg").src = product.img;
    document.getElementById("detailTitle").innerText = product.nama;
    document.getElementById("detailPrice").innerText = formatRupiah(product.harga);
    document.getElementById("detailDesc").innerText = product.desc;
    document.getElementById("addCartBtn").onclick = () => addToCart(product.id);
}

