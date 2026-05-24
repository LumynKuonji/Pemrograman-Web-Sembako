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
    { id: 24, nama: "Snack Buah Strawberry Kering Freeze Dried 1 Kg", harga: 66000, kategori: "Snack", img: "https://i.pinimg.com/1200x/35/31/ee/3531ee7dab3c6f86c5be2d1667e3d578.jpg", desc: "Snack Buah Strawberry Kering Freeze Dried sehat tanpa pengawet pewarna rendah kalori cemilan diet." },
    { id: 25, nama: "Minyak Goreng Bimoli 2 L", harga: 42000, kategori: "Bahan Pokok", img: "https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f6789012345678abcdef01.jpg", desc: "Minyak goreng berkualitas untuk masak sehari-hari." },
    { id: 26, nama: "Sarden King 155 gr", harga: 18000, kategori: "Makanan Instan", img: "https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6789012345678abcdef0123.jpg", desc: "Ikan sarden dalam saus tomat, praktis dan bergizi." }
];

const MBA_RULES = [
    { id: "paket-beras", nama: "Paket Dapur Lengkap", deskripsi: "Pelanggan yang beli beras sering juga membeli minyak goreng dan sarden.", triggers: [1], recommends: [25, 26], confidence: 0.72 },
    { id: "paket-indomie", nama: "Lengkapi Masakan Instan", deskripsi: "Sering dibeli bersama: bumbu penyedap dan minuman.", triggers: [5, 6, 7, 8, 9], recommends: [11, 13], confidence: 0.65 },
    { id: "paket-teh", nama: "Temani Teh dengan Camilan", deskripsi: "Pelanggan pembeli teh sering menambah snack.", triggers: [13, 14, 15], recommends: [16, 17], confidence: 0.58 },
    { id: "paket-cuci", nama: "Kebutuhan Rumah Tangga", deskripsi: "Sabun cuci piring sering dibeli bersama kebutuhan mandi.", triggers: [20], recommends: [19, 21], confidence: 0.55 }
];
const MBA_DEFAULT_IDS = [1, 25, 26, 5, 13];

const GUEST_PROFILE = {
    nama: "Tamu",
    email: "Belum login — masuk untuk fitur lengkap",
    telepon: "-",
    foto: "https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=7fb8b3"
};

const DEMO_USERS = [
    { email: "moreno@gmail.com", password: "123456", nama: "Moreno", telepon: "+62 812-7891-6777", foto: "https://i.pravatar.cc/150?img=68" }
];

const categories = ["Semua", "Bahan Pokok", "Makanan Instan", "Bumbu Dapur", "Minuman", "Snack", "Kebutuhan Mandi", "Kebutuhan Cuci", "Produk Segar"];
let currentCategory = "Semua";
let cart = JSON.parse(localStorage.getItem("sembako_cart")) || [];
let orders = JSON.parse(localStorage.getItem("sembako_orders")) || [];

let address = JSON.parse(localStorage.getItem("sembako_address")) || {
    alamatLengkap: "Jl. Raya Kebon Jeruk No. 45",
    kecamatan: "Kebon Jeruk",
    kota: "Jakarta Barat",
    kodePos: "11530",
    catatan: "Rumah warna hijau, depan ada pohon mangga"
};

let registeredUsers = JSON.parse(localStorage.getItem("sembako_users")) || DEMO_USERS;
let authSession = JSON.parse(localStorage.getItem("sembako_session"));
let userProfile = JSON.parse(localStorage.getItem("sembako_user")) || { ...DEMO_USERS[0], password: "123456" };

function isLoggedIn() {
    return !!(authSession && authSession.email);
}

function getActiveProfile() {
    if (!isLoggedIn()) return { ...GUEST_PROFILE };
    const u = registeredUsers.find(x => x.email === authSession.email);
    return u ? { nama: u.nama, email: u.email, telepon: u.telepon, foto: u.foto } : { ...GUEST_PROFILE };
}

