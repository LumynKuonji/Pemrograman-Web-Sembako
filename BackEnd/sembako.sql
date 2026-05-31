-- ============================================================
-- Database: sembako (MySQL / MariaDB)
-- Toko Sembako — skema lengkap (produk, user, login, keranjang, pesanan)
-- ============================================================

CREATE DATABASE IF NOT EXISTS sembako
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sembako;

-- ------------------------------------------------------------
-- 1. PENGGUNA (registrasi & login)
-- password_hash diisi oleh backend (werkzeug), BUKAN password plain
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telepon       VARCHAR(30) DEFAULT NULL,
  foto          VARCHAR(500) DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Session / token setelah login (opsional, untuk API & keamanan)
CREATE TABLE IF NOT EXISTS user_sessions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. PRODUK (selaras dengan model Flask: tabel produk)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produk (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nama      VARCHAR(100) NOT NULL,
  harga     INT NOT NULL,
  kategori  VARCHAR(50) NOT NULL,
  img       VARCHAR(500) DEFAULT NULL,
  `desc`    TEXT,
  INDEX idx_produk_kategori (kategori)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. KERANJANG per user (setelah login)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS keranjang (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  produk_id  INT NOT NULL,
  qty        INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE,
  UNIQUE KEY uq_keranjang_user_produk (user_id, produk_id),
  INDEX idx_keranjang_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. ALAMAT PENGIRIMAN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alamat_pengiriman (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  alamat_lengkap  TEXT NOT NULL,
  kecamatan       VARCHAR(80) DEFAULT NULL,
  kota            VARCHAR(80) NOT NULL,
  kode_pos        VARCHAR(10) NOT NULL,
  catatan         VARCHAR(255) DEFAULT NULL,
  is_default      TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_alamat_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. PESANAN & DETAIL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pesanan (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  kode_pesanan    VARCHAR(32) NOT NULL UNIQUE,
  total_harga     INT NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'Sedang Diproses',
  metode_bayar    VARCHAR(50) DEFAULT 'COD',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pesanan_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pesanan_item (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pesanan_id  INT NOT NULL,
  produk_id   INT NOT NULL,
  nama_produk VARCHAR(100) NOT NULL,
  harga       INT NOT NULL,
  qty         INT NOT NULL,
  FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id),
  INDEX idx_pesanan_item_pesanan (pesanan_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Akun demo & password hash: dibuat otomatis saat menjalankan Flask
--   cd BackEnd && python run.py
-- Atau daftar manual: POST /api/auth/register
-- ------------------------------------------------------------

-- Produk contoh (id tetap agar selaras dengan frontend & MBA)
INSERT INTO produk (id, nama, harga, kategori, img, `desc`) VALUES
(1,  'Beras Fortune 5 KG', 96000, 'Bahan Pokok', 'https://down-id.img.susercontent.com/file/8395b675db848bddc30455bd25ea6541@resize_w900_nl.webp', 'Beras pulen kualitas premium.'),
(2,  'GULAKU 1KG', 18000, 'Bahan Pokok', 'https://i.pinimg.com/736x/f7/92/69/f79269dae0c36b6f54f9af5dc9dccf4b.jpg', 'Gula pasir putih berkualitas.'),
(25, 'Minyak Goreng Bimoli 2 L', 42000, 'Bahan Pokok', 'https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f6789012345678abcdef01.jpg', 'Minyak goreng berkualitas.'),
(26, 'Sarden King 155 gr', 18000, 'Makanan Instan', 'https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6789012345678abcdef0123.jpg', 'Ikan sarden dalam saus tomat.')
ON DUPLICATE KEY UPDATE nama = VALUES(nama), harga = VALUES(harga);
