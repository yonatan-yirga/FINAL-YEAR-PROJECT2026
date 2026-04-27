"""
Certificate PDF Generator Professional A4-landscape certificate with:
  - Real DMU logo from backend/static/images/dmu_logo.png
  - Real dept head name  (Certificate.dept_head_name from Department.head_name)
  - Real company rep     (Certificate.company_rep_name / company_rep_title)
"""
import os
from django.conf import settings
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics import renderPDF

# ── Palette ───────────────────────────────────────────────────────────────────
NAVY  = colors.HexColor('#0D2B5E')
NAVY2 = colors.HexColor('#1A3F7A')
GOLD  = colors.HexColor('#C9A84C')
GOLD2 = colors.HexColor('#DFB96A')
CREAM = colors.HexColor('#FDFBF5')
LGREY = colors.HexColor('#EEF2F8')
MGREY = colors.HexColor('#7A8A9E')
DGREY = colors.HexColor('#2D3A4A')
WHITE = colors.white


def _get_logo_path():
    """
    Returns the absolute path to the DMU logo.
    Checks STATICFILES_DIRS first (development), then STATIC_ROOT (production).
    Returns None if the file cannot be found so the generator falls back gracefully.
    """
    rel = os.path.join('images', 'dmu_logo.png')

    # Check each entry in STATICFILES_DIRS
    for static_dir in getattr(settings, 'STATICFILES_DIRS', []):
        candidate = os.path.join(str(static_dir), rel)
        if os.path.isfile(candidate):
            return candidate

    # Check STATIC_ROOT (after collectstatic in production)
    static_root = getattr(settings, 'STATIC_ROOT', None)
    if static_root:
        candidate = os.path.join(str(static_root), rel)
        if os.path.isfile(candidate):
            return candidate

    return None


def _get_frontend_url():
    origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    return origins[0] if origins else 'http://localhost:5173'


def _qr(c, text, x, y, size=46):
    try:
        w_ = QrCodeWidget(text)
        b  = w_.getBounds()
        sw, sh = b[2] - b[0], b[3] - b[1]
        d = Drawing(size, size, transform=[size / sw, 0, 0, size / sh, 0, 0])
        d.add(w_)
        renderPDF.draw(d, c, x, y)
    except Exception:
        pass


def _dot_grid(c, x, y, w, h, spacing=16, r=0.65, col=None):
    col = col or NAVY2
    c.setFillColor(col)
    xi = x
    while xi < x + w:
        yi = y
        while yi < y + h:
            c.circle(xi, yi, r, stroke=0, fill=1)
            yi += spacing
        xi += spacing


def _pill(c, cx, y, w, h, text):
    """Rounded pill tag with a gold dot on the left."""
    x = cx - w / 2
    c.setFillColor(LGREY)
    c.roundRect(x, y, w, h, h / 2, stroke=0, fill=1)
    c.setStrokeColor(colors.HexColor('#C8D4E8'))
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, h / 2, stroke=1, fill=0)
    c.setFillColor(GOLD)
    c.circle(x + h / 2, y + h / 2, 3.5, stroke=0, fill=1)
    c.setFont('Helvetica', 9)
    c.setFillColor(DGREY)
    c.drawCentredString(cx + 4, y + h / 2 - 4.5, text)


def _draw_signature(c, sx, sig_y, sig_lw, name, role, title=None):
    """Draw one signature block: line + gold dot + name + role."""
    c.setStrokeColor(colors.HexColor('#A8B8C8'))
    c.setLineWidth(1)
    c.line(sx - sig_lw / 2, sig_y, sx + sig_lw / 2, sig_y)
    c.setFillColor(GOLD)
    c.circle(sx, sig_y, 3.5, stroke=0, fill=1)

    # Name (or blank line placeholder)
    display_name = name.strip() if name and name.strip() else '______________________'
    c.setFont('Helvetica-Bold', 9)
    c.setFillColor(NAVY)
    c.drawCentredString(sx, sig_y - 16, display_name)

    # Role / title
    c.setFont('Helvetica', 8)
    c.setFillColor(MGREY)
    c.drawCentredString(sx, sig_y - 28, role)

    # Optional second line (e.g. company rep title)
    if title and title.strip():
        c.setFont('Helvetica', 7.5)
        c.setFillColor(MGREY)
        c.drawCentredString(sx, sig_y - 39, title.strip())