function requireLogin(message) {
    if (isLoggedIn()) return true;
    const msg = message || "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.";
    if (confirm(msg + "\n\nKe halaman login?")) {
        const returnTo = window.location.pathname.split("/").pop() + window.location.search;
        window.location.href = "login.html?return=" + encodeURIComponent(returnTo);
    }
    return false;
}

function getReturnUrl() {
    const p = new URLSearchParams(window.location.search);
    return p.get("return");
}

function goBackFromLogin() {
    const ret = getReturnUrl();
    window.location.href = ret || "index.html";
}

function handleLogin() {
    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("loginPassword")?.value;
    if (!email || !password) return alert("Email dan password wajib diisi.");
    const user = registeredUsers.find(u => u.email.toLowerCase() === email && u.password === password);
    if (!user) return alert("Email atau password salah.");
    authSession = { email: user.email, loggedInAt: Date.now() };
    userProfile = { ...user, password: user.password };
    localStorage.setItem("sembako_session", JSON.stringify(authSession));
    localStorage.setItem("sembako_user", JSON.stringify(userProfile));
    alert("Selamat datang, " + user.nama + "!");
    window.location.href = getReturnUrl() || "index.html";
}

function doLogout() {
    if (!confirm("Keluar dari akun?")) return;
    authSession = null;
    localStorage.removeItem("sembako_session");
    alert("Anda telah keluar. Mode tamu aktif.");
    window.location.href = "index.html";
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function getCartRecommendations() {
    const cartIds = new Set(cart.map(i => i.id));
    const scored = {};
    const matchedRules = [];
    for (const rule of MBA_RULES) {
        if (!rule.triggers.some(t => cartIds.has(t))) continue;
        matchedRules.push(rule);
        for (const pid of rule.recommends) {
            if (cartIds.has(pid)) continue;
            scored[pid] = (scored[pid] || 0) + rule.confidence;
        }
    }
    if (Object.keys(scored).length === 0) {
        const ids = MBA_DEFAULT_IDS.filter(id => !cartIds.has(id)).slice(0, 6);
        return { mode: "default", rules: [], productIds: ids };
    }
    const productIds = Object.keys(scored).map(Number).sort((a, b) => scored[b] - scored[a]).slice(0, 6);
    return { mode: "mba", rules: matchedRules, productIds };
}

function renderCartRecommendations() {
    const section = document.getElementById("cartRecommendations");
    if (!section) return;
    const { mode, rules, productIds } = getCartRecommendations();
    const recoProducts = productIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (recoProducts.length === 0) {
        section.innerHTML = "";
        return;
    }
    const rulesHTML = rules.length > 0
        ? rules.map(r => `<p class="reco-rule"><strong>${r.nama}:</strong> ${r.deskripsi}</p>`).join("")
        : `<p class="reco-rule">Produk populer yang sering dibeli pelanggan toko sembako.</p>`;
    const title = mode === "mba" ? "Rekomendasi untuk Anda (MBA)" : "Rekomendasi Populer";
    section.innerHTML = `
        <div class="reco-section">
            <h2 class="reco-title">${title}</h2>
            <div class="reco-rules">${rulesHTML}</div>
            <div class="reco-grid">
                ${recoProducts.map(p => `
                    <div class="reco-card">
                        <img src="${p.img}" alt="${p.nama}" onclick="goDetail(${p.id})">
                        <div class="reco-card-body">
                            <div class="reco-name" onclick="goDetail(${p.id})">${p.nama}</div>
                            <div class="reco-price">${formatRupiah(p.harga)}</div>
                            <button class="reco-add-btn" onclick="addToCart(${p.id})">+ Keranjang</button>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>`;
}

function initBottomNav() {
    if (document.getElementById("bottomNav")) return;
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const isActive = (name) => page === name ? "active" : "";
    const loginItem = isLoggedIn()
        ? `<button class="bottom-nav-item" onclick="doLogout()"><span class="nav-icon">🚪</span><span>Logout</span></button>`
        : `<a href="login.html" class="bottom-nav-item ${isActive("login.html")}"><span class="nav-icon">🔑</span><span>Login</span></a>`;
    const nav = document.createElement("nav");
    nav.id = "bottomNav";
    nav.className = "bottom-nav";
    nav.innerHTML = `
        <a href="index.html" class="bottom-nav-item ${isActive("index.html")}"><span class="nav-icon">🏠</span><span>Beranda</span></a>
        <a href="keranjang.html" class="bottom-nav-item ${isActive("keranjang.html")}"><span class="nav-icon">🛒</span><span>Keranjang</span></a>
        <a href="profile.html" class="bottom-nav-item ${isActive("profile.html")}"><span class="nav-icon">👤</span><span>Profil</span></a>
        ${loginItem}`;
    document.body.appendChild(nav);
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

function saveOrders() {
    localStorage.setItem("sembako_orders", JSON.stringify(orders));
}

function saveAddress() {
    localStorage.setItem("sembako_address", JSON.stringify(address));
}

function saveUserProfile() {
    localStorage.setItem("sembako_user", JSON.stringify(userProfile));
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
    if (currentCategory !== "Semua") filtered = filtered.filter(p => p.kategori.includes(currentCategory));
    if (searchVal) filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchVal));
    renderProducts(filtered);
}

function renderCartPage() {
    const container = document.getElementById("cartList");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-msg">Keranjang masih kosong.</div>`;
        document.getElementById("cartSummary")?.classList.add("hidden");
        renderCartRecommendations();
        return;
    }

    container.innerHTML = cart.map(item => `
        <div style="background: white; padding: 16px; border-radius: 12px; box-shadow: var(--shadow); display: flex; gap: 16px;">
            <img src="${item.img}" alt="${item.nama}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
                <div style="font-weight: 600;">${item.nama}</div>
                <div style="color: var(--primary-dark); font-weight: 700;">${formatRupiah(item.harga)}</div>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">–</button>
                    <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    
                    <button onclick="removeItem(${item.id})" 
                            style="margin-left: auto; color: #ef4444; font-weight: 600; background: none; border: none;">
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    document.getElementById("totalPrice").innerText = formatRupiah(total);
    document.getElementById("totalItems").innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    document.getElementById("cartSummary").classList.remove("hidden");
    renderCartRecommendations();
}

function renderDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));
    
    const container = document.getElementById("detailContainer");
    if (!container) return;

    if (!id) {
        container.innerHTML = `<div class="empty-msg">ID produk tidak ditemukan.</div>`;
        return;
    }

    const product = products.find(p => p.id === id);
    
    if (!product) {
        container.innerHTML = `<div class="empty-msg">Produk tidak ditemukan.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="detail-grid">
            <div class="detail-image">
                <img src="${product.img}" alt="${product.nama}">
            </div>
            
            <div class="detail-info">
                <h1 class="detail-title">${product.nama}</h1>
                <p class="detail-price">${formatRupiah(product.harga)}</p>
                <p class="detail-desc">${product.desc}</p>
                
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    🛒 Masukkan Keranjang
                </button>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    const isIndex = window.location.pathname.includes("index.html") || window.location.pathname === "/";
    const isCart = window.location.pathname.includes("keranjang.html");
    const isDetail = window.location.pathname.includes("detailproduk.html");
    const isProfile = window.location.pathname.includes("profile.html");
    const isRiwayat = window.location.pathname.includes("riwayat.html");
    const isLogin = window.location.pathname.includes("login.html");

    initBottomNav();
    updateCartBadge();

    if (isIndex) {
        renderCategories();
        renderProducts(products);
        document.getElementById("searchInput")?.addEventListener("input", () => filterProduk(currentCategory));
    }
    if (isCart) renderCartPage();
    if (isDetail) renderDetailPage();
    if (isRiwayat) renderOrderHistory();
    if (isProfile) {
        renderAddressDisplay();
        renderUserProfile();
        updateProfileGuestUI();
    }
    if (!isLogin && isLoggedIn()) userProfile = { ...registeredUsers.find(u => u.email === authSession.email), password: userProfile.password };
});

