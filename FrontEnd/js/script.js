const products = [
  {
    id: 1,
    nama: "Beras Fortune 5 KG",
    harga: 96000,
    kategori: "Bahan Pokok",
    img: "https://down-id.img.susercontent.com/file/8395b675db848bddc30455bd25ea6541@resize_w900_nl.webp",
    desc: "Beras pulen kualitas premium, cocok untuk keluarga besar.",
  },
  {
    id: 2,
    nama: "GULAKU 1KG",
    harga: 18000,
    kategori: "Bahan Pokok",
    img: "https://i.pinimg.com/736x/f7/92/69/f79269dae0c36b6f54f9af5dc9dccf4b.jpg",
    desc: "Gula pasir putih berkualitas, manis alami.",
  },
  {
    id: 3,
    nama: "Gula Halus Rose Brand 500 GR",
    harga: 14000,
    kategori: "Bahan Pokok",
    img: "https://i.pinimg.com/1200x/e6/6b/a1/e66ba14e4ca583029af940a0517fc314.jpg",
    desc: "Gula halus lembut untuk kue dan minuman.",
  },
  {
    id: 4,
    nama: "Tepung Segitiga Biru 1KG",
    harga: 16000,
    kategori: "Bahan Pokok",
    img: "https://i.pinimg.com/736x/57/7b/05/577b05da5c698a257d0b1680dec4840f.jpg",
    desc: "Tepung serbaguna untuk gorengan dan baking.",
  },
  {
    id: 5,
    nama: "Indomie Goreng 1 dus",
    harga: 137500,
    kategori: "Makanan Instan",
    img: "https://i.pinimg.com/1200x/39/f9/79/39f97924e0ccefe5865900356a9d336b.jpg",
    desc: "Indomie goreng favorit keluarga, isi 40 bungkus.",
  },
  {
    id: 6,
    nama: "Indomie Soto Mie 1 dus",
    harga: 140500,
    kategori: "Makanan Instan",
    img: "https://i.pinimg.com/1200x/f2/12/12/f2121200e80b301688d31d1763f40d1a.jpg",
    desc: "Rasa kuah soto yang gurih dan segar.",
  },
  {
    id: 7,
    nama: "Indomie Ayam Bawang 1 dus",
    harga: 125000,
    kategori: "Makanan Instan",
    img: "https://i.pinimg.com/1200x/58/ee/94/58ee946df496b196e19602b5acfec46b.jpg",
    desc: "Cita rasa bawang yang harum dan khas.",
  },
  {
    id: 8,
    nama: "Mie Sedap Goreng 1 dus",
    harga: 140000,
    kategori: "Makanan Instan",
    img: "https://i.pinimg.com/1200x/23/db/35/23db35506192154250286ccea47a7a15.jpg",
    desc: "Mie goreng dengan bumbu kaya rempah.",
  },
  {
    id: 9,
    nama: "Indomie Ayam Geprek 1 dus",
    harga: 143500,
    kategori: "Makanan Instan",
    img: "https://i.pinimg.com/736x/56/bb/26/56bb260308f663879bf8034b4b01d2b8.jpg",
    desc: "Pedas nikmat ala ayam geprek.",
  },
  {
    id: 10,
    nama: "Garam Kapal 250 Gr",
    harga: 3000,
    kategori: "Bumbu Dapur",
    img: "https://i.pinimg.com/1200x/34/15/5a/34155ad4cb58371c1a59d8d482b78f80.jpg",
    desc: "Garam meja halus untuk masakan sehari-hari.",
  },
  {
    id: 11,
    nama: "Masako Ayam 11 Gr (6 Sachet)",
    harga: 13000,
    kategori: "Bumbu Dapur",
    img: "https://i.pinimg.com/1200x/4f/6d/72/4f6d728d69bbb59f928afb68e15f6592.jpg",
    desc: "Penyedap rasa ayam praktis.",
  },
  {
    id: 12,
    nama: "Royco Sapi (12 Sachet)",
    harga: 15000,
    kategori: "Bumbu Dapur",
    img: "https://i.pinimg.com/736x/fe/a0/a8/fea0a8a998a10a3a2e2cb40c00b2a9af.jpg",
    desc: "Bumbu penyedap sapi berkualitas.",
  },
  {
    id: 13,
    nama: "Teh Kotak Jasmine 200 Ml",
    harga: 4000,
    kategori: "Minuman",
    img: "https://i.pinimg.com/1200x/9f/25/d2/9f25d257a6c644a182cbe026a5eecd84.jpg",
    desc: "Teh melati segar dalam kemasan kotak.",
  },
  {
    id: 14,
    nama: "Teh Pucuk Harum 350 Ml",
    harga: 3500,
    kategori: "Minuman",
    img: "https://i.pinimg.com/1200x/ae/9e/55/ae9e55c743331663f05f42407271d04a.jpg",
    desc: "Teh hijau pucuk terbaik, segar dan sehat.",
  },
  {
    id: 15,
    nama: "FRUIT TEA Apple 350ML",
    harga: 4000,
    kategori: "Minuman",
    img: "https://i.pinimg.com/1200x/4e/37/4d/4e374dc7e88a804fee0e79e5d209c74e.jpg",
    desc: "Teh rasa apel yang menyegarkan.",
  },
  {
    id: 16,
    nama: "POTABEE BARBEQUE 68 GR",
    harga: 28000,
    kategori: "Snack",
    img: "https://down-id.img.susercontent.com/file/sg-11134201-824g9-mepph5cyvgn9c2@resize_w900_nl.webp",
    desc: "Keripik kentang rasa BBQ yang renyah.",
  },
  {
    id: 17,
    nama: "KitKat 45gr",
    harga: 11000,
    kategori: "Snack",
    img: "https://i.pinimg.com/736x/5a/71/84/5a7184e1d347ebbdb920c49ae5c99266.jpg",
    desc: "Coklat renyah berlapis wafer.",
  },
  {
    id: 18,
    nama: "CHEETOS Puffs 60 gr",
    harga: 21000,
    kategori: "Snack",
    img: "https://i.pinimg.com/736x/94/b2/48/94b248e82908bfc2a82a824fcc313356.jpg",
    desc: "Snack keju yang ringan dan renyah.",
  },
  {
    id: 19,
    nama: "Head & Shoulder 350ml",
    harga: 87000,
    kategori: "Kebutuhan Mandi",
    img: "https://i.pinimg.com/1200x/54/7e/12/547e12146ace111fe9d98c2c7598af2a.jpg",
    desc: "Shampoo anti ketombe cool menthol.",
  },
  {
    id: 20,
    nama: "SUNLIGHT BOTOL 750 ML",
    harga: 49000,
    kategori: "Kebutuhan Cuci",
    img: "https://i.pinimg.com/1200x/4c/78/bb/4c78bb6fd632ed391f2ec25769f1b251.jpg",
    desc: "Sabun cuci piring pemotong lemak.",
  },
  {
    id: 21,
    nama: "Pepsodent Action 123 180 GR",
    harga: 27000,
    kategori: "Kebutuhan Mandi",
    img: "https://i.pinimg.com/1200x/34/a8/4d/34a84dac30633b6cff4085bd3f778223.jpg",
    desc: "Sikat gigi 3 arah bersih maksimal.",
  },
  {
    id: 22,
    nama: "SO GOOD TELUR OMEGA3 10S",
    harga: 34000,
    kategori: "Produk Segar",
    img: "https://down-id.img.susercontent.com/file/id-11134275-7rbk2-ma7ysj9nanj5a9@resize_w900_nl.webp",
    desc: "Telur kaya omega untuk tumbuh kembang.",
  },
  {
    id: 23,
    nama: "Smoked Beef Metzger 100gr",
    harga: 23000,
    kategori: "Produk Segar",
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSLxvY__qk9kjbgXOHQ5e2CwtDzMZqPDASukce-bu22olpginNVvA1ZOTdOpE78BwC1X7vzTX0wBeq8esRfG0ZYQ-A1xpikOi_-crX6_c7ZSUtt4h0yJAppv5A",
    desc: "Daging sapi asap halal siap saji.",
  },
  {
    id: 24,
    nama: "Snack Buah Strawberry Kering Freeze Dried 1 Kg",
    harga: 66000,
    kategori: "Snack",
    img: "https://i.pinimg.com/1200x/35/31/ee/3531ee7dab3c6f86c5be2d1667e3d578.jpg",
    desc: "Snack Buah Strawberry Kering Freeze Dried sehat tanpa pengawet pewarna rendah kalori cemilan diet.",
  },
  {
    id: 25,
    nama: "Minyak Goreng Bimoli 2 L",
    harga: 42000,
    kategori: "Bahan Pokok",
    img: "https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f6789012345678abcdef01.jpg",
    desc: "Minyak goreng berkualitas untuk masak sehari-hari.",
  },
  {
    id: 26,
    nama: "Sarden King 155 gr",
    harga: 18000,
    kategori: "Makanan Instan",
    img: "https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6789012345678abcdef0123.jpg",
    desc: "Ikan sarden dalam saus tomat, praktis dan bergizi.",
  },
];

