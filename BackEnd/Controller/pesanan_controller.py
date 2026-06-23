"""
Pesanan Controller untuk menangani pesanan, checkout, invoice, dan PDF
"""
import io
import random
import string
from datetime import datetime

from BackEnd.Database.database import (
    AlamatPengiriman,
    ItemKeranjang,
    Pesanan,
    PesananItem,
    User,
    db,
)
from BackEnd.Services import mail_service


def generate_invoice_number():
    """
    Generate nomor invoice unik
    Format: INV-YYYYMMDD-XXXXX (XXXXX adalah random 5 karakter)
    """
    date_part = datetime.utcnow().strftime('%Y%m%d')
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    invoice_number = f"INV-{date_part}-{random_part}"
    
    # Pastikan unique
    while Pesanan.query.filter_by(invoice_number=invoice_number).first():
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        invoice_number = f"INV-{date_part}-{random_part}"
    
    return invoice_number


def buat_pesanan_dari_keranjang(user_id, data):
    """
    Buat pesanan dari keranjang user
    
    Args:
        user_id: ID user
        data: Dict berisi metode_bayar, ongkir, alamat
    
    Returns:
        tuple: (Pesanan, error_message)
    """
    items = ItemKeranjang.query.filter_by(user_id=user_id).all()
    if not items:
        return None, "Keranjang masih kosong"

    subtotal = sum(item.subtotal for item in items)
    ongkir = int(data.get("ongkir", 0) or 0)
    total = subtotal + ongkir
    alamat = data.get("alamat") or {}
    
    # Ambil data alamat
    alamat_lengkap = alamat.get("alamat_lengkap") or alamat.get("alamatLengkap") or ""
    kecamatan = alamat.get("kecamatan") or ""
    kota = alamat.get("kota") or ""
    kode_pos = alamat.get("kode_pos") or alamat.get("kodePos") or ""
    catatan = alamat.get("catatan") or ""

    # Simpan alamat ke database alamat jika ada
    if alamat_lengkap and kota:
        db.session.add(AlamatPengiriman(
            user_id=user_id,
            alamat_lengkap=alamat_lengkap,
            kecamatan=kecamatan,
            kota=kota,
            kode_pos=kode_pos,
            catatan=catatan,
            is_default=True,
        ))

    # Generate invoice number
    invoice_number = generate_invoice_number()

    # Buat pesanan
    pesanan = Pesanan(
        user_id=user_id,
        kode_pesanan=f"ORD-{datetime.utcnow().strftime('%y%m%d%H%M%S%f')[:-3]}",
        invoice_number=invoice_number,
        total_harga=total,
        metode_bayar=data.get("metode_bayar") or data.get("paymentMethod") or "COD",
        status="Pesanan Diterima",
        alamat_lengkap=alamat_lengkap,
        kecamatan=kecamatan,
        kota=kota,
        kode_pos=kode_pos,
        catatan=catatan,
        ongkir=ongkir,
    )
    db.session.add(pesanan)
    db.session.flush()

    # Pindahkan item dari keranjang ke pesanan
    items_list_for_email = []
    for item in items:
        # Collect info for the email receipt
        items_list_for_email.append({
            "produk_id": item.produk_id,
            "nama": item.produk.nama,
            "harga": item.produk.harga,
            "qty": item.qty
        })
        
        db.session.add(PesananItem(
            pesanan_id=pesanan.id,
            produk_id=item.produk_id,
            nama_produk=item.produk.nama,
            harga=item.produk.harga,
            qty=item.qty,
        ))
        db.session.delete(item)

    db.session.commit()
    
    # Send purchase receipt & order notification email
    user = User.query.get(user_id)
    if user and user.email:
        alamat_str = "-"
        if alamat:
            alamat_str = f"{alamat.get('alamat_lengkap') or alamat.get('alamatLengkap') or '-'}, Kec. {alamat.get('kecamatan') or '-'}, {alamat.get('kota') or '-'}, {alamat.get('kode_pos') or alamat.get('kodePos') or '-'}"
        try:
            email_content = mail_service.generate_receipt_email(
                nama=user.nama,
                order_code=pesanan.kode_pesanan,
                items=items_list_for_email,
                subtotal=subtotal,
                ongkir=ongkir,
                total=total,
                payment_method=pesanan.metode_bayar,
                address_details=alamat_str
            )
            mail_service.send_email(
                to_email=user.email,
                subject=f"Konfirmasi Pesanan & Struk Pembelian: {pesanan.kode_pesanan}",
                html_content=email_content
            )
        except Exception as e:
            print(f"Gagal mengirim email struk pembelian: {e}")

    return pesanan, None


def get_pesanan_user(user_id):
    """Get all orders for a user"""
    return Pesanan.query.filter_by(user_id=user_id).order_by(Pesanan.created_at.desc()).all()


