# Toko Sembako - Project Kelompok

Project ini dibuat oleh kelompok:
- Moreno
- Egha
- Dedy

## Tentang Project
Project ini adalah aplikasi web toko sembako sederhana yang terdiri dari tampilan pelanggan dan halaman admin. Aplikasi ini mendukung proses login, register, melihat produk, menambahkan produk ke keranjang, checkout, riwayat pesanan, serta fitur chatbot AI untuk membantu pelanggan.

### Fitur utama
- Tampilan halaman login dan register untuk pengguna
- Halaman utama toko untuk melihat produk sembako
- Halaman detail produk dan keranjang belanja
- Proses checkout dan riwayat pesanan
- Halaman admin untuk mengelola produk dan melihat statistik penjualan
- Fitur chatbot AI untuk membantu pengguna

## Struktur Project
- FrontEnd/ : file tampilan website untuk pengguna
- Admin/ : halaman dashboard admin
- BackEnd/ : server Flask, controller, model, dan routing API
- requirements.txt : daftar dependency Python

## Cara Menjalankan Project

### 1. Clone repository
```bash
git clone <url-repository>
cd Pemrograman-Web-Sembako
```

### 2. Buat environment Python
Disarankan memakai virtual environment.

```bash
python -m venv venv
source venv/bin/activate
```

Untuk Windows PowerShell:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install dependency
```bash
pip install -r requirements.txt
```

### 4. Siapkan file environment
Sebelum menjalankan aplikasi, buat file environment berikut:

- BackEnd/config_ai.env
- BackEnd/config_mail.env

Contoh isi file dapat disesuaikan dari file example yang tersedia:
- BackEnd/config_ai.example.env
- BackEnd/config_mail.example.env

#### A. BackEnd/config_ai.env
File ini digunakan untuk konfigurasi chatbot AI.

Contoh isi:
```env
AI_PROVIDER=nvidia
AI_BASE_URL=https://integrate.api.nvidia.com/v1
AI_API_KEY=your_nvidia_api_key
AI_MODEL=meta/llama-3.1-8b-instruct
```

Jika ingin memakai provider lain, silakan sesuaikan sesuai file example.

#### B. BackEnd/config_mail.env
File ini digunakan untuk konfigurasi email SMTP.

Contoh isi:
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_USE_TLS=true
MAIL_DEFAULT_SENDER=TokoSembako <your_email@gmail.com>
```

> Pastikan password yang dipakai adalah app password jika menggunakan Gmail.

### 5. Siapkan database MySQL
Project ini menggunakan database MySQL/MariaDB.

#### Jalankan file SQL
Import file berikut ke database MySQL kamu:
```bash
BackEnd/sembako.sql
```

File ini akan membuat database dan beberapa tabel penting seperti:
- users
- produk
- keranjang
- pesanan
- pesanan_item
- alamat_pengiriman
- chat_sessions
- chat_history
- email_log

Pastikan database server sudah aktif sebelum menjalankan SQL.

### 6. Jalankan backend
```bash
python BackEnd/run.py
```

Setelah server berjalan, buka:
```text
http://localhost:5000
```

### 7. Akses halaman frontend
Buka file frontend di browser, misalnya:
```text
FrontEnd/index.html
```

Atau jika ingin memakai server langsung, gunakan endpoint utama dari backend.

## Akses Admin
Akun admin default yang tersedia adalah:
- Email: admin@sembako.com
- Password: admin123

Gunakan akun tersebut untuk login ke halaman admin.

## Tampilan Utama yang Tersedia
- Halaman login user
- Halaman register user
- Halaman toko / produk
- Halaman keranjang
- Halaman checkout
- Halaman riwayat pesanan
- Halaman admin untuk mengelola produk dan melihat statistik penjualan

## Catatan Penting
- Pastikan MySQL sudah berjalan sebelum menjalankan project.
- Pastikan file env sudah dibuat sebelum menjalankan backend.
- Jika chatbot AI tidak aktif, cek kembali isi file BackEnd/config_ai.env.
- Jika email tidak terkirim, cek kembali konfigurasi SMTP di BackEnd/config_mail.env.

## Kontributor
- Moreno
- Egha
- Dedy