const MBA_RULES = [
  {
    id: "paket-beras",
    nama: "Paket Dapur Lengkap",
    deskripsi:
      "Pelanggan yang beli beras sering juga membeli minyak goreng dan sarden.",
    triggers: [1],
    recommends: [25, 26],
    confidence: 0.72,
  },
  {
    id: "paket-indomie",
    nama: "Lengkapi Masakan Instan",
    deskripsi: "Sering dibeli bersama: bumbu penyedap dan minuman.",
    triggers: [5, 6, 7, 8, 9],
    recommends: [11, 13],
    confidence: 0.65,
  },
  {
    id: "paket-teh",
    nama: "Temani Teh dengan Camilan",
    deskripsi: "Pelanggan pembeli teh sering menambah snack.",
    triggers: [13, 14, 15],
    recommends: [16, 17],
    confidence: 0.58,
  },
  {
    id: "paket-cuci",
    nama: "Kebutuhan Rumah Tangga",
    deskripsi: "Sabun cuci piring sering dibeli bersama kebutuhan mandi.",
    triggers: [20],
    recommends: [19, 21],
    confidence: 0.55,
  },
];
const MBA_DEFAULT_IDS = [1, 25, 26, 5, 13];

const GUEST_PROFILE = {
  nama: "Tamu",
  email: "Belum login — masuk untuk fitur lengkap",
  telepon: "-",
  foto: "https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=7fb8b3",
};

const API_BASE = "http://127.0.0.1:5000/api";
const API_LABEL = "Server Toko Sembako";

function _buildPopupOverlay(content) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = content;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  return overlay;
}

function getPopupIcon(type = "info", danger = false) {
  return danger || type === "error" || type === "warn" ? "×" : "✓";
}

function showPopup({
  type = "info",
  title,
  message,
  btnText = "Oke",
  onClose,
} = {}) {
  return AppAlert.show({ type, title, message, btnText, onClose });
}

function showConfirm({
  type = "warn",
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  danger = false,
  onConfirm,
  onCancel,
} = {}) {
  return AppAlert.confirm({
    type,
    title,
    message,
    confirmText,
    cancelText,
    danger,
    onConfirm,
    onCancel,
  });
}

