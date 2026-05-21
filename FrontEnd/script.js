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
    { id: 24, nama: "Snack Buah Strawberry Kering Freeze Dried 1 Kg", harga: 66000, kategori: "Snack", img: "https://i.pinimg.com/1200x/35/31/ee/3531ee7dab3c6f86c5be2d1667e3d578.jpg", desc: "Snack Buah Strawberry Kering Freeze Dried sehat tanpa pengawet pewarna rendah kalori cemilan diet." }
];

const categories = ["Semua", "Bahan Pokok", "Makanan Instan", "Bumbu Dapur", "Minuman", "Snack", "Kebutuhan Mandi", "Kebutuhan Cuci", "Produk Segar"];
let currentCategory = "Semua";
let cart = JSON.parse(localStorage.getItem("sembako_cart")) || [];
let orders = JSON.parse(localStorage.getItem("sembako_orders")) || [];

// ==================== ALAMAT PENGIRIMAN ====================
let address = JSON.parse(localStorage.getItem("sembako_address")) || {
    alamatLengkap: "Jl. Raya Kebon Jeruk No. 45",
    kecamatan: "Kebon Jeruk",
    kota: "Jakarta Barat",
    kodePos: "11530",
    catatan: "Rumah warna hijau, depan ada pohon mangga"
};

// ==================== USER PROFILE ====================
let userProfile = JSON.parse(localStorage.getItem("sembako_user")) || {
    nama: "Moreno",
    email: "moreno@gmail.com",
    telepon: "+62 812-7891-6777",
    foto: "https://i.pravatar.cc/150?img=68",
    password: "123456"
};

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

function saveOrders() {
    localStorage.setItem("sembako_orders", JSON.stringify(orders));
}

function saveAddress() {
    localStorage.setItem("sembako_address", JSON.stringify(address));
}

function saveUserProfile() {
    localStorage.setItem("sembako_user", JSON.stringify(userProfile));
}

// ==================== RENDER & FILTER ====================
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

    if (isIndex) {
        updateCartBadge();
        renderCategories();
        renderProducts(products);
        document.getElementById("searchInput")?.addEventListener("input", () => filterProduk(currentCategory));
    }

    if (isCart) renderCartPage();
    if (isDetail) renderDetailPage();
    if (isDetail) updateCartBadge(); 
    if (isRiwayat) renderOrderHistory();
    if (isProfile) {
        renderAddressDisplay();
        renderUserProfile();
    }
});

// ==================== FUNGSI KERANJANG ====================

function updateQty(id, change) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.qty += change;

    // Jika qty jadi 0 atau kurang, hapus otomatis
    if (item.qty <= 0) {
        removeItem(id);
        return;
    }

    saveCart();
    renderCartPage();   // refresh halaman keranjang
}

function removeItem(id) {
    if (confirm("Hapus barang ini dari keranjang?")) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCartPage();
    }
}

// Fungsi Checkout sudah ada, tapi pastikan tombolnya memanggil fungsi yang benar
function checkout() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    
    const newOrder = {
        id: "ORD-" + Date.now().toString().slice(-8),
        tanggal: new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        items: [...cart],
        total: total,
        status: "Sedang Diproses"
    };

    orders.unshift(newOrder);
    saveOrders();
    cart = [];
    saveCart();
    
    alert(`✅ Pesanan ${newOrder.id} berhasil dibuat!`);
    window.location.href = 'riwayat.html';
}

// ==================== CART & CHECKOUT ====================
function goDetail(id) { window.location.href = `detailproduk.html?id=${id}`; }

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id: product.id, nama: product.nama, harga: product.harga, img: product.img, qty: 1 });
    saveCart();
    alert(`${product.nama} ditambahkan ke keranjang!`);
}

function checkout() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    
    const newOrder = {
        id: "ORD-" + Date.now().toString().slice(-8),
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        status: "Sedang Diproses"
    };

    orders.unshift(newOrder);
    saveOrders();
    cart = [];
    saveCart();
    alert(`✅ Pesanan ${newOrder.id} berhasil dibuat!`);
    window.location.href = 'riwayat.html';
}

// ==================== RIWAYAT PESANAN ====================
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

// ==================== ALAMAT PENGIRIMAN ====================
function renderAddressDisplay() {
    const container = document.getElementById("currentAddress");
    if (!container) return;
    
    container.innerHTML = `
        <strong>${userProfile.nama}</strong><br>
        ${userProfile.telepon}<br>
        ${address.alamatLengkap}<br>
        ${address.kecamatan ? address.kecamatan + ", " : ""}${address.kota} ${address.kodePos}
        ${address.catatan ? `<br><small>${address.catatan}</small>` : ''}
    `;
}

function openAddressModal() {
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

// ==================== PENGATURAN AKUN ====================
function renderUserProfile() {
    const nameEl = document.querySelector(".profile-name");
    const emailEl = document.querySelector(".profile-email");
    const avatarEl = document.querySelector(".avatar");
    if (nameEl) nameEl.textContent = userProfile.nama;
    if (emailEl) emailEl.textContent = userProfile.email;
    if (avatarEl) avatarEl.src = userProfile.foto;
}

function openAccountSettings() {
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

function logout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        alert("👋 Anda telah keluar.");
        window.location.href = "index.html";
    }
}

function toggleSidebar() { document.getElementById("sidebar")?.classList.toggle("active"); }
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// ==================== POP UP PEMBAYARAN ====================
let selectedPaymentMethod = "COD";

function openPaymentModal() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    // Render daftar barang
    const itemsHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.nama} × ${item.qty}</span>
            <span>${formatRupiah(item.harga * item.qty)}</span>
        </div>
    `).join('');
    document.getElementById("orderItems").innerHTML = itemsHTML;

    // Render alamat
    const addrHTML = `
        <strong>${userProfile.nama}</strong><br>
        ${userProfile.telepon}<br>
        ${address.alamatLengkap}<br>
        ${address.kecamatan}, ${address.kota} ${address.kodePos}
        ${address.catatan ? `<br><small>${address.catatan}</small>` : ''}
    `;
    document.getElementById("paymentAddress").innerHTML = addrHTML;

    // Total
    const total = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    document.getElementById("modalTotal").innerText = formatRupiah(total);

    // Render metode pembayaran
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

// ==================== DETAIL RIWAYAT PESANAN ====================
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
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    cart = order.items.map(item => ({...item}));
    saveCart();
    alert("✅ Barang telah dimasukkan ke keranjang!");
    window.location.href = 'keranjang.html';
}