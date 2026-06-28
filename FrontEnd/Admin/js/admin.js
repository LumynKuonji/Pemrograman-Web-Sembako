const API_BASE = "https://pemrograman-web-sembako-production.up.railway.app//api";

let productsList = [];
let editingProductId = null;
let storeCropper = null;
let storeCroppedBlob = null;
let productCropper = null;
let productCroppedBlob = null;

// DOM Elements
const productsTableBody = document.getElementById("productsTableBody");
const totalProductsVal = document.getElementById("totalProductsVal");
const totalCategoriesVal = document.getElementById("totalCategoriesVal");
const avgPriceVal = document.getElementById("avgPriceVal");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const productModal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");
const productForm = document.getElementById("productForm");
const productsView = document.getElementById("productsView");
const statsView = document.getElementById("statsView");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const inputId = document.getElementById("productId");
const inputNama = document.getElementById("productNama");
const inputHarga = document.getElementById("productHarga");
const inputKategori = document.getElementById("productKategori");
const inputImg = document.getElementById("productImg");
const inputDesc = document.getElementById("productDesc");
const inputStok = document.getElementById("productStok");
const imgPreview = document.getElementById("imgPreview");
const previewPlaceholder = document.getElementById("previewPlaceholder");

function updateImagePreview(srcOrFile) {
  const btnCropProduct = document.getElementById("btnCropProduct");
  if (srcOrFile) {
    if (typeof srcOrFile === "string") {
      imgPreview.src = srcOrFile;
      imgPreview.style.display = "block";
      previewPlaceholder.style.display = "none";
      if (btnCropProduct) btnCropProduct.style.display = "inline-flex";
    } else if (srcOrFile instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgPreview.src = e.target.result;
        imgPreview.style.display = "block";
        previewPlaceholder.style.display = "none";
        if (btnCropProduct) btnCropProduct.style.display = "inline-flex";
      };
      reader.readAsDataURL(srcOrFile);
    }
  } else {
    imgPreview.style.display = "none";
    imgPreview.src = "";
    previewPlaceholder.style.display = "block";
    if (btnCropProduct) btnCropProduct.style.display = "none";
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  showAdminView("products");
  fetchProducts();
  loadSalesStatistics();
  setupEventListeners();
  loadStoreLogo();
});

function showAdminView(view) {
  document.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"));

  if (view === "stats") {
    document.getElementById("statsMenuItem")?.classList.add("active");
    productsView?.classList.remove("active");
    statsView?.classList.add("active");
    if (pageTitle) pageTitle.textContent = "Statistik Penjualan";
    if (pageSubtitle) pageSubtitle.textContent = "Pantau penjualan mingguan dan keuntungan dari pesanan pelanggan.";
  } else {
    document.getElementById("productsMenuItem")?.classList.add("active");
    productsView?.classList.add("active");
    statsView?.classList.remove("active");
    if (pageTitle) pageTitle.textContent = "Manajemen Produk";
    if (pageSubtitle) pageSubtitle.textContent = "Kelola semua barang sembako yang ditawarkan kepada pelanggan.";
  }
}