function updateQty(id, change) {
    if (!requireLogin("Masuk dulu untuk mengubah keranjang.")) return;
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        removeItem(id);
        return;
    }

    saveCart();
    renderCartPage();
}

function removeItem(id) {
    if (!requireLogin("Masuk dulu untuk mengubah keranjang.")) return;
    if (confirm("Hapus barang ini dari keranjang?")) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCartPage();
    }
}

function goDetail(id) { window.location.href = `detailproduk.html?id=${id}`; }

function addToCart(id) {
    if (!requireLogin("Masuk dulu untuk menambah barang ke keranjang.")) return;
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id: product.id, nama: product.nama, harga: product.harga, img: product.img, qty: 1 });
    saveCart();
    alert(`${product.nama} ditambahkan ke keranjang!`);
}

function renderOrderHistory() {
    const container = document.getElementById("orderList");
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-msg">
                <p>Belum ada riwayat pesanan.</p>
                <button onclick="window.location.href='index.html'" class="btn-primary" style="margin-top: 16px;">
                    Belanja Sekarang
                </button>
            </div>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        const statusClass = order.status.toLowerCase().replace(/\s/g, '-');
        
        return `
            <div class="order-card" onclick="showOrderDetail('${order.id}')">
                <div class="order-header">
                    <div>
                        <strong>${order.id}</strong><br>
                        <small>${order.tanggal}</small>
                    </div>
                    <span class="status ${statusClass}">${order.status}</span>
                </div>
                
                <div class="order-items">
                    ${order.items.slice(0, 2).map(item => `
                        <div class="order-item-small">
                            <span>${item.nama} × ${item.qty}</span>
                            <span>${formatRupiah(item.harga * item.qty)}</span>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `<small>+${order.items.length - 2} barang lainnya</small>` : ''}
                </div>
                
                <div class="order-total">
                    Total: <strong>${formatRupiah(order.total)}</strong>
                </div>
                
                <button onclick="event.stopImmediatePropagation(); buyAgain('${order.id}');" class="btn-buy-again">
                    🛒 Beli Lagi
                </button>
            </div>
        `;
    }).join('');
}

function renderAddressDisplay() {
    const container = document.getElementById("currentAddress");
    if (!container) return;
    const profile = getActiveProfile();
    if (!isLoggedIn()) {
        container.innerHTML = `<em>Masuk ke akun untuk mengatur alamat pengiriman.</em>`;
        return;
    }
    container.innerHTML = `
        <strong>${profile.nama}</strong><br>
        ${profile.telepon}<br>
        ${address.alamatLengkap}<br>
        ${address.kecamatan ? address.kecamatan + ", " : ""}${address.kota} ${address.kodePos}
        ${address.catatan ? `<br><small>${address.catatan}</small>` : ''}
    `;
}

function openAddressModal() {
    if (!requireLogin("Masuk dulu untuk mengatur alamat pengiriman.")) return;
    document.getElementById("addr_alamat").value = address.alamatLengkap || "";
    document.getElementById("addr_kecamatan").value = address.kecamatan || "";
    document.getElementById("addr_kota").value = address.kota || "";
    document.getElementById("addr_kodepos").value = address.kodePos || "";
    document.getElementById("addr_catatan").value = address.catatan || "";
    document.getElementById("addressModal").style.display = "flex";
}

function closeAddressModal() {
    document.getElementById("addressModal").style.display = "none";
}

function saveAddressFromForm() {
    const newAddress = {
        alamatLengkap: document.getElementById("addr_alamat").value.trim(),
        kecamatan: document.getElementById("addr_kecamatan").value.trim(),
        kota: document.getElementById("addr_kota").value.trim(),
        kodePos: document.getElementById("addr_kodepos").value.trim(),
        catatan: document.getElementById("addr_catatan").value.trim()
    };

    if (!newAddress.alamatLengkap || !newAddress.kota || !newAddress.kodePos) {
        alert("Mohon isi Alamat Lengkap, Kota, dan Kode Pos!");
        return;
    }

    address = newAddress;
    saveAddress();
    renderAddressDisplay();
    closeAddressModal();
    alert("✅ Alamat pengiriman berhasil diperbarui!");
}

function renderUserProfile() {
    const profile = getActiveProfile();
    const nameEl = document.querySelector(".profile-name");
    const emailEl = document.querySelector(".profile-email");
    const avatarEl = document.querySelector(".avatar");
    if (nameEl) nameEl.textContent = profile.nama;
    if (emailEl) emailEl.textContent = profile.email;
    if (avatarEl) avatarEl.src = profile.foto;
}

function updateProfileGuestUI() {
    const banner = document.getElementById("guestBanner");
    const settingsItem = document.getElementById("settingsMenuItem");
    const addressItem = document.getElementById("addressMenuItem");
    if (banner) banner.style.display = isLoggedIn() ? "none" : "block";
    if (settingsItem) settingsItem.style.display = isLoggedIn() ? "block" : "none";
    if (addressItem) addressItem.style.opacity = isLoggedIn() ? "1" : "0.5";
}

function openAccountSettings() {
    if (!requireLogin("Masuk dulu untuk mengubah pengaturan akun.")) return;
    document.getElementById("accountModal").style.display = "flex";
    document.getElementById("user_nama").value = userProfile.nama;
    document.getElementById("user_email").value = userProfile.email;
    document.getElementById("user_telepon").value = userProfile.telepon;
    document.getElementById("previewFoto").src = userProfile.foto;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("previewFoto").src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveAccountSettings() {
    const newNama = document.getElementById("user_nama").value.trim();
    const newEmail = document.getElementById("user_email").value.trim();
    const newTelepon = document.getElementById("user_telepon").value.trim();
    const newFoto = document.getElementById("previewFoto").src;

    if (!newNama || !newEmail) {
        alert("Nama dan Email tidak boleh kosong!");
        return;
    }

    userProfile.nama = newNama;
    userProfile.email = newEmail;
    userProfile.telepon = newTelepon;
    userProfile.foto = newFoto;

    const idx = registeredUsers.findIndex(u => u.email === authSession?.email);
    if (idx >= 0) {
        registeredUsers[idx] = { ...registeredUsers[idx], nama: newNama, email: newEmail, telepon: newTelepon, foto: newFoto };
        localStorage.setItem("sembako_users", JSON.stringify(registeredUsers));
        if (authSession) authSession.email = newEmail;
        localStorage.setItem("sembako_session", JSON.stringify(authSession));
    }
    saveUserProfile();
    renderUserProfile();
    closeAccountModal();
    alert("✅ Data akun berhasil diperbarui!");
}

function changePassword() {
    const currentPass = document.getElementById("current_password").value;
    const newPass = document.getElementById("new_password").value;
    const confirmPass = document.getElementById("confirm_password").value;

    if (currentPass !== userProfile.password) return alert("❌ Password saat ini salah!");
    if (newPass.length < 6) return alert("Password baru minimal 6 karakter!");
    if (newPass !== confirmPass) return alert("❌ Password baru dan konfirmasi tidak cocok!");

    userProfile.password = newPass;
    saveUserProfile();
    document.getElementById("current_password").value = "";
    document.getElementById("new_password").value = "";
    document.getElementById("confirm_password").value = "";
    alert("✅ Password berhasil diubah!");
}

function closeAccountModal() {
    document.getElementById("accountModal").style.display = "none";
}

function logout() { doLogout(); }

function toggleSidebar() { document.getElementById("sidebar")?.classList.toggle("active"); }
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

let selectedPaymentMethod = "COD";

function openPaymentModal() {
    if (!requireLogin("Masuk dulu untuk checkout.")) return;
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    const itemsHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.nama} × ${item.qty}</span>
            <span>${formatRupiah(item.harga * item.qty)}</span>
        </div>
    `).join('');
    document.getElementById("orderItems").innerHTML = itemsHTML;

    // Render alamat
    const profile = getActiveProfile();
    const addrHTML = `
        <strong>${profile.nama}</strong><br>
        ${profile.telepon}<br>
        ${address.alamatLengkap}<br>
        ${address.kecamatan}, ${address.kota} ${address.kodePos}
        ${address.catatan ? `<br><small>${address.catatan}</small>` : ''}
    `;
    document.getElementById("paymentAddress").innerHTML = addrHTML;

    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    document.getElementById("modalTotal").innerText = formatRupiah(total);

    renderPaymentMethods();

    document.getElementById("paymentModal").style.display = "flex";
}

