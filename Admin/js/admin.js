const API_BASE = "http://127.0.0.1:5000/api";

let productsList = [];
let editingProductId = null;

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
const inputId = document.getElementById("productId");
const inputNama = document.getElementById("productNama");
const inputHarga = document.getElementById("productHarga");
const inputKategori = document.getElementById("productKategori");
const inputImg = document.getElementById("productImg");
const inputDesc = document.getElementById("productDesc");
const imgPreview = document.getElementById("imgPreview");
const previewPlaceholder = document.getElementById("previewPlaceholder");

function updateImagePreview(url) {
  if (url) {
    imgPreview.src = url;
    imgPreview.style.display = "block";
    previewPlaceholder.style.display = "none";
  } else {
    imgPreview.style.display = "none";
    imgPreview.src = "";
    previewPlaceholder.style.display = "block";
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  setupEventListeners();
  loadStoreLogo();
});

// Event Listeners
function setupEventListeners() {
  // Live Image Preview in Modal
  inputImg.addEventListener("input", () => {
    updateImagePreview(inputImg.value.trim());
  });

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
  return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
      <td>ID: ${p.id}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" title="Edit Produk" onclick="openEditModal(${p.id})">
            <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" title="Hapus Produk" onclick="confirmDelete(${p.id}, '${p.nama}')">
            <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
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
  updateImagePreview("");
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
  inputImg.value = p.img || "";
  inputDesc.value = p.desc || "";

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
  const kategori = inputKategori.value.trim();
  const img = inputImg.value.trim();
  const desc = inputDesc.value.trim();

  if (!nama || !harga || !kategori) {
    showToast("warning", "Nama, harga, dan kategori produk harus diisi");
    return;
  }

  const payload = { nama, harga, kategori, img, desc };
  const method = editingProductId ? "PUT" : "POST";
  const url = editingProductId ? `${API_BASE}/products/${editingProductId}` : `${API_BASE}/products`;

  Swal.fire({
    title: 'Menyimpan...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const session = JSON.parse(localStorage.getItem("sembako_admin_session"));
    const headers = { "Content-Type": "application/json" };
    if (session && session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const res = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(payload)
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
      window.location.href = "login.html";
    }
  });
}

// Load Store Logo on Admin Page Load
async function loadStoreLogo() {
  const storeLogoInput = document.getElementById("storeLogoInput");
  if (!storeLogoInput) return;
  try {
    const res = await fetch(`${API_BASE}/settings/logo`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        storeLogoInput.value = data.value;
      }
    }
  } catch (error) {
    console.error("Gagal memuat logo toko:", error);
  }
}

// Save Store Logo
async function saveStoreLogo() {
  const storeLogoInput = document.getElementById("storeLogoInput");
  if (!storeLogoInput) return;
  const logoUrl = storeLogoInput.value.trim();

  Swal.fire({
    title: 'Menyimpan Logo...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const session = JSON.parse(localStorage.getItem("sembako_admin_session"));
    const headers = { "Content-Type": "application/json" };
    if (session && session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const res = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ key: "logo", value: logoUrl })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menyimpan logo");

    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Logo Disimpan!',
      text: 'Logo toko berhasil diperbarui.',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan Logo',
      text: error.message
    });
  }
}