function showCartPopup(product, qty = 1) {
  return Swal.fire({
    title: "",
    html: `
      <div class="swal-custom-container">
        <div class="swal-custom-icon cart-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h3 class="swal-custom-title-text">Berhasil Ditambahkan!</h3>
        <p class="swal-custom-desc">
          <strong>${product.nama}</strong> (${qty} pcs) telah dimasukkan ke keranjang.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Lihat Keranjang",
    cancelButtonText: "Lanjut Belanja",
    timer: undefined,
    timerProgressBar: false,
    scrollbarPadding: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "custom-swal-popup-premium",
      actions: "custom-swal-actions-premium",
      confirmButton: "custom-swal-confirm-premium",
      cancelButton: "custom-swal-cancel-premium",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "keranjang.html";
    }
  });
}

function showLoginPopup(nama, isOffline = false, onDone) {
  AppAlert.toast(`Berhasil masuk sebagai ${nama}.`, "top-end", 2500).then(
    () => {
      onDone?.();
    },
  );
}

const DEMO_USERS = [
  {
    email: "moreno@gmail.com",
    password: "123456",
    nama: "Moreno",
    telepon: "+62 812-7891-6777",
    foto: "https://i.pravatar.cc/150?img=68",
  },
];

const categories = [
  "Semua",
  "Bahan Pokok",
  "Makanan Instan",
  "Bumbu Dapur",
  "Minuman",
  "Snack",
  "Kebutuhan Mandi",
  "Kebutuhan Cuci",
  "Produk Segar",
];
let currentCategory = "Semua";
let cart = JSON.parse(localStorage.getItem("sembako_cart")) || [];
let orders = JSON.parse(localStorage.getItem("sembako_orders")) || [];
let isCheckoutSubmitting = false;

let address = JSON.parse(localStorage.getItem("sembako_address")) || {
  alamatLengkap: "Jl. Raya Kebon Jeruk No. 45",
  kecamatan: "Kebon Jeruk",
  kota: "Jakarta Barat",
  kodePos: "11530",
  catatan: "Rumah warna hijau, depan ada pohon mangga",
};

let registeredUsers =
  JSON.parse(localStorage.getItem("sembako_users")) || DEMO_USERS;
let authSession = JSON.parse(localStorage.getItem("sembako_session"));
let userProfile = JSON.parse(localStorage.getItem("sembako_user")) || {
  ...DEMO_USERS[0],
  password: "123456",
};

function isLoggedIn() {
  return !!(authSession && authSession.email);
}

function getAuthToken() {
  return authSession?.token || null;
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && path !== "/auth/login") {
      localStorage.removeItem("sembako_session");
      authSession = null;
      showPopup({
        type: "error",
        title: "Sesi Berakhir",
        message:
          "Sesi login Anda telah berakhir atau tidak valid. Silakan login kembali.",
        onClose: () => {
          window.location.href = "login.html";
        },
      });
      return {
        ok: false,
        status: 401,
        data: { error: "Sesi login telah berakhir." },
      };
    }

    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: {
        error:
          "Server tidak dapat dihubungi. Pastikan Flask berjalan (python run.py).",
      },
    };
  }
}

function setAuthSession(user, token) {
  authSession = {
    email: user.email,
    token: token || null,
    userId: user.id,
    loggedInAt: Date.now(),
  };
  userProfile = { ...user, password: userProfile?.password };
  localStorage.setItem("sembako_session", JSON.stringify(authSession));
  localStorage.setItem("sembako_user", JSON.stringify(userProfile));
  const idx = registeredUsers.findIndex((u) => u.email === user.email);
  const entry = {
    email: user.email,
    password: userProfile.password || "",
    nama: user.nama,
    telepon: user.telepon,
    foto: user.foto,
  };
  if (idx >= 0) registeredUsers[idx] = entry;
  else registeredUsers.push(entry);
  localStorage.setItem("sembako_users", JSON.stringify(registeredUsers));
}

function getActiveProfile() {
  if (!isLoggedIn()) return { ...GUEST_PROFILE };
  const u = registeredUsers.find((x) => x.email === authSession.email);
  return u
    ? { nama: u.nama, email: u.email, telepon: u.telepon, foto: u.foto }
    : { ...GUEST_PROFILE };
}

function requireLogin(message, onConfirm, onCancel) {
  if (isLoggedIn()) return true;
  const msg =
    message || "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.";
  showConfirm({
    type: "login",
    title: "Login Diperlukan",
    message: msg + "<br><br>Mau masuk ke halaman login sekarang?",
    confirmText: "Ya, Masuk",
    cancelText: "Nanti Saja",
    onConfirm: () => {
      if (typeof onConfirm === "function") {
        onConfirm();
      } else {
        const returnTo =
          window.location.pathname.split("/").pop() + window.location.search;
        window.location.href =
          "login.html?return=" + encodeURIComponent(returnTo);
      }
    },
    onCancel: () => {
      if (typeof onCancel === "function") onCancel();
    },
  });
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

async function handleLogin() {
  const email = document
    .getElementById("loginEmail")
    ?.value.trim()
    .toLowerCase();
  const password = document.getElementById("loginPassword")?.value;
  if (!email || !password) {
    showPopup({
      type: "warn",
      title: "Isian Belum Lengkap",
      message: "Email dan password wajib diisi sebelum masuk.",
    });
    return;
  }

  const api = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (api.ok && api.data.user) {
    setAuthSession(api.data.user, api.data.token);
    window.updateChatbotLock?.();
    showLoginPopup(api.data.user.nama, false, () => {
      window.location.href = getReturnUrl() || "index.html";
    });
    return;
  }

  const user = registeredUsers.find(
    (u) => u.email.toLowerCase() === email && u.password === password,
  );
  if (!user) {
    showPopup({
      type: "error",
      title: "Login Gagal",
      message:
        api.data.error ||
        "Email atau password yang kamu masukkan salah. Coba lagi ya!",
    });
    return;
  }
  setAuthSession(user, null);
  userProfile.password = user.password;
  saveUserProfile();
  window.updateChatbotLock?.();
  showLoginPopup(user.nama, true, () => {
    window.location.href = getReturnUrl() || "index.html";
  });
}

async function handleRegister() {
  const nama = document.getElementById("reg_nama")?.value.trim();
  const email = document
    .getElementById("reg_email")
    ?.value.trim()
    .toLowerCase();
  const telepon = document.getElementById("reg_telepon")?.value.trim();
  const password = document.getElementById("reg_password")?.value;
  const confirmVal = document.getElementById("reg_confirm")?.value;
  if (!nama || !email || !password) {
    showPopup({
      type: "warn",
      title: "Isian Belum Lengkap",
      message: "Nama, email, dan password wajib diisi.",
    });
    return;
  }
  if (password.length < 6) {
    showPopup({
      type: "warn",
      title: "Password Terlalu Pendek",
      message: "Password minimal 6 karakter ya.",
    });
    return;
  }
  if (password !== confirmVal) {
    showPopup({
      type: "error",
      title: "Password Tidak Cocok",
      message: "Konfirmasi password tidak sesuai. Silakan coba lagi.",
    });
    return;
  }

  const api = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ nama, email, password, telepon }),
  });
  if (!api.ok) {
    if (api.status === 0 && registeredUsers.some((u) => u.email === email)) {
      showPopup({
        type: "error",
        title: "Email Sudah Terdaftar",
        message: "Email ini sudah dipakai. Coba masuk atau gunakan email lain.",
      });
      return;
    }
    showPopup({
      type: "error",
      title: "Registrasi Gagal",
      message:
        api.data.error || "Terjadi kesalahan saat mendaftar. Coba lagi nanti.",
    });
    return;
  }

  const loginRes = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (loginRes.ok && loginRes.data.user) {
    setAuthSession(loginRes.data.user, loginRes.data.token);
    showLoginPopup(loginRes.data.user.nama, false, () => {
      window.location.href = "index.html";
    });
    return;
  }
  showPopup({
    type: "success",
    title: "Registrasi Berhasil!",
    message: "Akun kamu sudah dibuat. Silakan masuk untuk mulai belanja.",
    onClose: () => {
      window.location.href = "login.html";
    },
  });
}

async function doLogout() {
  showConfirm({
    type: "warn",
    title: "Keluar dari Akun?",
    message: "Anda akan keluar dari sesi saat ini",
    confirmText: "Keluar",
    cancelText: "Batal",
    danger: true,
    onConfirm: async () => {
      const token = getAuthToken();
      if (token) await apiFetch("/auth/logout", { method: "POST" });
      authSession = null;
      localStorage.removeItem("sembako_session");
      cart = [];
      saveCart();
      window.updateChatbotLock?.();
      AppAlert.toast("Berhasil keluar dari akun.", "top-end", 2500).then(() => {
        window.location.href = "index.html";
      });
    },
  });
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function getCartRecommendations() {
  const cartIds = new Set(cart.map((i) => i.id));
  const scored = {};
  const matchedRules = [];
  for (const rule of MBA_RULES) {
    if (!rule.triggers.some((t) => cartIds.has(t))) continue;
    matchedRules.push(rule);
    for (const pid of rule.recommends) {
      if (cartIds.has(pid)) continue;
      scored[pid] = (scored[pid] || 0) + rule.confidence;
    }
  }
  if (Object.keys(scored).length === 0) {
    const ids = MBA_DEFAULT_IDS.filter((id) => !cartIds.has(id)).slice(0, 6);
    return { mode: "default", rules: [], productIds: ids };
  }
  const productIds = Object.keys(scored)
    .map(Number)
    .sort((a, b) => scored[b] - scored[a])
    .slice(0, 6);
  return { mode: "mba", rules: matchedRules, productIds };
}

function renderCartRecommendations() {
  const section = document.getElementById("cartRecommendations");
  if (!section) return;
  const { mode, rules, productIds } = getCartRecommendations();
  const recoProducts = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);
  if (recoProducts.length === 0) {
    section.innerHTML = "";
    return;
  }
  const rulesHTML =
    rules.length > 0
      ? rules
          .map(
            (r) =>
              `<p class="reco-rule"><strong>${r.nama}:</strong> ${r.deskripsi}</p>`,
          )
          .join("")
      : `<p class="reco-rule">Produk populer yang sering dibeli pelanggan toko sembako.</p>`;
  const title =
    mode === "mba" ? "Rekomendasi untuk Anda" : "Rekomendasi Populer";
  section.innerHTML = `
        <div class="reco-section">
            <h2 class="reco-title">${title}</h2>
            <div class="reco-rules">${rulesHTML}</div>
            <div class="reco-grid">
                ${recoProducts
                  .map(
                    (p) => `
                    <div class="reco-card">
                        <div class="card-img-placeholder" onclick="goDetail(${p.id})" style="cursor: pointer; border-bottom: none;">
                            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" class="placeholder-icon">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div class="reco-card-body">
                            <div class="reco-name" onclick="goDetail(${p.id})">${p.nama}</div>
                            <div class="reco-price">${formatRupiah(p.harga)}</div>
                            <button class="reco-add-btn" onclick="addToCart(${p.id})">+ Keranjang</button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>`;
}

function initHeaderAuth() {
  const container = document.querySelector(".header-icons");
  if (!container || document.getElementById("headerAuthBtn")) return;
  if (isLoggedIn()) {
    container.insertAdjacentHTML(
      "beforeend",
      `<button type="button" id="headerAuthBtn" class="header-auth-btn" onclick="doLogout()" title="Keluar">Keluar</button>`,
    );
  } else {
    container.insertAdjacentHTML(
      "beforeend",
      `<a href="login.html" id="headerAuthBtn" class="header-auth-btn" title="Masuk">Masuk</a>`,
    );
  }
}

function initSiteFooter() {
  if (document.getElementById("siteFooter")) return;
  const year = new Date().getFullYear();
  const authFooterLink = isLoggedIn()
    ? `<button type="button" class="site-footer-link-btn" onclick="doLogout()">Keluar</button>`
    : `<a href="login.html">Masuk</a>`;

  const footer = document.createElement("footer");
  footer.id = "siteFooter";
  footer.className = "site-footer";
  footer.innerHTML = `
        <div class="site-footer-inner">
            <div class="site-footer-grid">
                <div class="site-footer-brand">
                    <div class="site-footer-logo">TOKO SEMBAKO</div>
                    <p>Belanja kebutuhan pokok harian dengan mudah. Browsing tanpa login, checkout setelah masuk akun.</p>
                </div>
                <div class="site-footer-col">
                    <h4>Navigasi</h4>
                    <ul>
                        <li><a href="index.html">Beranda</a></li>
                        <li><a href="keranjang.html">Keranjang</a></li>
                        <li><a href="profile.html">Profil</a></li>
                        <li><a href="riwayat.html">Riwayat Pesanan</a></li>
                    </ul>
                </div>
                <div class="site-footer-col">
                    <h4>Akun</h4>
                    <ul>
                        <li>${authFooterLink}</li>
                        <li><a href="register.html">Daftar</a></li>
                        <li><a href="login.html">Masuk</a></li>
                    </ul>
                </div>
                <div class="site-footer-col">
                    <h4>Bantuan</h4>
                    <ul>
                        <li><a href="index.html">Customer Service</a></li>
                        <li><span>moreno@gmail.com</span></li>
                        <li><span>+62 812-7891-6777</span></li>
                        <li><span>Senin–Minggu, 08:00–20:00</span></li>
                    </ul>
                </div>
            </div>
            <div class="site-footer-bottom">
                <span>&copy; ${year} Toko Sembako. Semua hak dilindungi.</span>
            </div>
        </div>`;
  document.body.appendChild(footer);
}

function initSiteChrome() {
  initSiteFooter();
  initHeaderAuth();
  loadChatbotWidget();
}

function loadChatbotWidget() {
  if (window.initChatbot) {
    window.initChatbot();
    return;
  }
  const existing = document.querySelector('script[data-chatbot="1"]');
  if (existing) return;
  const s = document.createElement("script");
  s.src = "js/chatbot.js";
  s.dataset.chatbot = "1";
  s.onload = () => {
    window.initChatbot?.();
    window.updateChatbotLock?.();
  };
  document.body.appendChild(s);
}

function updateCartBadge() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.innerText = count;
    badge.classList.toggle("hidden", count === 0);
  }
  const headerCount = document.getElementById("cartHeaderCount");
  if (headerCount) {
    headerCount.textContent =
      count === 0 ? "Keranjang kosong" : `${count} item di keranjang`;
    headerCount.classList.toggle("has-items", count > 0);
  }
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
  container.innerHTML = categories
    .map(
      (cat) =>
        `<button class="category-chip ${cat === currentCategory ? "active" : ""}" onclick="filterProduk('${cat}')">${cat}</button>`,
    )
    .join("");
}

function renderProducts(list) {
  const container = document.getElementById("productGrid");
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-msg" style="grid-column: 1/-1;">Produk tidak ditemukan</div>`;
    return;
  }
  container.innerHTML = list
    .map(
      (p) => `
        <div class="card" onclick="goDetail(${p.id})">
            <div class="card-img-placeholder">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" class="placeholder-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
            <div class="card-content">
                <h4 class="card-title">${p.nama}</h4>
                <p class="card-price">${formatRupiah(p.harga)}</p>
            </div>
        </div>
    `,
    )
    .join("");
}

function filterProduk(kategori) {
  currentCategory = kategori === "Semua" ? "Semua" : kategori;
  renderCategories();
  const searchVal =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  let filtered = products;
  if (currentCategory !== "Semua")
    filtered = filtered.filter((p) => p.kategori.includes(currentCategory));
  if (searchVal)
    filtered = filtered.filter((p) => p.nama.toLowerCase().includes(searchVal));
  renderProducts(filtered);
}

function renderCartPage() {
  const container = document.getElementById("cartList");
  if (!container) return;

  const cardContainer = document.getElementById("cartCardContainer");
  const emptyMsg = document.getElementById("cartEmptyMsg");

  if (cart.length === 0) {
    if (cardContainer) cardContainer.classList.add("hidden");
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    renderCartRecommendations();
    return;
  }

  if (cardContainer) cardContainer.classList.remove("hidden");
  if (emptyMsg) emptyMsg.classList.add("hidden");

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="card-img-placeholder" style="width: 70px; height: 70px; border-radius: 8px; border-bottom: none; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" class="placeholder-icon" style="width: 20px; height: 20px;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nama}</div>
                    <div class="cart-item-price">${formatRupiah(item.harga)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">–</button>
                        <span style="font-weight: 600; min-width: 24px; text-align: center; font-size: 14px;">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                    <button onclick="removeItem(${item.id})" class="cart-item-remove-btn">
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");

  const total = cart.reduce((acc, item) => acc + item.harga * item.qty, 0);
  document.getElementById("totalPrice").innerText = formatRupiah(total);
  document.getElementById("totalItems").innerText = cart.reduce(
    (acc, i) => acc + i.qty,
    0,
  );
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

  const product = products.find((p) => p.id === id);

  if (!product) {
    container.innerHTML = `<div class="empty-msg">Produk tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = `
        <div class="detail-grid">
            <div class="detail-image">
                <div class="card-img-placeholder" style="border-radius: 12px; height: 100%; min-height: 300px; border-bottom: none;">
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" class="placeholder-icon" style="width: 48px; height: 48px;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>
            </div>

            <div class="detail-info">
                <h1 class="detail-title">${product.nama}</h1>
                <p class="detail-price">${formatRupiah(product.harga)}</p>
                <p class="detail-desc">${product.desc}</p>

                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Masukkan Keranjang
                </button>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
  const isIndex =
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/";
  const isCart = window.location.pathname.includes("keranjang.html");
  const isDetail = window.location.pathname.includes("detailproduk.html");
  const isProfile = window.location.pathname.includes("profile.html");
  const isRiwayat = window.location.pathname.includes("riwayat.html");
  const isLogin = window.location.pathname.includes("login.html");
  const isCheckout = window.location.pathname.includes("checkout.html");

  initSiteChrome();
  updateCartBadge();

  if (isLoggedIn()) {
    fetchCartFromServer();
  }

  if (isIndex) {
    renderCategories();
    renderProducts(products);
    document
      .getElementById("searchInput")
      ?.addEventListener("input", () => filterProduk(currentCategory));
  }
  if (isCart) renderCartPage();
  if (isDetail) renderDetailPage();
  if (isRiwayat) renderOrderHistory();
  if (isCheckout) renderCheckoutPage();
  if (isProfile) {
    renderAddressDisplay();
    renderUserProfile();
    updateProfileGuestUI();
  }
  if (!isLogin && isLoggedIn())
    userProfile = {
      ...registeredUsers.find((u) => u.email === authSession.email),
      password: userProfile.password,
    };
});

async function fetchCartFromServer() {
  if (!isLoggedIn()) return;
  const api = await apiFetch("/cart");
  if (api.ok && api.data && Array.isArray(api.data.items)) {
    const serverItems = api.data.items;

    if (serverItems.length === 0 && cart.length > 0) {
      for (const localItem of cart) {
        await apiFetch("/cart", {
          method: "POST",
          body: JSON.stringify({ produk_id: localItem.id, qty: localItem.qty }),
        });
      }

      const refetch = await apiFetch("/cart");
      if (refetch.ok && refetch.data && Array.isArray(refetch.data.items)) {
        cart = refetch.data.items.map((item) => ({
          id: item.id,
          nama: item.nama,
          harga: item.harga,
          img: item.img,
          qty: item.qty,
        }));
      }
    } else {
      cart = serverItems.map((item) => ({
        id: item.id,
        nama: item.nama,
        harga: item.harga,
        img: item.img,
        qty: item.qty,
      }));
    }

    saveCart();
    if (document.getElementById("cartList")) {
      renderCartPage();
    }
    if (window.location.pathname.includes("checkout.html")) {
      renderCheckoutPage();
    }
  }
}

async function updateQty(id, change) {
  if (!requireLogin("Masuk dulu untuk mengubah keranjang.")) return;
  const item = cart.find((item) => item.id === id);
  if (!item) return;

  const newQty = item.qty + change;
  if (newQty <= 0) {
    removeItem(id);
    return;
  }

  item.qty = newQty;
  saveCart();
  renderCartPage();

  const api = await apiFetch(`/cart/${id}`, {
    method: "PUT",
    body: JSON.stringify({ qty: newQty }),
  });
  if (!api.ok && api.status !== 0 && api.status !== 401) {
    showPopup({
      title: "Gagal Mengubah Keranjang",
      message:
        api.data?.error || "Server tidak dapat memperbarui jumlah barang.",
    });

    item.qty -= change;
    saveCart();
    renderCartPage();
  }
}

function removeItem(id) {
  if (!requireLogin("Masuk dulu untuk mengubah keranjang.")) return;
  const item = cart.find((i) => i.id === id);
  showConfirm({
    type: "cart",
    title: "Hapus dari Keranjang?",
    message: `<strong>${item?.nama || "Barang ini"}</strong> akan dihapus dari keranjang kamu.`,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    danger: true,
    onConfirm: async () => {
      const originalCart = [...cart];
      cart = cart.filter((i) => i.id !== id);
      saveCart();
      renderCartPage();

      const api = await apiFetch(`/cart/${id}`, {
        method: "PUT",
        body: JSON.stringify({ qty: 0 }),
      });
      if (!api.ok && api.status !== 0 && api.status !== 401) {
        showPopup({
          title: "Gagal Menghapus Barang",
          message:
            api.data?.error ||
            "Server tidak dapat menghapus barang dari database.",
        });
        cart = originalCart;
        saveCart();
        renderCartPage();
      }
    },
  });
}

function goDetail(id) {
  window.location.href = `detailproduk.html?id=${id}`;
}

function showCartToast(productName) {
  let toast = document.getElementById("cartToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cartToast";
    toast.className = "cart-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="cart-toast-icon">✓</span> <span>${productName} ditambahkan!</span>`;
  toast.classList.add("show");
  clearTimeout(showCartToast._timer);
  showCartToast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

async function addToCart(id) {
  if (!requireLogin("Masuk dulu untuk menambah barang ke keranjang.")) return;
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const api = await apiFetch("/cart", {
    method: "POST",
    body: JSON.stringify({ produk_id: id, qty: 1 }),
  });

  if (!api.ok && api.status !== 0 && api.status !== 401) {
    showPopup({
      title: "Gagal Menyimpan Keranjang",
      message:
        api.data?.error || "Server belum bisa menyimpan barang ke database.",
    });
    return;
  }

  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      img: product.img,
      qty: 1,
    });
  }
  saveCart();

  const cartItem = cart.find((i) => i.id === id);
  showCartPopup(product, cartItem?.qty || 1);

  if (document.getElementById("cartList")) {
    renderCartPage();
    const cartList = document.getElementById("cartList");
    cartList.classList.add("cart-list-updated");
    setTimeout(() => cartList.classList.remove("cart-list-updated"), 700);
    cartList.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
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

  container.innerHTML = orders
    .map((order) => {
      const statusClass = order.status.toLowerCase().replace(/\s/g, "-");

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
                    ${order.items
                      .slice(0, 2)
                      .map(
                        (item) => `
                        <div class="order-item-small">
                            <span>${item.nama} × ${item.qty}</span>
                            <span>${formatRupiah(item.harga * item.qty)}</span>
                        </div>
                    `,
                      )
                      .join("")}
                    ${order.items.length > 2 ? `<small>+${order.items.length - 2} barang lainnya</small>` : ""}
                </div>

                <div class="order-total">
                    Total: <strong>${formatRupiah(order.total)}</strong>
                </div>

                <button onclick="event.stopImmediatePropagation(); buyAgain('${order.id}');" class="btn-buy-again">
                    Beli Lagi
                </button>
            </div>
        `;
    })
    .join("");
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
        ${address.catatan ? `<br><small>${address.catatan}</small>` : ""}
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
    catatan: document.getElementById("addr_catatan").value.trim(),
  };

  if (!newAddress.alamatLengkap || !newAddress.kota || !newAddress.kodePos) {
    showPopup({
      type: "warn",
      title: "Data Belum Lengkap",
      message: "Mohon isi Alamat Lengkap, Kota, dan Kode Pos terlebih dahulu.",
    });
    return;
  }

  address = newAddress;
  saveAddress();
  renderAddressDisplay();
  closeAddressModal();
  showPopup({
    type: "success",
    title: "Alamat Diperbarui!",
    message: `Alamat pengiriman ke <strong>${newAddress.kota}</strong> berhasil disimpan.`,
  });
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
  if (settingsItem) settingsItem.style.display = isLoggedIn() ? "flex" : "none";
  if (addressItem) addressItem.style.opacity = isLoggedIn() ? "1" : "0.5";
}

function openAccountSettings() {
  if (!requireLogin("Masuk dulu untuk mengubah pengaturan akun.")) return;
  document.getElementById("accountModal").style.display = "flex";
  document.getElementById("user_nama").value = userProfile.nama;
  document.getElementById("user_email").value = userProfile.email;
  document.getElementById("user_telepon").value = userProfile.telepon;
  document.getElementById("previewFoto").src = userProfile.foto;

  const firstTabBtn = document.querySelector(".settings-tabs .tab-btn");
  if (firstTabBtn) switchSettingsTab("profile", firstTabBtn);
}

function switchSettingsTab(tabName, btn) {
  document
    .querySelectorAll(".settings-tab-content")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));

  const contentEl = document.getElementById(`settings-${tabName}-tab`);
  if (contentEl) contentEl.classList.add("active");
  if (btn) btn.classList.add("active");
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
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
    showPopup({
      type: "warn",
      title: "Data Tidak Lengkap",
      message: "Nama dan Email tidak boleh kosong.",
    });
    return;
  }

  userProfile.nama = newNama;
  userProfile.email = newEmail;
  userProfile.telepon = newTelepon;
  userProfile.foto = newFoto;

  const idx = registeredUsers.findIndex((u) => u.email === authSession?.email);
  if (idx >= 0) {
    registeredUsers[idx] = {
      ...registeredUsers[idx],
      nama: newNama,
      email: newEmail,
      telepon: newTelepon,
      foto: newFoto,
    };
    localStorage.setItem("sembako_users", JSON.stringify(registeredUsers));
    if (authSession) authSession.email = newEmail;
    localStorage.setItem("sembako_session", JSON.stringify(authSession));
  }
  saveUserProfile();
  renderUserProfile();
  closeAccountModal();
  showPopup({
    type: "success",
    title: "Akun Diperbarui!",
    message: `Data akun <strong>${newNama}</strong> berhasil disimpan.`,
  });
}

function changePassword() {
  const currentPass = document.getElementById("current_password").value;
  const newPass = document.getElementById("new_password").value;
  const confirmPass = document.getElementById("confirm_password").value;

  if (currentPass !== userProfile.password) {
    showPopup({
      type: "error",
      title: "Password Salah",
      message: "Password saat ini yang kamu masukkan tidak sesuai.",
    });
    return;
  }
  if (newPass.length < 6) {
    showPopup({
      type: "warn",
      title: "Password Terlalu Pendek",
      message: "Password baru minimal 6 karakter.",
    });
    return;
  }
  if (newPass !== confirmPass) {
    showPopup({
      type: "error",
      title: "Password Tidak Cocok",
      message: "Password baru dan konfirmasi tidak sesuai.",
    });
    return;
  }

  userProfile.password = newPass;
  saveUserProfile();
  document.getElementById("current_password").value = "";
  document.getElementById("new_password").value = "";
  document.getElementById("confirm_password").value = "";
  showPopup({
    type: "success",
    title: "Password Diperbarui!",
    message: "Password kamu berhasil diganti. Jaga kerahasiaannya ya!",
  });
}

function closeAccountModal() {
  document.getElementById("accountModal").style.display = "none";
}

function logout() {
  doLogout();
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("active");
}
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

let selectedPaymentMethod = "COD";
let selectedShippingMethod = "REG";

const SHIPPING_METHODS = [
  { id: "HEMAT", name: "Hemat", eta: "3-5 hari", cost: 8000 },
  { id: "REG", name: "Reguler", eta: "1-3 hari", cost: 12000 },
  { id: "INSTAN", name: "Instan", eta: "Hari ini", cost: 22000 },
];

function getCartSubtotal() {
  return cart.reduce((acc, item) => acc + item.harga * item.qty, 0);
}

function getSelectedShipping() {
  return (
    SHIPPING_METHODS.find((method) => method.id === selectedShippingMethod) ||
    SHIPPING_METHODS[1]
  );
}

function updatePaymentTotals() {
  const subtotal = getCartSubtotal();
  const shipping = getSelectedShipping();
  const total = subtotal + shipping.cost;

  const subtotalEl = document.getElementById("modalSubtotal");
  const shippingCostEl = document.getElementById("modalShippingCost");
  const totalEl = document.getElementById("modalTotal");

  if (subtotalEl) subtotalEl.innerText = formatRupiah(subtotal);
  if (shippingCostEl) shippingCostEl.innerText = formatRupiah(shipping.cost);
  if (totalEl) totalEl.innerText = formatRupiah(total);
}

function proceedToCheckout() {
  if (!requireLogin("Masuk dulu untuk checkout.")) return;
  if (cart.length === 0) {
    return;
  }
  window.location.href = "checkout.html";
}

function renderCheckoutPage() {
  if (!isLoggedIn()) {
    requireLogin("Masuk dulu untuk checkout.", null, () => {
      window.location.href = "keranjang.html";
    });
    return;
  }
  if (cart.length === 0) {
    if (!isCheckoutSubmitting) window.location.href = "keranjang.html";
    return;
  }

  const itemsHTML = cart
    .map(
      (item) => `
        <div class="order-item" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
            <div class="order-item-img-placeholder">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" class="placeholder-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
            <div style="flex-grow: 1;">
                <div style="font-size: 13.5px; font-weight: 500; color: var(--text);">${item.nama}</div>
                <div style="font-size: 12px; color: var(--text-light); margin-top: 2px;">${item.qty} x ${formatRupiah(item.harga)}</div>
            </div>
            <span style="font-size: 13.5px; font-weight: 500; color: var(--text);">${formatRupiah(item.harga * item.qty)}</span>
        </div>
    `,
    )
    .join("");
  const orderItemsEl = document.getElementById("orderItems");
  if (orderItemsEl) orderItemsEl.innerHTML = itemsHTML;

  const profile = getActiveProfile();
  const addrHTML = `
        <strong>${profile.nama}</strong><br>
        ${profile.telepon}<br>
        ${address.alamatLengkap}<br>
        ${address.kecamatan}, ${address.kota} ${address.kodePos}
        ${address.catatan ? `<br><small>${address.catatan}</small>` : ""}
    `;
  const paymentAddressEl = document.getElementById("paymentAddress");
  if (paymentAddressEl) paymentAddressEl.innerHTML = addrHTML;

  renderShippingMethods();
  renderPaymentMethods();
  updatePaymentTotals();
}

function renderShippingMethods() {
  const container = document.getElementById("shippingMethods");
  if (!container) return;

  container.innerHTML = SHIPPING_METHODS.map(
    (method) => `
        <div class="shipping-option ${method.id === selectedShippingMethod ? "selected" : ""}"
             onclick="selectShipping('${method.id}')">
            <div>
                <strong>${method.name}</strong>
                <small>Tiba ${method.eta}</small>
            </div>
            <span>${formatRupiah(method.cost)}</span>
        </div>
    `,
  ).join("");
}

function selectShipping(method) {
  selectedShippingMethod = method;
  renderShippingMethods();
  updatePaymentTotals();
}

function renderPaymentMethods() {
  const methods = [
    { id: "COD", name: "Cash on Delivery (COD)" },
    { id: "EWALLET", name: "E-Wallet (GoPay, OVO, DANA)" },
    { id: "TRANSFER", name: "Transfer Bank (BCA, Mandiri, BRI)" },
  ];

  const container = document.getElementById("paymentMethods");
  if (!container) return;
  container.innerHTML = methods
    .map(
      (m) => `
        <div class="payment-option ${m.id === selectedPaymentMethod ? "selected" : ""}"
             onclick="selectPayment('${m.id}')">
            <span>${m.name}</span>
        </div>
    `,
    )
    .join("");
}

function selectPayment(method) {
  selectedPaymentMethod = method;
  renderPaymentMethods();
}

function closePaymentModal() {
  const modalEl = document.getElementById("paymentModal");
  if (modalEl) modalEl.style.display = "none";
}

async function confirmPayment() {
  if (isCheckoutSubmitting) return;
  if (cart.length === 0) {
    window.location.href = "keranjang.html";
    return;
  }

  isCheckoutSubmitting = true;
  const payBtn = document.querySelector(".pay-btn");
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = "Memproses...";
  }

  const subtotal = getCartSubtotal();
  const shipping = getSelectedShipping();
  const total = subtotal + shipping.cost;
  const checkout = await apiFetch("/orders/checkout", {
    method: "POST",
    body: JSON.stringify({
      metode_bayar: selectedPaymentMethod,
      ongkir: shipping.cost,
      alamat: address,
    }),
  });

  if (!checkout.ok && checkout.status !== 0 && checkout.status !== 401) {
    isCheckoutSubmitting = false;
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Bayar Sekarang";
    }
    showPopup({
      type: "error",
      title: "Checkout Gagal",
      message:
        checkout.data?.error || "Pesanan belum berhasil disimpan ke database.",
    });
    return;
  }

  const newOrder = {
    id: checkout.data.order?.id || "ORD-" + Date.now().toString().slice(-8),
    tanggal: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    items: [...cart],
    total: total,
    subtotal: subtotal,
    shippingMethod: shipping.id,
    shippingName: shipping.name,
    shippingEta: shipping.eta,
    shippingCost: shipping.cost,
    status: "Sedang Diproses",
    paymentMethod: selectedPaymentMethod,
  };

  orders.unshift(newOrder);
  saveOrders();
  cart = [];
  saveCart();

  closePaymentModal();
  const methodLabels = {
    COD: "Cash on Delivery (COD)",
    EWALLET: "E-Wallet",
    TRANSFER: "Transfer Bank",
  };
  Swal.fire({
    title: "",
    html: `
      <div class="swal-custom-container">
        <div class="swal-custom-icon order-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 class="swal-custom-title-text">Pesanan Berhasil!</h3>
        <p class="swal-custom-desc-sub">Terima kasih atas belanjaan Anda. Pesanan Anda telah diterima dan sedang diproses.</p>
        
        <div class="receipt-box">
          <div class="receipt-row">
            <span class="receipt-label">ID Pesanan</span>
            <strong class="receipt-value highlighted">${newOrder.id}</strong>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Metode Bayar</span>
            <span class="receipt-value">${methodLabels[selectedPaymentMethod] || selectedPaymentMethod}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Pengiriman</span>
            <span class="receipt-value">${shipping.name}</span>
          </div>
          <div class="receipt-row total-row">
            <span class="receipt-label">Total Bayar</span>
            <strong class="receipt-value price">${formatRupiah(total)}</strong>
          </div>
        </div>
      </div>
    `,
    confirmButtonText: "Lihat Riwayat",
    showCloseButton: false,
    timer: undefined,
    timerProgressBar: false,
    scrollbarPadding: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: true,
    customClass: {
      popup: "custom-swal-popup-premium",
      actions: "custom-swal-actions-premium",
      confirmButton: "custom-swal-confirm-premium full-width",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "riwayat.html";
    }
  });
}

function showOrderDetail(orderId) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  const content = document.getElementById("orderDetailContent");

  let itemsHTML = order.items
    .map(
      (item, idx) => `
        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; ${
          idx < order.items.length - 1
            ? "border-bottom: 1px solid #e2e8f0;"
            : ""
        }">
            <div style="flex-grow: 1;">
                <div style="font-size: 13.5px; font-weight: 500; color: var(--text);">${item.nama}</div>
                <div style="font-size: 12px; color: var(--text-light); margin-top: 2px;">${item.qty} x ${formatRupiah(item.harga)}</div>
            </div>
            <span style="font-size: 13.5px; font-weight: 600; color: var(--text); margin-left: 16px;">${formatRupiah(item.harga * item.qty)}</span>
        </div>
    `,
    )
    .join("");

  content.innerHTML = `
        <div style="padding: 10px 0;">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px 16px; font-size: 13.5px; line-height: 1.5; color: var(--text); margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed #e2e8f0;">
                <span style="color: var(--text-light);">Tanggal</span>
                <span style="font-weight: 500;">${order.tanggal}</span>

                <span style="color: var(--text-light);">Status</span>
                <div><span class="status ${order.status.toLowerCase().replace(/\s/g, "-")}" style="padding: 4px 12px; font-size: 12px; font-weight: 600; border-radius: 20px; display: inline-block;">${order.status}</span></div>

                <span style="color: var(--text-light);">Pembayaran</span>
                <span style="font-weight: 500;">${order.paymentMethod || "COD"}</span>

                <span style="color: var(--text-light);">Pengiriman</span>
                <span style="font-weight: 500;">${order.shippingName || "Reguler"}${order.shippingEta ? ` (${order.shippingEta})` : ""}</span>
            </div>

            <h3 style="margin: 0 0 12px; font-size: 14.5px; font-weight: 700; color: var(--text);">Daftar Barang</h3>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 0 16px; border-radius: 10px; margin-bottom: 20px;">
                ${itemsHTML}
            </div>

            <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; font-size: 13.5px;">
                <div style="display: flex; justify-content: space-between; width: 100%; max-width: 240px; color: var(--text-light);">
                    <span>Subtotal</span>
                    <span style="font-weight: 500; color: var(--text);">${formatRupiah(order.subtotal || Math.max((order.total || 0) - (order.shippingCost || 0), 0))}</span>
                </div>
                <div style="display: flex; justify-content: space-between; width: 100%; max-width: 240px; color: var(--text-light);">
                    <span>Ongkos Kirim</span>
                    <span style="font-weight: 500; color: var(--text);">${formatRupiah(order.shippingCost || 0)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; width: 100%; max-width: 240px; font-size: 15px; font-weight: 700; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 4px;">
                    <span>Total</span>
                    <span style="color: var(--primary-dark);">${formatRupiah(order.total)}</span>
                </div>
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
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  cart = order.items.map((item) => ({ ...item }));
  saveCart();
  showPopup({
    type: "cart",
    title: "Keranjang Diisi Ulang!",
    message: `${order.items.length} produk dari pesanan <strong>${order.id}</strong> sudah masuk ke keranjang.`,
    btnText: "Lihat Keranjang",
    onClose: () => {
      window.location.href = "keranjang.html";
    },
  });
}