// Event Listeners
function setupEventListeners() {
  // Live Image Preview in Modal -> triggers Crop Modal
  inputImg.addEventListener("change", () => {
    if (inputImg.files && inputImg.files[0]) {
      const file = inputImg.files[0];
      const uploadSubtitle = document.getElementById("uploadSubtitle");
      if (uploadSubtitle) {
        uploadSubtitle.textContent = `File dipilih: ${file.name}`;
        uploadSubtitle.style.color = "var(--primary)";
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        openProductCropModal(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      productCroppedBlob = null;
      updateImagePreview(null);
      const uploadSubtitle = document.getElementById("uploadSubtitle");
      if (uploadSubtitle) {
        uploadSubtitle.textContent = "Klik di sini untuk mengunggah gambar produk";
        uploadSubtitle.style.color = "";
      }
    }
  });

  // Live Store Logo Preview in Topbar
  const storeLogoInput = document.getElementById("storeLogoInput");
  const storeLogoFilename = document.getElementById("storeLogoFilename");
  const storeLogoPreview = document.getElementById("storeLogoPreview");
  const storeLogoPlaceholder = document.getElementById("storeLogoPlaceholder");

  if (storeLogoInput) {
    storeLogoInput.addEventListener("change", () => {
      if (storeLogoInput.files && storeLogoInput.files[0]) {
        const file = storeLogoInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          openCropModal(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Search & Filter
  searchInput.addEventListener("input", filterAndRenderProducts);
  categoryFilter.addEventListener("change", filterAndRenderProducts);

  // Form Submit
  productForm.addEventListener("submit", handleFormSubmit);
}

// Fetch Products from Backend
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("Gagal mengambil data produk");
    productsList = await res.json();
    
    // Populate filter categories dynamically
    populateCategoryFilters();
    
    filterAndRenderProducts();
    updateMetrics();
  } catch (error) {
    showToast("error", error.message);
  }
}

// Dynamic Categories population
function populateCategoryFilters() {
  const categories = [...new Set(productsList.map(p => p.kategori))];
  
  // Keep first option 'Semua Kategori'
  categoryFilter.innerHTML = '<option value="Semua">Semua Kategori</option>';
  categories.forEach(cat => {
    if (cat) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    }
  });
}

// Update Dashboard Statistics
function updateMetrics() {
  const count = productsList.length;
  const categories = new Set(productsList.map(p => p.kategori)).size;
  const avgPrice = count > 0 
    ? Math.round(productsList.reduce((sum, p) => sum + p.harga, 0) / count)
    : 0;

  totalProductsVal.textContent = count;
  totalCategoriesVal.textContent = categories;
  avgPriceVal.textContent = formatRupiah(avgPrice);
}

// Format number as Rupiah currency
function formatRupiah(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return "Rp " + Number(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function loadSalesStatistics() {
  const placeholder = document.getElementById("salesChartPlaceholder");
  const tableBody = document.getElementById("salesStatsTableBody");

  try {
    const session = JSON.parse(localStorage.getItem("sembako_admin_session"));
    const headers = {};
    if (session && session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const res = await fetch(`${API_BASE}/admin/sales-statistics`, { headers });
    if (!res.ok) throw new Error("Gagal mengambil data statistik penjualan");

    const data = await res.json();
    updateSalesSummary(data.summary);
    renderSalesChart(data.weeks);
    renderSalesTable(data.weeks);

    if (placeholder) placeholder.style.display = "none";
  } catch (error) {
    if (placeholder) {
      placeholder.textContent = error.message;
      placeholder.style.display = "block";
    }
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">${error.message}</td>
        </tr>
      `;
    }
  }
}

function updateSalesSummary(summary) {
  const total = summary?.total_revenue || 0;
  const profit = summary?.total_profit || 0;
  const avg = summary?.average_per_week || 0;
  const peak = summary?.peak_week || "Belum ada data";

  document.getElementById("salesTotalValue").textContent = formatRupiah(total);
  document.getElementById("salesProfitValue").textContent = formatRupiah(profit);
  document.getElementById("salesAvgValue").textContent = formatRupiah(avg);
  document.getElementById("salesPeakValue").textContent = peak;
}

function renderSalesChart(weeks) {
  const chart = document.getElementById("salesChart");
  if (!chart) return;

  if (!weeks || weeks.length === 0) {
    chart.innerHTML = '<div class="chart-empty">Belum ada data penjualan untuk ditampilkan.</div>';
    return;
  }

  const width = 720;
  const height = 280;
  const padding = 42;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(
    1,
    ...weeks.flatMap((week) => [week.revenue || 0, week.profit || 0])
  );

  const createLine = (series, color) => {
    const points = weeks.map((week, index) => {
      const x = padding + (weeks.length > 1 ? (index * chartWidth) / (weeks.length - 1) : chartWidth / 2);
      const y = padding + chartHeight - ((series[index] || 0) / maxValue) * chartHeight;
      return { x, y, value: series[index] || 0 };
    });

    const path = points.map((point) => `${point.x},${point.y}`).join(" ");
    return { points, path, color };
  };

  const revenueSeries = weeks.map((week) => week.revenue || 0);
  const profitSeries = weeks.map((week) => week.profit || 0);
  const revenueLine = createLine(revenueSeries, "#5a8f8a");
  const profitLine = createLine(profitSeries, "#10b981");

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1"></line>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1"></line>
      ${[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + chartHeight - ratio * chartHeight;
        return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 3"></line>`;
      }).join("")}
      <polyline fill="none" stroke="${revenueLine.color}" stroke-width="3" points="${revenueLine.path}"></polyline>
      <polyline fill="none" stroke="${profitLine.color}" stroke-width="3" points="${profitLine.path}"></polyline>
      ${revenueLine.points.map((point, index) => `
        <circle cx="${point.x}" cy="${point.y}" r="5" fill="${revenueLine.color}"></circle>
        <text x="${point.x}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#64748b">${weeks[index].label}</text>
      `).join("")}
      ${profitLine.points.map((point) => `
        <circle cx="${point.x}" cy="${point.y}" r="4" fill="${profitLine.color}"></circle>
      `).join("")}
      <text x="${padding}" y="18" font-size="11" fill="#64748b">${formatRupiah(maxValue)}</text>
      <text x="${padding}" y="${height - 12}" font-size="11" fill="#64748b">0</text>
    </svg>
    <div class="chart-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#5a8f8a"></span>Penjualan</span>
      <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Keuntungan</span>
    </div>
  `;

  chart.innerHTML = svg;
}

function renderSalesTable(weeks) {
  const tableBody = document.getElementById("salesStatsTableBody");
  if (!tableBody) return;

  if (!weeks || weeks.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada data.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = weeks.map((week) => `
    <tr>
      <td>${week.label}</td>
      <td>${formatRupiah(week.revenue || 0)}</td>
      <td>${formatRupiah(week.profit || 0)}</td>
      <td>${week.orders || 0}</td>
    </tr>
  `).join("");
}

// Filter and Render Products inside Table
function filterAndRenderProducts() {
  const searchVal = searchInput.value.toLowerCase().trim();
  const selectedCat = categoryFilter.value;

  const filtered = productsList.filter(p => {
    const matchesSearch = p.nama.toLowerCase().includes(searchVal) || 
                          (p.desc && p.desc.toLowerCase().includes(searchVal));
    const matchesCategory = selectedCat === "Semua" || p.kategori === selectedCat;
    return matchesSearch && matchesCategory;
  });

  renderTable(filtered);
}

// Render product list inside HTML table
function renderTable(products) {
  productsTableBody.innerHTML = "";

  if (products.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">
          Tidak ada produk ditemukan.
        </td>
      </tr>
    `;
    return;
  }

  products.forEach(p => {
    const tr = document.createElement("tr");
    
    tr.innerHTML = `
      <td>
        <div class="product-cell">
          <img class="product-img" src="${p.img || 'https://via.placeholder.com/150?text=Sembako'}" alt="${p.nama}" onerror="this.src='https://via.placeholder.com/150?text=Sembako'">
          <div class="product-details">
            <div class="name">${p.nama}</div>
            <div class="desc">${p.desc || 'Tidak ada deskripsi'}</div>
          </div>
        </div>
      </td>
      <td><span class="price-text">${formatRupiah(p.harga)}</span></td>
      <td><span class="badge-category">${p.kategori}</span></td>
      <td>
        <span style="font-weight: 600; color: ${(p.stok || 0) < 10 ? '#ef4444' : '#10b981'};">
          ${p.stok || 0}
        </span>
      </td>
      <td>ID: ${p.id}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action-text btn-edit-text" onclick="openEditModal(${p.id})">Edit</button>
          <button class="btn-action-text btn-delete-text" onclick="confirmDelete(${p.id}, '${p.nama}')">Hapus</button>
        </div>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
}

// Modal open/close actions
function openAddModal() {
  editingProductId = null;
  modalTitle.textContent = "Tambah Produk Baru";
  productForm.reset();
  productCroppedBlob = null;
  updateImagePreview("");
  const uploadSubtitle = document.getElementById("uploadSubtitle");
  if (uploadSubtitle) {
    uploadSubtitle.textContent = "Klik di sini untuk mengunggah gambar produk";
    uploadSubtitle.style.color = "";
  }
  productModal.classList.add("active");
}

function openEditModal(id) {
  const p = productsList.find(item => item.id === id);
  if (!p) return;

  editingProductId = id;
  modalTitle.textContent = "Edit Detail Produk";
  
  inputNama.value = p.nama;
  inputHarga.value = p.harga;
  inputKategori.value = p.kategori;
  inputImg.value = ""; // Reset file input
  inputDesc.value = p.desc || "";
  if (inputStok) inputStok.value = p.stok || 0;
  productCroppedBlob = null;

  const uploadSubtitle = document.getElementById("uploadSubtitle");
  if (uploadSubtitle) {
    uploadSubtitle.textContent = "Klik di sini untuk mengganti gambar produk";
    uploadSubtitle.style.color = "";
  }

  updateImagePreview(p.img || "");

  productModal.classList.add("active");
}

function closeModal() {
  productModal.classList.remove("active");
}

// Add/Edit handler logic
async function handleFormSubmit(e) {
  e.preventDefault();

  const nama = inputNama.value.trim();
  const harga = parseInt(inputHarga.value);
  const stok = inputStok ? (parseInt(inputStok.value) || 0) : 0;
  const kategori = inputKategori.value.trim();
  const desc = inputDesc.value.trim();

  if (!nama || !harga || !kategori) {
    showToast("warning", "Nama, harga, dan kategori produk harus diisi");
    return;
  }

  const formData = new FormData();
  formData.append("nama", nama);
  formData.append("harga", harga);
  formData.append("stok", stok);
  formData.append("kategori", kategori);
  formData.append("desc", desc);
  
  if (productCroppedBlob) {
    formData.append("img", productCroppedBlob, "product_cropped.jpg");
  } else if (inputImg.files && inputImg.files[0]) {
    formData.append("img", inputImg.files[0]);
  }

  const method = editingProductId ? "PUT" : "POST";
  const url = editingProductId ? `${API_BASE}/products/${editingProductId}` : `${API_BASE}/products`;

  Swal.fire({
    title: 'Menyimpan...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const session = JSON.parse(localStorage.getItem("sembako_admin_session"));
    const headers = {};
    if (session && session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const res = await fetch(url, {
      method: method,
      headers: headers,
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menyimpan produk");

    Swal.close();
    closeModal();
    
    Swal.fire({
      icon: 'success',
      title: editingProductId ? 'Produk Diperbarui' : 'Produk Ditambahkan',
      text: result.message,
      timer: 2000,
      showConfirmButton: false
    });

    // Refresh products list
    fetchProducts();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: error.message
    });
  }
}

// Confirm Delete Dialog
function confirmDelete(id, name) {
  Swal.fire({
    title: 'Hapus Produk?',
    text: `Apakah Anda yakin ingin menghapus produk "${name}"? Tindakan ini tidak dapat dibatalkan!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      deleteProduct(id);
    }
  });
}

// Delete Product API Call
async function deleteProduct(id) {
  Swal.fire({
    title: 'Menghapus...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const session = JSON.parse(localStorage.getItem("sembako_admin_session"));
    const headers = {};
    if (session && session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: headers
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menghapus produk");

    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Dihapus!',
      text: result.message,
      timer: 2000,
      showConfirmButton: false
    });

    // Refresh products list
    fetchProducts();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus',
      text: error.message
    });
  }
}

// Custom Toast utility
function showToast(type, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });

  Toast.fire({
    icon: type,
    title: message
  });
}