class CertificateGenerator:
    """
    Generates a professional PDF certificate for a Certificate model instance.

    Usage:
        gen = CertificateGenerator(certificate)
        relative_path = gen.generate()
        # relative_path → suitable for certificate.pdf_file.name
    """

    def __init__(self, certificate):
        self.cert = certificate
        cert_dir = os.path.join(settings.MEDIA_ROOT, 'certificates')
        os.makedirs(cert_dir, exist_ok=True)
        safe_id        = str(certificate.certificate_id).replace('/', '-')
        self.filename  = f'certificate_{safe_id}.pdf'
        self.filepath  = os.path.join(cert_dir, self.filename)
        self.rel_path  = f'certificates/{self.filename}'

    def generate(self):
        """Generate PDF and return the relative media path."""
        cert      = self.cert
        W, H      = landscape(A4)   # 841.89 × 595.28 pt
        c         = canvas.Canvas(self.filepath, pagesize=landscape(A4))
        logo_path = _get_logo_path()

        # ── Background ───────────────────────────────────────────────────────
        c.setFillColor(CREAM)
        c.rect(0, 0, W, H, stroke=0, fill=1)

        # ── Single thin gold border (navy outer removed for cleaner look) ────
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.2)
        c.rect(14, 14, W - 28, H - 28, stroke=1, fill=0)

        # ── Navy header ──────────────────────────────────────────────────────
        HH = 64
        c.setFillColor(NAVY)
        c.rect(11, H - 11 - HH, W - 22, HH, stroke=0, fill=1)
        _dot_grid(c, 11, H - 11 - HH, W - 22, HH, spacing=14, r=0.65, col=NAVY2)

        # Gold accent stripe below header
        c.setFillColor(GOLD)
        c.rect(11, H - 11 - HH - 4, W - 22, 4, stroke=0, fill=1)

        # ── Logo (real PNG) or drawn fallback ────────────────────────────────
        logo_size = 52   # scaled to fit slimmer header
        logo_x    = 20   # left edge
        logo_y    = H - 11 - HH + (HH - logo_size) / 2

        if logo_path:
            # Draw logo as a circle: clip to a circle then draw square image inside it
            logo_d  = logo_size
            logo_cx = logo_x + logo_d / 2
            logo_cy = logo_y + logo_d / 2
            # White circle background + gold ring (outside clip)
            c.setFillColor(WHITE)
            c.circle(logo_cx, logo_cy, logo_d / 2, stroke=0, fill=1)
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.5)
            c.circle(logo_cx, logo_cy, logo_d / 2, stroke=1, fill=0)
            # saveState → clip to circle → draw image → restoreState
            c.saveState()
            p = c.beginPath()
            p.circle(logo_cx, logo_cy, logo_d / 2 - 1)
            c.clipPath(p, stroke=0, fill=0)
            c.drawImage(
                logo_path,
                logo_x, logo_y,
                width=logo_d, height=logo_d,
                mask='auto',
                preserveAspectRatio=False,
            )
            c.restoreState()
        else:
            # Fallback: drawn concentric circles with "DMU"
            ex, ey = logo_x + logo_size / 2, H - 11 - HH / 2
            for rad, col in [(32, GOLD), (26, NAVY), (20, GOLD), (14, NAVY)]:
                c.setFillColor(col)
                c.circle(ex, ey, rad, stroke=0, fill=1)
            c.setFont('Helvetica-Bold', 10)
            c.setFillColor(GOLD)
            c.drawCentredString(ex, ey - 4, 'DMU')

        # University name text (centred, shifted right to avoid logo)
        c.setFont('Helvetica-Bold', 19)
        c.setFillColor(WHITE)
        c.drawCentredString(W / 2 + 30, H - 11 - 36, 'DEBRE MARKOS UNIVERSITY')
        c.setFont('Helvetica', 9)
        c.setFillColor(GOLD2)
        c.drawCentredString(W / 2 + 30, H - 11 - 54,
            'U N I V E R S I T Y   I N D U S T R Y   L I N K A G E   O F F I C E')

        # ── Certificate title row ─────────────────────────────────────────────
        ty    = H - 11 - HH - 4 - 30
        t_str = ('C E R T I F I C A T E   O F   '
                 'I N T E R N S H I P   C O M P L E T I O N')
        c.setFont('Helvetica-Bold', 10)
        c.setFillColor(NAVY)
        c.drawCentredString(W / 2, ty, t_str)
        tw  = c.stringWidth(t_str, 'Helvetica-Bold', 10)
        gap = 18
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.8)
        c.line(28, ty + 4, W / 2 - tw / 2 - gap, ty + 4)
        c.line(W / 2 + tw / 2 + gap, ty + 4, W - 28, ty + 4)

        # ── Body ──────────────────────────────────────────────────────────────
        body_top = ty - 18

        c.setFont('Helvetica', 11)
        c.setFillColor(MGREY)
        c.drawCentredString(W / 2, body_top, 'This is to certify that')

        # Student name
        c.setFont('Helvetica-Bold', 34)
        c.setFillColor(NAVY)
        c.drawCentredString(W / 2, body_top - 42, cert.student_name)
        nw = c.stringWidth(cert.student_name, 'Helvetica-Bold', 34)
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(W / 2 - nw / 2, body_top - 55, W / 2 + nw / 2, body_top - 55)

        # University ID
        c.setFont('Helvetica', 9)
        c.setFillColor(MGREY)
        c.drawCentredString(W / 2, body_top - 73,
                            f'University ID:  {cert.student_university_id}')

        # Gold dot divider
        for dx in [-14, 0, 14]:
            c.setFillColor(GOLD)
            c.circle(W / 2 + dx, body_top - 89, 2.5, stroke=0, fill=1)

        c.setFont('Helvetica', 12)
        c.setFillColor(DGREY)
        c.drawCentredString(W / 2, body_top - 110,
            'has successfully completed a supervised internship programme as')

        # Position title
        c.setFont('Helvetica-Bold', 20)
        c.setFillColor(NAVY)
        c.drawCentredString(W / 2, body_top - 138, cert.internship_title)

        c.setFont('Helvetica', 12)
        c.setFillColor(DGREY)
        c.drawCentredString(W / 2, body_top - 160, f'at   {cert.company_name}')

        # ── Info pills ────────────────────────────────────────────────────────
        pill_y = body_top - 198
        pill_h = 24
        try:
            dur_str = (f'{cert.start_date.strftime("%b %Y")} – '
                       f'{cert.end_date.strftime("%b %Y")}')
        except Exception:
            dur_str = 'Duration N/A'
        months_str = (f'{cert.duration_months} Month'
                      f'{"s" if cert.duration_months != 1 else ""}')

        pills = [
            (dur_str,              max(140, len(dur_str) * 7 + 30)),
            (months_str,           90),
            (cert.department_name, max(130, len(cert.department_name) * 7 + 30)),
            (cert.advisor_name,    max(130, len(cert.advisor_name) * 7 + 30)),
        ]
        total_pw = sum(p[1] for p in pills) + (len(pills) - 1) * 10
        if total_pw > W - 80:
            scale    = (W - 80) / total_pw
            pills    = [(t, int(w * scale)) for t, w in pills]
            total_pw = sum(p[1] for p in pills) + (len(pills) - 1) * 10
        px = W / 2 - total_pw / 2
        for text, pw in pills:
            _pill(c, px + pw / 2, pill_y, pw, pill_h, text)
            px += pw + 10

        # Grade badge (only shown when grade exists)
        if cert.performance_grade:
            grade_labels = {
                'A': 'Excellent', 'B': 'Very Good',
                'C': 'Good',      'D': 'Pass', 'F': 'Fail',
            }
            g_label = grade_labels.get(cert.performance_grade, cert.performance_grade)
            gcx = W / 2
            gy  = pill_y - 36
            bw, bh = 150, 26
            c.setFillColor(colors.HexColor('#E8F4EB'))
            c.roundRect(gcx - bw / 2, gy, bw, bh, 13, stroke=0, fill=1)
            c.setStrokeColor(colors.HexColor('#7BC47F'))
            c.setLineWidth(1)
            c.roundRect(gcx - bw / 2, gy, bw, bh, 13, stroke=1, fill=0)
            c.setFont('Helvetica-Bold', 10)
            c.setFillColor(colors.HexColor('#1A6B2A'))
            c.drawCentredString(gcx, gy + 8.5,
                                f'Grade:  {cert.performance_grade}  —  {g_label}')

        # ── Signatures ────────────────────────────────────────────────────────
        # Two signatories: Department Head (left) and Company Rep (right)
        sig_y  = 118
        sig_lw = 130

        _draw_signature(
            c, W / 2 - 160, sig_y, sig_lw,
            name=cert.dept_head_name,
            role='Department Head',
        )
        _draw_signature(
            c, W / 2 + 160, sig_y, sig_lw,
            name=cert.company_rep_name,
            role='Company Representative',
            title=cert.company_rep_title,
        )

        # ── Footer ────────────────────────────────────────────────────────────
        FH = 26
        c.setFillColor(NAVY)
        c.rect(11, 11, W - 22, FH, stroke=0, fill=1)
        _dot_grid(c, 11, 11, W - 22, FH, spacing=12, r=0.55, col=NAVY2)
        c.setFillColor(GOLD)
        c.rect(11, 11 + FH, W - 22, 3, stroke=0, fill=1)

        c.setFont('Helvetica', 7.5)
        c.setFillColor(WHITE)
        c.drawString(28, 20, f'Certificate No:  {cert.certificate_id}')
        try:
            issue_str = cert.issue_date.strftime('%B %d, %Y')
        except Exception:
            issue_str = str(cert.issue_date)
        c.drawCentredString(W / 2, 20, f'Issued:  {issue_str}')
        c.drawRightString(W - 28, 20, f'Code:  {cert.verification_code}')

        # QR code
        frontend_url = _get_frontend_url()
        verify_url   = f'{frontend_url}/verify-certificate/{cert.verification_code}'
        qr_size      = 54
        _qr(c, verify_url, W - 28 - qr_size, 11 + FH + 4, size=qr_size)

        c.save()
        return self.rel_path


# ── Public API Function ───────────────────────────────────────────────────────
def generate_certificate_pdf(certificate):
    """
    Generate a PDF certificate for the given Certificate model instance.
    
    Args:
        certificate: Certificate model instance
        
    Returns:
        str: Relative path to the generated PDF file (suitable for FileField)
        
    Usage:
        from apps.certificates.certificate_generator import generate_certificate_pdf
        pdf_path = generate_certificate_pdf(certificate)
        certificate.pdf_file = pdf_path
        certificate.save()
    """
    generator = CertificateGenerator(certificate)
    return generator.generate()