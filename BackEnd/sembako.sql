CREATE DATABASE IF NOT EXISTS toko_sembako
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE toko_sembako;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telepon VARCHAR(30) DEFAULT NULL,
  foto VARCHAR(500) DEFAULT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  otp_code VARCHAR(6) DEFAULT NULL,
  otp_expiry TIMESTAMP DEFAULT NULL,
  otp_type VARCHAR(20) DEFAULT NULL,
  last_login TIMESTAMP DEFAULT NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  html_content TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  error_message TEXT DEFAULT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_log_recipient (recipient)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  harga INT NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  img VARCHAR(500) DEFAULT NULL,
  `desc` TEXT,
  INDEX idx_produk_kategori (kategori)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS keranjang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  produk_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE,
  UNIQUE KEY uq_keranjang_user_produk (user_id, produk_id),
  INDEX idx_keranjang_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alamat_pengiriman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  kecamatan VARCHAR(80) DEFAULT NULL,
  kota VARCHAR(80) NOT NULL,
  kode_pos VARCHAR(10) NOT NULL,
  catatan VARCHAR(255) DEFAULT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_alamat_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pesanan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  kode_pesanan VARCHAR(32) NOT NULL UNIQUE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  total_harga INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Menunggu Konfirmasi',
  metode_bayar VARCHAR(50) DEFAULT 'COD',
  alamat_lengkap TEXT DEFAULT NULL,
  kecamatan VARCHAR(80) DEFAULT NULL,
  kota VARCHAR(80) DEFAULT NULL,
  kode_pos VARCHAR(10) DEFAULT NULL,
  catatan VARCHAR(255) DEFAULT NULL,
  ongkir INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pesanan_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pesanan_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pesanan_id INT NOT NULL,
  produk_id INT NOT NULL,
  nama_produk VARCHAR(100) NOT NULL,
  harga INT NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id),
  INDEX idx_pesanan_item_pesanan (pesanan_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS toko_settings (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  value TEXT DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  title VARCHAR(255) DEFAULT 'Chat Baru',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat_sessions_session (session_id),
  INDEX idx_chat_sessions_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  INDEX idx_chat_history_session (session_id),
  INDEX idx_chat_history_user (user_id)
) ENGINE=InnoDB;

INSERT INTO produk (id, nama, harga, kategori, stok, img, `desc`) VALUES
(1, 'Beras Fortune 5 KG', 96000, 'Bahan Pokok', 50, 'https://down-id.img.susercontent.com/file/8395b675db848bddc30455bd25ea6541@resize_w900_nl.webp', 'Beras pulen kualitas premium, cocok untuk keluarga besar.'),
(2, 'GULAKU 1KG', 18000, 'Bahan Pokok', 50, 'https://i.pinimg.com/736x/f7/92/69/f79269dae0c36b6f54f9af5dc9dccf4b.jpg', 'Gula pasir putih berkualitas, manis alami.'),
(3, 'Gula Halus Rose Brand 500 GR', 14000, 'Bahan Pokok', 50, 'https://i.pinimg.com/1200x/e6/6b/a1/e66ba14e4ca583029af940a0517fc314.jpg', 'Gula halus lembut untuk kue dan minuman.'),
(4, 'Tepung Segitiga Biru 1KG', 16000, 'Bahan Pokok', 50, 'https://i.pinimg.com/736x/57/7b/05/577b05da5c698a257d0b1680dec4840f.jpg', 'Tepung serbaguna untuk gorengan dan baking.'),
(5, 'Indomie Goreng 1 dus', 137500, 'Makanan Instan', 50, 'https://i.pinimg.com/1200x/39/f9/79/39f97924e0ccefe5865900356a9d336b.jpg', 'Indomie goreng favorit keluarga, isi 40 bungkus.'),
(6, 'Indomie Soto Mie 1 dus', 140500, 'Makanan Instan', 50, 'https://i.pinimg.com/1200x/f2/12/12/f2121200e80b301688d31d1763f40d1a.jpg', 'Rasa kuah soto yang gurih dan segar.'),
(7, 'Indomie Ayam Bawang 1 dus', 125000, 'Makanan Instan', 50, 'https://i.pinimg.com/1200x/58/ee/94/58ee946df496b196e19602b5acfec46b.jpg', 'Cita rasa bawang yang harum dan khas.'),
(8, 'Mie Sedap Goreng 1 dus', 140000, 'Makanan Instan', 50, 'https://i.pinimg.com/1200x/23/db/35/23db35506192154250286ccea47a7a15.jpg', 'Mie goreng dengan bumbu kaya rempah.'),
(9, 'Indomie Ayam Geprek 1 dus', 143500, 'Makanan Instan', 50, 'https://i.pinimg.com/736x/56/bb/26/56bb260308f663879bf8034b4b01d2b8.jpg', 'Pedas nikmat ala ayam geprek.'),
(10, 'Garam Kapal 250 Gr', 3000, 'Bumbu Dapur', 50, 'https://i.pinimg.com/1200x/34/15/5a/34155ad4cb58371c1a59d8d482b78f80.jpg', 'Garam meja halus untuk masakan sehari-hari.'),
(11, 'Masako Ayam 11 Gr (6 Sachet)', 13000, 'Bumbu Dapur', 50, 'https://i.pinimg.com/1200x/4f/6d/72/4f6d728d69bbb59f928afb68e15f6592.jpg', 'Penyedap rasa ayam praktis.'),
(12, 'Royco Sapi (12 Sachet)', 15000, 'Bumbu Dapur', 50, 'https://i.pinimg.com/736x/fe/a0/a8/fea0a8a998a10a3a2e2cb40c00b2a9af.jpg', 'Bumbu penyedap sapi berkualitas.'),
(13, 'Teh Kotak Jasmine 200 Ml', 4000, 'Minuman', 50, 'https://i.pinimg.com/1200x/9f/25/d2/9f25d257a6c644a182cbe026a5eecd84.jpg', 'Teh melati segar dalam kemasan kotak.'),
(14, 'Teh Pucuk Harum 350 Ml', 3500, 'Minuman', 50, 'https://i.pinimg.com/1200x/ae/9e/55/ae9e55c743331663f05f42407271d04a.jpg', 'Teh hijau pucuk terbaik, segar dan sehat.'),
(15, 'FRUIT TEA Apple 350ML', 4000, 'Minuman', 50, 'https://i.pinimg.com/1200x/4e/37/4d/4e374dc7e88a804fee0e79e5d209c74e.jpg', 'Teh rasa apel yang menyegarkan.'),
(16, 'POTABEE BARBEQUE 68 GR', 28000, 'Snack', 50, 'https://down-id.img.susercontent.com/file/sg-11134201-824g9-mepph5cyvgn9c2@resize_w900_nl.webp', 'Keripik kentang rasa BBQ yang renyah.'),
(17, 'KitKat 45gr', 11000, 'Snack', 50, 'https://i.pinimg.com/736x/5a/71/84/5a7184e1d347ebbdb920c49ae5c99266.jpg', 'Coklat renyah berlapis wafer.'),
(18, 'CHEETOS Puffs 60 gr', 21000, 'Snack', 50, 'https://i.pinimg.com/736x/94/b2/48/94b248e82908bfc2a82a824fcc313356.jpg', 'Snack keju yang ringan dan renyah.'),
(19, 'Head & Shoulder 350ml', 87000, 'Kebutuhan Mandi', 50, 'https://i.pinimg.com/1200x/54/7e/12/547e12146ace111fe9d98c2c7598af2a.jpg', 'Shampoo anti ketombe cool menthol.'),
(20, 'SUNLIGHT BOTOL 750 ML', 49000, 'Kebutuhan Cuci', 50, 'https://i.pinimg.com/1200x/4c/78/bb/4c78bb6fd632ed391f2ec25769f1b251.jpg', 'Sabun cuci piring pemotong lemak.'),
(21, 'Pepsodent Action 123 180 GR', 27000, 'Kebutuhan Mandi', 50, 'https://i.pinimg.com/1200x/34/a8/4d/34a84dac30633b6cff4085bd3f778223.jpg', 'Sikat gigi 3 arah bersih maksimal.'),
(22, 'SO GOOD TELUR OMEGA3 10S', 34000, 'Produk Segar', 50, 'https://down-id.img.susercontent.com/file/id-11134275-7rbk2-ma7ysj9nanj5a9@resize_w900_nl.webp', 'Telur kaya omega untuk tumbuh kembang.'),
(23, 'Smoked Beef Metzger 100gr', 23000, 'Produk Segar', 50, 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSLxvY__qk9kjbgXOHQ5e2CwtDzMZqPDASukce-bu22olpginNVvA1ZOTdOpE78BwC1X7vzTX0wBeq8esRfG0ZYQ-A1xpikOi_-crX6_c7ZSUtt4h0yJAppv5A', 'Daging sapi asap halal siap saji.'),
(24, 'Snack Buah Strawberry Kering Freeze Dried 1 Kg', 66000, 'Snack', 50, 'https://i.pinimg.com/1200x/35/31/ee/3531ee7dab3c6f86c5be2d1667e3d578.jpg', 'Snack buah strawberry kering sehat tanpa pengawet.'),
(25, 'Minyak Goreng Bimoli 2 L', 42000, 'Bahan Pokok', 50, 'https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f6789012345678abcdef01.jpg', 'Minyak goreng berkualitas untuk masak sehari-hari.'),
(26, 'Sarden King 155 gr', 18000, 'Makanan Instan', 50, 'https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6789012345678abcdef0123.jpg', 'Ikan sarden dalam saus tomat, praktis dan bergizi.')
ON DUPLICATE KEY UPDATE
  nama = VALUES(nama),
  harga = VALUES(harga),
  kategori = VALUES(kategori),
  stok = VALUES(stok),
  img = VALUES(img),
  `desc` = VALUES(`desc`);
