let products = [];

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

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><circle cx='12' cy='12' r='12' fill='%23f1f5f9'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%2394a3b8'/></svg>";

const GUEST_PROFILE = {
  nama: "Tamu",
  email: "Belum login — masuk untuk fitur lengkap",
  telepon: "-",
  foto: DEFAULT_AVATAR,
};

const API_BASE = "https://pemrograman-web-sembako-production.up.railway.app/api";
const API_ROOT = API_BASE.replace(/\/api$/, "");

function resolveImgUrl(img) {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
  if (img.startsWith("/")) return API_ROOT + img;
  return API_ROOT + "/" + img;
}
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
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
    customClass: {
      popup: "custom-swal-popup",
      confirmButton: "",
      cancelButton: "",
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
    foto: DEFAULT_AVATAR,
  },
];

let categories = [
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
let orders = [];
let isCheckoutSubmitting = false;

let address = JSON.parse(localStorage.getItem("sembako_address")) || {
  alamatLengkap: "",
  kecamatan: "",
  kota: "",
  kodePos: "",
  catatan: "",
};

let registeredUsers =
  JSON.parse(localStorage.getItem("sembako_users")) || DEMO_USERS;
let authSession = JSON.parse(localStorage.getItem("sembako_session"));
let userProfile = JSON.parse(localStorage.getItem("sembako_user")) || {
  nama: "",
  email: "",
  telepon: "",
  foto: DEFAULT_AVATAR,
};
let profileCropper = null;

function isLoggedIn() {
  return !!(authSession && authSession.email);
}

function getAuthToken() {
  return authSession?.token || null;
}

function getOrderStorageKey() {
  if (!authSession?.email && !authSession?.userId) return "sembako_orders_guest";
  return `sembako_orders_${authSession.userId || authSession.email}`;
}

function loadCachedOrders() {
  orders = JSON.parse(localStorage.getItem(getOrderStorageKey())) || [];
  return orders;
}

function normalizeServerOrder(order) {
  return {
    ...order,
    tanggal: order.tanggal
      ? new Date(order.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    items: (order.items || []).map((item) => ({
      id: item.id || item.produk_id,
      produk_id: item.produk_id || item.id,
      nama: item.nama,
      harga: item.harga,
      qty: item.qty,
      img: item.img,
    })),
  };
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
  // Jika user adalah admin, simpan juga session admin
  if (user.is_admin) {
    localStorage.setItem("sembako_admin_session", JSON.stringify({
      token: token,
      email: user.email,
      nama: user.nama,
      isAdmin: true
    }));
  }

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

let otpTimer = null;
let currentLoginTab = 'password';

function startOTPLimit(btnId, seconds = 60) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = true;
  let remaining = seconds;
  btn.textContent = `Kirim Ulang (${remaining}s)`;
  
  if (otpTimer) clearInterval(otpTimer);
  
  otpTimer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(otpTimer);
      btn.disabled = false;
      btn.textContent = "Kirim Kode OTP";
    } else {
      btn.textContent = `Kirim Ulang (${remaining}s)`;
    }
  }, 1000);
}

function switchLoginTab(mode) {
  currentLoginTab = mode;
  const tabPassword = document.getElementById('tabPassword');
  const tabOTP = document.getElementById('tabOTP');
  const passwordSection = document.getElementById('passwordSection');
  const otpSection = document.getElementById('otpSection');
  
  if (!tabPassword || !tabOTP) return;
  
  if (mode === 'password') {
    tabPassword.classList.add('active');
    tabPassword.style.borderBottom = '2px solid #10b981';
    tabPassword.style.color = '#10b981';
    tabOTP.classList.remove('active');
    tabOTP.style.borderBottom = 'none';
    tabOTP.style.color = '#718096';
    passwordSection.style.display = 'block';
    otpSection.style.display = 'none';
  } else {
    tabOTP.classList.add('active');
    tabOTP.style.borderBottom = '2px solid #10b981';
    tabOTP.style.color = '#10b981';
    tabPassword.classList.remove('active');
    tabPassword.style.borderBottom = 'none';
    tabPassword.style.color = '#718096';
    passwordSection.style.display = 'none';
    otpSection.style.display = 'block';
  }
}