function renderPaymentMethods() {
    const methods = [
        { id: "COD", name: "Cash on Delivery (COD)", icon: "💵" },
        { id: "BCA", name: "Transfer BCA", icon: "🏦" },
        { id: "MANDIRI", name: "Transfer Mandiri", icon: "🏦" },
        { id: "DANA", name: "DANA", icon: "📱" },
        { id: "GOPAY", name: "GoPay", icon: "📱" },
    ];

    const container = document.getElementById("paymentMethods");
    container.innerHTML = methods.map(m => `
        <div class="payment-option ${m.id === selectedPaymentMethod ? 'selected' : ''}" 
             onclick="selectPayment('${m.id}')">
            <span style="font-size: 24px;">${m.icon}</span>
            <span>${m.name}</span>
        </div>
    `).join('');
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    renderPaymentMethods();
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

function confirmPayment() {
    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    
    const newOrder = {
        id: "ORD-" + Date.now().toString().slice(-8),
        tanggal: new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'long', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }),
        items: [...cart],
        total: total,
        status: "Sedang Diproses",
        paymentMethod: selectedPaymentMethod
    };

    orders.unshift(newOrder);
    saveOrders();
    cart = [];
    saveCart();

    closePaymentModal();
    alert(`✅ Pembayaran berhasil!\nNomor Pesanan: ${newOrder.id}\nMetode: ${selectedPaymentMethod}`);
    window.location.href = 'riwayat.html';
}

function showOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const content = document.getElementById("orderDetailContent");
    
    let itemsHTML = order.items.map(item => `
        <div class="order-item">
            <span>${item.nama} × ${item.qty}</span>
            <span>${formatRupiah(item.harga * item.qty)}</span>
        </div>
    `).join('');

    content.innerHTML = `
        <div style="padding: 10px 0;">
            <p><strong>Tanggal:</strong> ${order.tanggal}</p>
            <p><strong>Status:</strong> <span class="status ${order.status.toLowerCase().replace(/\s/g, '-')}">${order.status}</span></p>
            <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod || 'COD'}</p>
            
            <h3 style="margin: 20px 0 10px;">Daftar Barang</h3>
            <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                ${itemsHTML}
            </div>
            
            <div style="margin-top: 20px; text-align:right; font-size:18px; font-weight:700;">
                Total: ${formatRupiah(order.total)}
            </div>
        </div>
    `;

    document.getElementById("modalOrderId").textContent = `#${order.id}`;
    document.getElementById("orderDetailModal").style.display = "flex";
}

function closeOrderDetail() {
    document.getElementById("orderDetailModal").style.display = "none";
}

function buyAgain(orderId) {
    if (!requireLogin("Masuk dulu untuk membeli lagi.")) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    cart = order.items.map(item => ({...item}));
    saveCart();
    alert("✅ Barang telah dimasukkan ke keranjang!");
    window.location.href = 'keranjang.html';
}