// Logout handler
function handleAdminLogout() {
  Swal.fire({
    title: 'Keluar?',
    text: "Apakah Anda yakin ingin keluar dari panel admin?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#5a8f8a',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("sembako_admin_session");
      localStorage.removeItem("sembako_session");
      localStorage.removeItem("sembako_user");
      window.location.href = "../FrontEnd/login.html";
    }
  });
}

// Load Store Logo on Admin Page Load
async function loadStoreLogo() {
  const preview = document.getElementById("storeLogoPreview");
  const placeholder = document.getElementById("storeLogoPlaceholder");
  if (!preview) return;
  try {
    const res = await fetch(`${API_BASE}/settings/logo`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        preview.src = data.value;
        preview.style.display = "block";
        if (placeholder) placeholder.style.display = "none";
      } else {
        preview.style.display = "none";
        if (placeholder) placeholder.style.display = "flex";
      }
    }
  } catch (error) {
    console.error("Gagal memuat logo toko:", error);
  }
}

// Save Store Logo (Upload File)
// Save Store Logo (Upload File)
async function saveStoreLogo() {
  if (!storeCroppedBlob) {
    Swal.fire({
      icon: 'warning',
      title: 'Pilih Gambar',
      text: 'Silakan pilih dan potong file logo gambar terlebih dahulu sebelum menyimpan.',
      confirmButtonColor: '#5a8f8a',
    });
    return;
  }

  const formData = new FormData();
  formData.append("logo", storeCroppedBlob, "logo_cropped.png");

  Swal.fire({
    title: 'Mengupload Logo...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const session = JSON.parse(localStorage.getItem("sembako_admin_session"));
    const headers = {};
    if (session && session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const res = await fetch(`${API_BASE}/settings/upload-logo`, {
      method: "POST",
      headers: headers,
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengupload logo");

    // Update preview
    const preview = document.getElementById("storeLogoPreview");
    const placeholder = document.getElementById("storeLogoPlaceholder");
    if (preview) {
      preview.src = result.value;
      preview.style.display = "block";
      if (placeholder) placeholder.style.display = "none";
    }

    const storeLogoFilename = document.getElementById("storeLogoFilename");
    if (storeLogoFilename) {
      storeLogoFilename.textContent = "Logo berhasil disimpan!";
      storeLogoFilename.style.color = "var(--success)";
      setTimeout(() => {
        storeLogoFilename.textContent = "Pilih file logo...";
        storeLogoFilename.style.color = "var(--text-muted)";
      }, 3000);
    }

    // Reset file input & crop state
    const fileInput = document.getElementById("storeLogoInput");
    if (fileInput) fileInput.value = "";
    storeCroppedBlob = null;

    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Logo Diupload!',
      text: 'Logo toko berhasil diperbarui.',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    let msg = error.message;
    if (msg.includes("Akses ditolak")) {
      msg += "\n\n(Saran: Silakan klik tombol 'Keluar' di menu kiri lalu masuk kembali, kemungkinan sesi login Anda di database telah kedaluwarsa atau terhapus setelah server/DB di-restart).";
    }
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan Logo',
      text: msg,
      confirmButtonColor: '#5a8f8a',
    });
  }
}

// Crop Modal Helper Functions
function openCropModal(imageSrc) {
  const cropImageSource = document.getElementById("cropImageSource");
  if (!cropImageSource) return;
  
  cropImageSource.src = imageSrc;
  
  const modal = document.getElementById("cropModal");
  if (modal) modal.classList.add("active");
  
  // Initialize Cropper
  if (storeCropper) {
    storeCropper.destroy();
  }
  
  // Wait for the modal animation and image load so Cropper computes dimensions correctly
  setTimeout(() => {
    storeCropper = new Cropper(cropImageSource, {
      aspectRatio: 1, // 1:1 ratio for a square/circle logo
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

function closeCropModal() {
  const modal = document.getElementById("cropModal");
  if (modal) modal.classList.remove("active");
  
  if (storeCropper) {
    storeCropper.destroy();
    storeCropper = null;
  }
  
  const fileInput = document.getElementById("storeLogoInput");
  if (fileInput) fileInput.value = "";
}

function applyLogoCrop() {
  if (!storeCropper) return;
  
  // Get cropped canvas
  const canvas = storeCropper.getCroppedCanvas({
    width: 250,
    height: 250,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  if (canvas) {
    canvas.toBlob((blob) => {
      storeCroppedBlob = blob;
      
      // Update preview with cropped local object URL
      const croppedUrl = URL.createObjectURL(blob);
      const storeLogoPreview = document.getElementById("storeLogoPreview");
      const storeLogoPlaceholder = document.getElementById("storeLogoPlaceholder");
      
      if (storeLogoPreview) {
        storeLogoPreview.src = croppedUrl;
        storeLogoPreview.style.display = "block";
      }
      if (storeLogoPlaceholder) {
        storeLogoPlaceholder.style.display = "none";
      }
      
      const storeLogoFilename = document.getElementById("storeLogoFilename");
      if (storeLogoFilename) {
        storeLogoFilename.textContent = "Potongan siap disimpan!";
        storeLogoFilename.style.color = "var(--primary)";
      }
      
      closeCropModal();
    }, 'image/png');
  }
}

// Product Crop Modal Helper Functions
function openProductCropModal(imageSrc) {
  const productCropImageSource = document.getElementById("productCropImageSource");
  if (!productCropImageSource) return;
  
  // Set crossorigin if it's a remote URL from our API or other host
  if (imageSrc.startsWith('http')) {
    productCropImageSource.setAttribute('crossorigin', 'anonymous');
  } else {
    productCropImageSource.removeAttribute('crossorigin');
  }
  
  productCropImageSource.src = imageSrc;
  
  const modal = document.getElementById("productCropModal");
  if (modal) modal.classList.add("active");
  
  if (productCropper) {
    productCropper.destroy();
  }
  
  setTimeout(() => {
    productCropper = new Cropper(productCropImageSource, {
      aspectRatio: 1, // 1:1 square crop for product photos
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
      checkOrientation: false,
      checkCrossOrigin: true,
    });
  }, 200);
}

function closeProductCropModal() {
  const modal = document.getElementById("productCropModal");
  if (modal) modal.classList.remove("active");
  
  if (productCropper) {
    productCropper.destroy();
    productCropper = null;
  }
  
  // If the user cancelled crop and there is no previous cropped blob, reset input
  if (!productCroppedBlob) {
    const fileInput = document.getElementById("productImg");
    if (fileInput) fileInput.value = "";
  }
}

function applyProductCrop() {
  if (!productCropper) return;
  
  const canvas = productCropper.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  if (canvas) {
    canvas.toBlob((blob) => {
      productCroppedBlob = blob;
      
      // Update preview with cropped local object URL
      const croppedUrl = URL.createObjectURL(blob);
      updateImagePreview(croppedUrl);
      
      closeProductCropModal();
    }, 'image/jpeg', 0.9);
  }
}

function cropCurrentProductImage() {
  const imgPreview = document.getElementById("imgPreview");
  if (imgPreview && imgPreview.src && imgPreview.style.display !== "none") {
    openProductCropModal(imgPreview.src);
  }
}