async function requestLoginOTP() {
  const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
  if (!email) {
    showPopup({
      type: 'warn',
      title: 'Email Kosong',
      message: 'Masukkan email Anda terlebih dahulu.'
    });
    return;
  }
  
  const btn = document.getElementById('btnRequestOTP');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Mengirim...';
  }
  
  const api = await apiFetch('/auth/request-login-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  
  if (api.ok) {
    AppAlert.toast("OTP Login telah dikirim ke email Anda", "top-end", 2500);
    startOTPLimit('btnRequestOTP', 60);
  } else {
    showPopup({
      type: 'error',
      title: 'Gagal Kirim OTP',
      message: api.data.error || 'Gagal mengirim OTP login.'
    });
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Kirim Kode OTP';
    }
  }
}

async function submitLogin() {
  if (currentLoginTab === 'password') {
    await handleLogin();
  } else {
    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const code = document.getElementById('loginOTP')?.value.trim();
    if (!email || !code) {
      showPopup({
        type: 'warn',
        title: 'Isian Belum Lengkap',
        message: 'Email dan Kode OTP wajib diisi.'
      });
      return;
    }
    if (code.length !== 6) {
      showPopup({
        type: 'warn',
        title: 'OTP Tidak Valid',
        message: 'Kode OTP harus berupa 6 digit angka.'
      });
      return;
    }
    
    const api = await apiFetch('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    
    if (api.ok && api.data.user) {
      setAuthSession(api.data.user, api.data.token);
      window.updateChatbotLock?.();
      showLoginPopup(api.data.user.nama, false, () => {
        window.location.href = getReturnUrl() || "index.html";
      });
    } else {
      showPopup({
        type: 'error',
        title: 'Masuk Gagal',
        message: api.data.error || 'Kode OTP salah atau telah kedaluwarsa.'
      });
    }
  }
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
      if (api.data.user.is_admin) {
        window.location.href = "../Admin/index.html";
      } else {
        window.location.href = getReturnUrl() || "index.html";
      }
    });
    return;
  }

  if (api.status === 403 || (api.data && api.data.status === "unverified")) {
    showPopup({
      type: "warn",
      title: "Verifikasi Diperlukan",
      message: "Akun Anda belum terverifikasi. Kami telah mengirimkan kode OTP verifikasi ke email Anda.",
      onClose: () => {
        showOTPVerificationModal(email, getReturnUrl() || "index.html");
      }
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

  showPopup({
    type: "success",
    title: "Registrasi Berhasil!",
    message: "Silakan masukkan kode OTP yang dikirim ke email Anda untuk memverifikasi akun.",
    onClose: () => {
      showOTPVerificationModal(email, "index.html");
    }
  });
}

function showOTPVerificationModal(email, returnUrl = 'index.html') {
  Swal.fire({
    title: 'Verifikasi Akun Anda',
    html: 
      `<p style="font-size: 14px; color: #4a5568; margin-bottom: 15px;">Kami telah mengirimkan 6 digit kode OTP ke email <strong>${email}</strong>. Masukkan kode tersebut untuk memverifikasi akun Anda:</p>` +
      '<input id="swal-otp" class="swal2-input" placeholder="000000" maxlength="6" style="text-align:center; letter-spacing: 5px; font-weight:bold; font-size: 24px; max-width: 220px; margin: 15px auto;">' +
      '<div style="margin-top: 15px;"><button type="button" id="swal-resend-btn" style="background:none;border:none;padding:0;color:#5a8f8a;font-weight:600;font-size:14px;cursor:pointer">Kirim Ulang OTP</button></div>' +
      '<div id="swal-otp-message" style="margin-top: 10px; font-size: 13px; font-weight: 500; min-height: 18px;"></div>',
    confirmButtonText: 'Verifikasi Akun',
    allowOutsideClick: false,
    showCancelButton: true,
    cancelButtonText: 'Batal',
    customClass: {
      popup: "custom-swal-popup",
      title: "custom-swal-title",
      htmlContainer: "custom-swal-html",
      closeButton: "custom-swal-close-btn",
    },
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
    didOpen: () => {
      const resendBtn = document.getElementById('swal-resend-btn');
      resendBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        resendBtn.style.pointerEvents = 'none';
        resendBtn.style.color = '#718096';
        resendBtn.textContent = 'Mengirim...';
        const res = await apiFetch('/auth/resend-otp', {
          method: 'POST',
          body: JSON.stringify({ email, otp_type: 'register' })
        });
        const messageEl = document.getElementById('swal-otp-message');
        if (res.ok) {
          if (messageEl) {
            messageEl.style.color = '#10b981';
            messageEl.textContent = 'OTP Baru berhasil dikirim!';
            setTimeout(() => {
              if (messageEl.textContent === 'OTP Baru berhasil dikirim!') {
                messageEl.textContent = '';
              }
            }, 4000);
          }
          let count = 30;
          resendBtn.textContent = `Kirim Ulang (${count}s)`;
          const interval = setInterval(() => {
            count--;
            if (count <= 0) {
              clearInterval(interval);
              resendBtn.style.pointerEvents = 'auto';
              resendBtn.style.color = '#5a8f8a';
              resendBtn.textContent = 'Kirim Ulang OTP';
            } else {
              resendBtn.textContent = `Kirim Ulang (${count}s)`;
            }
          }, 1000);
        } else {
          if (messageEl) {
            messageEl.style.color = '#ef4444';
            messageEl.textContent = res.data.error || 'Gagal kirim ulang OTP';
            setTimeout(() => {
              if (messageEl.textContent === (res.data.error || 'Gagal kirim ulang OTP')) {
                messageEl.textContent = '';
              }
            }, 4000);
          }
          resendBtn.style.pointerEvents = 'auto';
          resendBtn.style.color = '#5a8f8a';
          resendBtn.textContent = 'Kirim Ulang OTP';
        }
      });
    },
    preConfirm: () => {
      const otp = document.getElementById('swal-otp').value.trim();
      if (!otp || otp.length !== 6) {
        Swal.showValidationMessage('Masukkan 6 digit kode OTP yang valid');
        return false;
      }
      return otp;
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const otp = result.value;
      Swal.fire({
        title: 'Memverifikasi...',
        allowOutsideClick: false,
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
        },
        showClass: {
          popup: "animate-custom-show",
        },
        hideClass: {
          popup: "animate-custom-hide",
        },
        didOpen: () => { Swal.showLoading(); }
      });
      const verifyRes = await apiFetch('/auth/verify-register', {
        method: 'POST',
        body: JSON.stringify({ email, code: otp })
      });
      if (verifyRes.ok && verifyRes.data.user) {
        setAuthSession(verifyRes.data.user, verifyRes.data.token);
        Swal.fire({
          icon: 'success',
          title: 'Verifikasi Berhasil!',
          text: 'Akun Anda aktif dan Anda berhasil masuk.',
          customClass: {
            popup: "custom-swal-popup",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-html",
            closeButton: "custom-swal-close-btn",
          },
          showClass: {
            popup: "animate-custom-show",
          },
          hideClass: {
            popup: "animate-custom-hide",
          },
        }).then(() => {
          window.location.href = returnUrl;
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Verifikasi Gagal',
          text: verifyRes.data.error || 'Kode OTP salah atau kedaluwarsa.',
          confirmButtonText: 'Coba Lagi',
          customClass: {
            popup: "custom-swal-popup",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-html",
            closeButton: "custom-swal-close-btn",
          },
          showClass: {
            popup: "animate-custom-show",
          },
          hideClass: {
            popup: "animate-custom-hide",
          },
        }).then(() => {
          showOTPVerificationModal(email, returnUrl);
        });
      }
    }
  });
}