def generate_invoice_pdf(order):
    """
    Generate PDF invoice menggunakan ReportLab
    
    Args:
        order: Pesanan object
    
    Returns:
        BytesIO: PDF file in memory
    """
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
        HRFlowable
    )
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

    # Buat buffer untuk PDF
    buffer = io.BytesIO()
    
    # Document setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#667eea'),
        spaceAfter=6,
        alignment=TA_LEFT,
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666'),
        spaceAfter=20,
        alignment=TA_LEFT,
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#999999'),
        spaceAfter=4,
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#333333'),
        spaceAfter=10,
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        alignment=TA_LEFT,
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        alignment=TA_LEFT,
    )
    
    table_cell_right = ParagraphStyle(
        'TableCellRight',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        alignment=TA_RIGHT,
    )
    
    table_cell_center = ParagraphStyle(
        'TableCellCenter',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        alignment=TA_CENTER,
    )
    
    # Element list
    elements = []
    
    # === HEADER ===
    header_data = [
        [Paragraph("🛒 Toko Sembako", title_style),
         Paragraph("<b>INVOICE</b>", ParagraphStyle('InvLabel', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#667eea'), alignment=TA_RIGHT))],
        [Paragraph("Belanja Mudah, Harga Terjangkau", subtitle_style),
         Paragraph(f"#{order.invoice_number}", ParagraphStyle('InvNum', parent=styles['Normal'], fontSize=14, textColor=colors.HexColor('#333333'), alignment=TA_RIGHT, spaceBefore=2))],
    ]
    
    header_table = Table(header_data, colWidths=[25*cm, 10*cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#667eea')),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))
    
    # === CUSTOMER INFO ===
    user_name = order.user.nama if order.user else ""
    
    cust_data = [
        [Paragraph("<b>KEPADA</b>", header_style),
         Paragraph("<b>TANGGAL</b>", header_style)],
        [Paragraph(user_name, value_style),
         Paragraph(order.created_at.strftime("%d %B %Y, %H:%M") + " WIB", value_style)],
    ]
    
    cust_table = Table(cust_data, colWidths=['50%', '50%'])
    cust_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(cust_table)
    elements.append(Spacer(1, 20))
    
    # === ITEMS TABLE ===
    items = PesananItem.query.filter_by(pesanan_id=order.id).all()
    
    table_data = [
        [Paragraph("<b>PRODUK</b>", table_header_style),
         Paragraph("<b>QTY</b>", table_header_style),
         Paragraph("<b>HARGA</b>", table_header_style),
         Paragraph("<b>SUBTOTAL</b>", table_header_style)]
    ]
    
    for item in items:
        table_data.append([
            Paragraph(item.nama_produk, table_cell_style),
            Paragraph(str(item.qty), table_cell_center),
            Paragraph(f"Rp {item.harga:,}".replace(',', '.'), table_cell_right),
            Paragraph(f"Rp {item.subtotal:,}".replace(',', '.'), table_cell_right),
        ])
    
    item_table = Table(table_data, colWidths=[16*cm, 3*cm, 5*cm, 6*cm])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8f9fa')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9ecef')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(item_table)
    elements.append(Spacer(1, 20))
    
    # === SUMMARY ===
    subtotal = sum(item.subtotal for item in items)
    ongkir = order.ongkir or 0
    total = order.total_harga
    
    summary_data = [
        ["Subtotal", f"Rp {subtotal:,}".replace(',', '.')],
        ["Ongkos Kirim", f"Rp {ongkir:,}".replace(',', '.')],
        ["Total", f"Rp {total:,}".replace(',', '.')],
    ]
    
    summary_table = Table(summary_data, colWidths=['75%', '25%'])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('LINEABOVE', (0, 2), (-1, 2), 2, colors.HexColor('#667eea')),
        ('FONTSIZE', (0, 2), (-1, 2), 14),
        ('TEXTCOLOR', (0, 2), (-1, 2), colors.HexColor('#667eea')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 30))
    
    # === SHIPPING & PAYMENT INFO ===
    info_data = [
        [Paragraph("<b>ALAMAT PENGIRIMAN</b>", header_style),
         Paragraph("<b>METODE PEMBAYARAN</b>", header_style)],
        [Paragraph(
            f"{order.alamat_lengkap or '-'}<br/>"
            f"{order.kecamatan or '-'}, {order.kota or '-'}<br/>"
            f"{order.kode_pos or '-'}",
            ParagraphStyle('Alamat', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#333333'), spaceAfter=6)
        ),
        Paragraph(order.metode_bayar or "COD", ParagraphStyle('Payment', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#333333'), spaceAfter=20))],
        ["", Paragraph(f"<b>STATUS: {order.status}</b>", ParagraphStyle('Status', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#155724'), spaceBefore=4))],
    ]
    
    info_table = Table(info_data, colWidths=['50%', '50%'])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9ecef')),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 30))
    
    # === FOOTER ===
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e9ecef')))
    elements.append(Spacer(1, 10))
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
    )
    elements.append(Paragraph("Terima kasih telah berbelanja di Toko Sembako!", footer_style))
    elements.append(Paragraph("© 2026 Toko Sembako. All rights reserved.", footer_style))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return buffer