async function handleForgotPassword() {
  const { value: email } = await Swal.fire({
    title: 'Lupa Password',
    input: 'email',
    inputLabel: 'Masukkan email terdaftar Anda',
    inputPlaceholder: 'contoh: email@anda.com',
    confirmButtonText: 'Kirim OTP',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    customClass: {
      popup: "custom-swal-popup",
      title: "custom-swal-title",
      htmlContainer: "custom-swal-html",
      closeButton: "custom-swal-close-btn",
    },
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
  });

  if (!email) return;

  Swal.fire({
    title: 'Mengirim...',
    allowOutsideClick: false,
    customClass: {
      popup: "custom-swal-popup",
      title: "custom-swal-title",
    },
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const res = await apiFetch('/auth/request-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    showPopup({
      type: 'error',
      title: 'Gagal',
      message: res.data.error || 'Terjadi kesalahan saat meminta OTP reset.'
    });
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: 'Atur Ulang Password',
    html:
      `<p style="font-size:14px;color:#718096;margin-bottom:15px;">Kode OTP telah dikirim ke <strong>${email}</strong></p>` +
      '<input id="reset-otp" class="swal2-input" placeholder="Kode OTP (6 digit)" maxlength="6" style="text-align:center;letter-spacing:3px;">' +
      '<input id="reset-password" type="password" class="swal2-input" placeholder="Password Baru (min 6 karakter)">' +
      '<input id="reset-confirm" type="password" class="swal2-input" placeholder="Ulangi Password Baru">',
    focusConfirm: false,
    confirmButtonText: 'Simpan Password Baru',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    customClass: {
      popup: "custom-swal-popup",
      title: "custom-swal-title",
      htmlContainer: "custom-swal-html",
      closeButton: "custom-swal-close-btn",
    },
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
    preConfirm: () => {
      const code = document.getElementById('reset-otp').value.trim();
      const password = document.getElementById('reset-password').value;
      const confirm = document.getElementById('reset-confirm').value;

      if (!code || code.length !== 6) {
        Swal.showValidationMessage('Masukkan 6 digit kode OTP');
        return false;
      }
      if (!password || password.length < 6) {
        Swal.showValidationMessage('Password minimal 6 karakter');
        return false;
      }
      if (password !== confirm) {
        Swal.showValidationMessage('Konfirmasi password tidak sesuai');
        return false;
      }
      return { code, password };
    }
  });

  if (!formValues) return;

  Swal.fire({
    title: 'Memproses...',
    allowOutsideClick: false,
    customClass: {
      popup: "custom-swal-popup",
      title: "custom-swal-title",
    },
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const resetRes = await apiFetch('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify({
      email,
      code: formValues.code,
      password: formValues.password
    })
  });

  if (resetRes.ok) {
    showPopup({
      type: 'success',
      title: 'Berhasil!',
      message: 'Password Anda berhasil diperbarui. Silakan login menggunakan password baru Anda.'
    });
  } else {
    showPopup({
      type: 'error',
      title: 'Gagal Reset',
      message: resetRes.data.error || 'Gagal mengubah password Anda.'
    });
  }
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
      userProfile = {
        nama: "",
        email: "",
        telepon: "",
        foto: DEFAULT_AVATAR,
      };
      address = {
        alamatLengkap: "",
        kecamatan: "",
        kota: "",
        kodePos: "",
        catatan: "",
      };
      localStorage.removeItem("sembako_session");
      localStorage.removeItem("sembako_admin_session");
      localStorage.removeItem("sembako_user");
      localStorage.removeItem("sembako_address");
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
                        ${p.img ? `<img src="${resolveImgUrl(p.img)}" alt="${p.nama}" onclick="goDetail(${p.id})" style="cursor: pointer;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                        <div class="card-img-placeholder" onclick="goDetail(${p.id})" style="cursor: pointer; border-bottom: none; ${p.img ? 'display: none;' : ''}">
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
  localStorage.setItem(getOrderStorageKey(), JSON.stringify(orders));
}

function saveAddress() {
  localStorage.setItem("sembako_address", JSON.stringify(address));
}

async function fetchAddressFromServer() {
  if (!isLoggedIn()) return;
  try {
    const res = await apiFetch("/auth/address");
    if (res.ok && res.data) {
      address = {
        alamatLengkap: res.data.alamatLengkap || "",
        kecamatan: res.data.kecamatan || "",
        kota: res.data.kota || "",
        kodePos: res.data.kodePos || "",
        catatan: res.data.catatan || "",
      };
      saveAddress();
    }
  } catch (err) {
    console.error("Gagal mengambil alamat dari server:", err);
  }
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
            ${p.img ? `<img src="${resolveImgUrl(p.img)}" alt="${p.nama}" class="card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="card-img-placeholder" style="${p.img ? 'display: none;' : ''}">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" class="placeholder-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
            <div class="card-content">
                <h4 class="card-title">${p.nama}</h4>
                <p class="card-price">${formatRupiah(p.harga)}</p>
                <div style="font-size: 11px; font-weight: 600; color: ${(p.stok || 0) <= 0 ? '#ef4444' : ((p.stok || 0) < 10 ? '#f59e0b' : '#10b981')}; margin-top: 4px;">
                    ${(p.stok || 0) <= 0 ? 'Stok Habis' : `Stok: ${p.stok || 0}`}
                </div>
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
      (item) => {
        const prod = products.find(p => p.id === item.id) || {};
        const stokTersedia = prod.stok || 0;
        const isNearLimit = item.qty >= stokTersedia;
        return `
        <div class="cart-item">
            ${item.img ? `<img src="${resolveImgUrl(item.img)}" alt="${item.nama}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="card-img-placeholder" style="width: 70px; height: 70px; border-radius: 8px; border-bottom: none; flex-shrink: 0; ${item.img ? 'display: none;' : ''}">
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
                    <div style="font-size: 11px; color: ${isNearLimit ? '#ef4444' : '#718096'}; margin-top: 4px; font-weight: 500;">
                        Stok toko: ${stokTersedia} ${isNearLimit ? '(Maksimal)' : ''}
                    </div>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">–</button>
                        <span style="font-weight: 600; min-width: 24px; text-align: center; font-size: 14px;">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)" ${isNearLimit ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
                    </div>
                    <button onclick="removeItem(${item.id})" class="cart-item-remove-btn">
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
      }
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
                ${product.img ? `<img src="${resolveImgUrl(product.img)}" alt="${product.nama}" style="border-radius: 12px; height: 100%; min-height: 300px; width: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <div class="card-img-placeholder" style="border-radius: 12px; height: 100%; min-height: 300px; border-bottom: none; ${product.img ? 'display: none;' : ''}">
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
                <p class="detail-stock" style="font-size: 13.5px; font-weight: 500; margin: 8px 0; color: ${product.stok <= 0 ? '#ef4444' : (product.stok < 10 ? '#f59e0b' : '#5a8f8a')}">
                    Stok tersedia: <strong>${product.stok || 0}</strong> pcs
                </p>
                <p class="detail-desc">${product.desc || 'Tidak ada deskripsi.'}</p>

                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stok <= 0 ? 'disabled style="opacity: 0.5; background-color: #cbd5e1; cursor: not-allowed;"' : ''}>
                    ${product.stok <= 0 ? 'Stok Habis' : 'Masukkan Keranjang'}
                </button>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
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
  loadStoreLogo();

  // Load products dynamically dari database/backend API
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (res.ok) {
      const serverProducts = await res.json();
      products.length = 0; // Bersihkan array lokal
      if (serverProducts && serverProducts.length > 0) {
        serverProducts.forEach(p => products.push(p)); // Masukkan data dari server
        // Update categories dynamically from database
        const dbCategories = ["Semua", ...new Set(serverProducts.map(p => p.kategori).filter(Boolean))];
        categories.length = 0;
        dbCategories.forEach(cat => categories.push(cat));
      }
    }
  } catch (err) {
    console.error("Gagal memuat produk dari server, menggunakan data lokal:", err);
  }

  if (isLoggedIn()) {
    fetchCartFromServer();
    await fetchAddressFromServer();
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
  if (isRiwayat) await renderOrderHistory();
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

  const product = products.find(p => p.id === id);
  if (product && newQty > (product.stok || 0)) {
    Swal.fire({
      icon: 'warning',
      title: 'Stok Tidak Mencukupi',
      text: `Maaf, stok untuk ${product.nama} tidak mencukupi (Tersedia: ${product.stok || 0} pcs).`,
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
      }
    });
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

  const existing = cart.find((item) => item.id === id);
  const currentQty = existing ? existing.qty : 0;
  if (currentQty + 1 > (product.stok || 0)) {
    Swal.fire({
      icon: 'warning',
      title: 'Stok Tidak Mencukupi',
      text: `Maaf, stok untuk ${product.nama} tidak mencukupi (Tersedia: ${product.stok || 0} pcs, di keranjang Anda: ${currentQty} pcs).`,
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
      }
    });
    return;
  }

  // Save the original cart state for rollback in case of error
  const originalCart = JSON.parse(JSON.stringify(cart));

  // Perform optimistic update
  if (existing) {
    existing.qty += 1;
    saveCart();
    showCartToast(product.nama);
  } else {
    cart.push({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      img: product.img,
      qty: 1,
    });
    saveCart();
    showCartPopup(product, 1);
  }

  // Update cart page rendering if we are on that page
  if (document.getElementById("cartList")) {
    renderCartPage();
    const cartList = document.getElementById("cartList");
    cartList.classList.add("cart-list-updated");
    setTimeout(() => cartList.classList.remove("cart-list-updated"), 700);
    cartList.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Send request to the server in the background
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

    // Rollback changes
    cart = originalCart;
    saveCart();
    if (document.getElementById("cartList")) {
      renderCartPage();
    }
  }
}

async function loadOrdersFromServer() {
  if (!isLoggedIn()) {
    orders = [];
    return false;
  }

  const api = await apiFetch("/orders", { silent: true });
  if (api.ok && Array.isArray(api.data?.orders)) {
    orders = api.data.orders.map(normalizeServerOrder);
    saveOrders();
    return true;
  }

  loadCachedOrders();
  return false;
}

async function renderOrderHistory() {
  const container = document.getElementById("orderList");
  if (!container) return;

  if (!isLoggedIn()) {
    orders = [];
    container.innerHTML = `
            <div class="empty-msg">
                <p>Silakan login untuk melihat riwayat pesanan.</p>
                <button onclick="window.location.href='login.html?return=riwayat.html'" class="btn-primary" style="margin-top: 16px;">
                    Login
                </button>
            </div>`;
    return;
  }

  container.innerHTML = `<div class="empty-msg"><p>Memuat riwayat pesanan...</p></div>`;
  await loadOrdersFromServer();

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

async function saveAddressFromForm() {
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

  if (isLoggedIn()) {
    try {
      const res = await apiFetch("/auth/address", {
        method: "PUT",
        body: JSON.stringify(newAddress)
      });
      if (!res.ok) {
        showPopup({
          type: "error",
          title: "Gagal Menyimpan Alamat",
          message: res.data?.error || "Gagal menyimpan alamat ke server.",
        });
        return;
      }
    } catch (err) {
      console.error("Error saving address to server:", err);
    }
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

function editAddressPopup(onSavedCallback) {
  Swal.fire({
    title: 'Lengkapi Alamat Pengiriman',
    html:
      '<div style="text-align: left; font-size: 14px;">' +
      '  <label style="display:block; margin-bottom: 5px; font-weight:600; color: #4a5568;">Alamat Lengkap *</label>' +
      '  <textarea id="swal-addr-lengkap" class="swal2-input" style="width:100%; margin:0 0 15px 0; height:60px; padding:8px; box-sizing:border-box; border-radius: 6px; border: 1px solid #cbd5e0;" placeholder="Jl. Raya Kebon Jeruk No. 45"></textarea>' +
      '  <label style="display:block; margin-bottom: 5px; font-weight:600; color: #4a5568;">Kecamatan</label>' +
      '  <input id="swal-addr-kecamatan" class="swal2-input" style="width:100%; margin:0 0 15px 0; padding:8px; box-sizing:border-box; border-radius: 6px; border: 1px solid #cbd5e0; height: 38px;" placeholder="Kebon Jeruk">' +
      '  <label style="display:block; margin-bottom: 5px; font-weight:600; color: #4a5568;">Kota *</label>' +
      '  <input id="swal-addr-kota" class="swal2-input" style="width:100%; margin:0 0 15px 0; padding:8px; box-sizing:border-box; border-radius: 6px; border: 1px solid #cbd5e0; height: 38px;" placeholder="Jakarta Barat">' +
      '  <label style="display:block; margin-bottom: 5px; font-weight:600; color: #4a5568;">Kode Pos *</label>' +
      '  <input id="swal-addr-kodepos" class="swal2-input" style="width:100%; margin:0 0 15px 0; padding:8px; box-sizing:border-box; border-radius: 6px; border: 1px solid #cbd5e0; height: 38px;" placeholder="11530">' +
      '  <label style="display:block; margin-bottom: 5px; font-weight:600; color: #4a5568;">Catatan</label>' +
      '  <input id="swal-addr-catatan" class="swal2-input" style="width:100%; margin:0; padding:8px; box-sizing:border-box; border-radius: 6px; border: 1px solid #cbd5e0; height: 38px;" placeholder="Warna pagar, detail patokan">' +
      '</div>',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan Alamat',
    cancelButtonText: 'Batal',
    customClass: {
      popup: "custom-swal-popup",
      title: "custom-swal-title",
      htmlContainer: "custom-swal-html",
      closeButton: "custom-swal-close-btn",
    },
    showClass: { popup: "animate-custom-show" },
    hideClass: { popup: "animate-custom-hide" },
    didOpen: () => {
      document.getElementById('swal-addr-lengkap').value = address.alamatLengkap || '';
      document.getElementById('swal-addr-kecamatan').value = address.kecamatan || '';
      document.getElementById('swal-addr-kota').value = address.kota || '';
      document.getElementById('swal-addr-kodepos').value = address.kodePos || '';
      document.getElementById('swal-addr-catatan').value = address.catatan || '';
    },
    preConfirm: () => {
      const alamatLengkap = document.getElementById('swal-addr-lengkap').value.trim();
      const kecamatan = document.getElementById('swal-addr-kecamatan').value.trim();
      const kota = document.getElementById('swal-addr-kota').value.trim();
      const kodePos = document.getElementById('swal-addr-kodepos').value.trim();
      const catatan = document.getElementById('swal-addr-catatan').value.trim();

      if (!alamatLengkap || !kota || !kodePos) {
        Swal.showValidationMessage('Alamat Lengkap, Kota, dan Kode Pos wajib diisi!');
        return false;
      }

      return { alamatLengkap, kecamatan, kota, kodePos, catatan };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const newAddress = result.value;
      
      if (isLoggedIn()) {
        try {
          const res = await apiFetch("/auth/address", {
            method: "PUT",
            body: JSON.stringify(newAddress)
          });
          if (!res.ok) {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: res.data?.error || 'Gagal menyimpan alamat ke server.',
              customClass: { popup: "custom-swal-popup", title: "custom-swal-title", htmlContainer: "custom-swal-html" }
            });
            return;
          }
        } catch (err) {
          console.error("Error saving address to server:", err);
        }
      }

      address = newAddress;
      saveAddress();
      
      Swal.fire({
        icon: 'success',
        title: 'Alamat Berhasil Disimpan',
        text: 'Alamat pengiriman Anda telah diperbarui.',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "custom-swal-popup", title: "custom-swal-title", htmlContainer: "custom-swal-html" }
      }).then(() => {
        if (typeof onSavedCallback === 'function') {
          onSavedCallback();
        }
      });
    }
  });
}

function renderUserProfile() {
  const profile = getActiveProfile();
  const nameEl = document.querySelector(".profile-name");
  const emailEl = document.querySelector(".profile-email");
  const avatarEl = document.querySelector(".avatar");
  if (nameEl) {
    nameEl.textContent = profile.nama;
    if (isLoggedIn() && profile.is_verified) {
      nameEl.innerHTML = profile.nama + ' <span class="verified-badge" style="display: inline-flex; align-items: center; justify-content: center; background: #d1fae5; color: #065f46; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; margin-left: 6px; vertical-align: middle;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Terverifikasi</span>';
    }
  }
  if (emailEl) emailEl.textContent = profile.email;
  if (avatarEl) {
    avatarEl.src = profile.foto || DEFAULT_AVATAR;
    avatarEl.onerror = function() {
      this.src = DEFAULT_AVATAR;
    };
  }
}

function updateProfileGuestUI() {
  const banner = document.getElementById("guestBanner");
  const settingsItem = document.getElementById("settingsMenuItem");
  const addressItem = document.getElementById("addressMenuItem");
  const adminPanelBtn = document.getElementById("adminPanelBtn");

  if (banner) banner.style.display = isLoggedIn() ? "none" : "block";
  if (settingsItem) settingsItem.style.display = isLoggedIn() ? "flex" : "none";
  if (addressItem) addressItem.style.opacity = isLoggedIn() ? "1" : "0.5";
  
  if (adminPanelBtn) {
    const cachedUser = JSON.parse(localStorage.getItem("sembako_user"));
    const isAdmin = cachedUser && (cachedUser.is_admin === true || cachedUser.is_admin === 1);
    adminPanelBtn.style.display = isLoggedIn() && isAdmin ? "flex" : "none";
  }
}

function openAccountSettings() {
  if (!requireLogin("Masuk dulu untuk mengubah pengaturan akun.")) return;
  document.getElementById("accountModal").style.display = "flex";
  document.getElementById("user_nama").value = userProfile.nama;
  document.getElementById("user_email").value = userProfile.email;
  document.getElementById("user_telepon").value = userProfile.telepon;
  const previewFoto = document.getElementById("previewFoto");
  if (previewFoto) {
    previewFoto.src = userProfile.foto || DEFAULT_AVATAR;
    previewFoto.onerror = function() {
      this.src = DEFAULT_AVATAR;
    };
  }

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
    openProfileCropModal(e.target.result);
  };
  reader.readAsDataURL(file);
}

function openProfileCropModal(imageSrc) {
  const profileCropImageSource = document.getElementById("profileCropImageSource");
  if (!profileCropImageSource) return;
  
  profileCropImageSource.src = imageSrc;
  
  const modal = document.getElementById("profileCropModal");
  if (modal) modal.style.display = "flex";
  
  if (profileCropper) {
    profileCropper.destroy();
  }
  
  setTimeout(() => {
    profileCropper = new Cropper(profileCropImageSource, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.9,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
  }, 200);
}

function closeProfileCropModal() {
  const modal = document.getElementById("profileCropModal");
  if (modal) modal.style.display = "none";
  
  if (profileCropper) {
    profileCropper.destroy();
    profileCropper = null;
  }
  
  const fileInput = document.getElementById("fotoInput");
  if (fileInput) fileInput.value = "";
}

function applyProfileCrop() {
  if (!profileCropper) return;
  
  const canvas = profileCropper.getCroppedCanvas({
    width: 200,
    height: 200,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  if (canvas) {
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    document.getElementById("previewFoto").src = croppedBase64;
    closeProfileCropModal();
  }
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

  // Check if address is empty on load
  if (!address.alamatLengkap || !address.kota || !address.kodePos) {
    Swal.fire({
      title: 'Alamat Pengiriman Kosong',
      text: 'Silakan isi alamat pengiriman Anda terlebih dahulu.',
      icon: 'info',
      confirmButtonText: 'Isi Alamat',
      allowOutsideClick: false,
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
      }
    }).then((res) => {
      if (res.isConfirmed) {
        editAddressPopup(() => {
          renderCheckoutPage();
        });
      }
    });
  }

  const itemsHTML = cart
    .map(
      (item) => `
        <div class="order-item" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
            ${item.img ? `<img src="${resolveImgUrl(item.img)}" alt="${item.nama}" style="width: 40px; height: 40px; border-radius: 6px; border: 1px solid #e2e8f0; object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="order-item-img-placeholder" style="${item.img ? 'display: none;' : ''}">
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

  // Check if address is empty
  if (!address.alamatLengkap || !address.kota || !address.kodePos) {
    Swal.fire({
      title: 'Alamat Belum Lengkap',
      text: 'Mohon isi alamat pengiriman Anda terlebih dahulu sebelum melakukan pembayaran.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Isi Alamat',
      cancelButtonText: 'Batal',
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
      }
    }).then((res) => {
      if (res.isConfirmed) {
        editAddressPopup(() => {
          renderCheckoutPage();
        });
      }
    });
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
    
    const isStockError = checkout.data?.error && checkout.data.error.includes("tidak mencukupi");
    Swal.fire({
      icon: isStockError ? 'warning' : 'error',
      title: isStockError ? 'Stok Tidak Mencukupi' : 'Checkout Gagal',
      text: checkout.data?.error || "Pesanan belum berhasil disimpan ke database.",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
      }
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
    showClass: {
      popup: "animate-custom-show",
    },
    hideClass: {
      popup: "animate-custom-hide",
    },
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

async function loadStoreLogo() {
  const logoElements = document.querySelectorAll(".logo");
  if (logoElements.length === 0) return;

  try {
    const res = await fetch(`${API_BASE}/settings/logo`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        logoElements.forEach(el => {
          el.innerHTML = `<img src="${data.value}" alt="Toko Logo" onclick="window.location.href='index.html'">`;
        });
      } else {
        logoElements.forEach(el => {
          el.style.cursor = "pointer";
          el.onclick = () => { window.location.href = "index.html"; };
        });
      }
    }
  } catch (error) {
    console.error("Gagal memuat logo toko:", error);
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const eyeOpen = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');
  
  if (input.type === "password") {
    input.type = "text";
    if (eyeOpen) eyeOpen.style.display = "none";
    if (eyeClosed) eyeClosed.style.display = "block";
    btn.setAttribute("aria-label", "Sembunyikan password");
  } else {
    input.type = "password";
    if (eyeOpen) eyeOpen.style.display = "block";
    if (eyeClosed) eyeClosed.style.display = "none";
    btn.setAttribute("aria-label", "Tampilkan password");
  }
}

