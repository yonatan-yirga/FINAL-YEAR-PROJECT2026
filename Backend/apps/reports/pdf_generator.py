"""
PDF Generator — Internship Reports
Synchronous generation with ReportLab
"""
import os, math
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, KeepTogether,
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor

# ── Fonts ──────────────────────────────────────────────────────────────────────
_GF = '/usr/share/fonts/truetype/google-fonts/'
_SF = '/usr/share/fonts/truetype/liberation/'
try:
    pdfmetrics.registerFont(TTFont('Poppins',      _GF + 'Poppins-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('Poppins-Bold', _GF + 'Poppins-Bold.ttf'))
    pdfmetrics.registerFont(TTFont('Poppins-Med',  _GF + 'Poppins-Medium.ttf'))
    pdfmetrics.registerFont(TTFont('Serif',        _SF + 'LiberationSerif-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('Serif-Bold',   _SF + 'LiberationSerif-Bold.ttf'))
    pdfmetrics.registerFont(TTFont('Serif-Italic', _SF + 'LiberationSerif-Italic.ttf'))
    BODY_FONT  = 'Serif'
    TITLE_FONT = 'Poppins-Bold'
    SANS_FONT  = 'Poppins'
    SANS_MED   = 'Poppins-Med'
    ITALIC_FONT= 'Serif-Italic'
except Exception:
    BODY_FONT  = 'Helvetica'
    TITLE_FONT = 'Helvetica-Bold'
    SANS_FONT  = 'Helvetica'
    SANS_MED   = 'Helvetica-Bold'
    ITALIC_FONT= 'Helvetica-Oblique'

# ── Colours ────────────────────────────────────────────────────────────────────
NAVY       = HexColor('#0F2D5E')
GOLD       = HexColor('#C9A84C')
GOLD_LIGHT = HexColor('#FDF6E3')
BLUE_MID   = HexColor('#2563EB')
LIGHT_BLUE = HexColor('#EFF6FF')
BLUE_BDR   = HexColor('#BFDBFE')
SLATE      = HexColor('#334155')
SLATE_MID  = HexColor('#64748B')
RULE       = HexColor('#CBD5E1')
OFF_WHITE  = HexColor('#F8FAFC')
WHITE      = colors.white

PERF = {
    'EXCELLENT':         (HexColor('#065F46'), HexColor('#D1FAE5')),
    'VERY_GOOD':         (HexColor('#1E40AF'), HexColor('#DBEAFE')),
    'GOOD':              (HexColor('#92400E'), HexColor('#FEF3C7')),
    'NEEDS_IMPROVEMENT': (HexColor('#991B1B'), HexColor('#FEE2E2')),
}

PAGE_W, PAGE_H = A4

# ── Custom Flowables ───────────────────────────────────────────────────────────
class PageBorder(Flowable):
    def draw(self):
        c = self.canv
        m1 = 11*mm
        c.setStrokeColor(NAVY); c.setLineWidth(1.6)
        c.rect(m1, m1, PAGE_W-2*m1, PAGE_H-2*m1)
        m2 = m1 + 2.5*mm
        c.setStrokeColor(GOLD); c.setLineWidth(0.5)
        c.rect(m2, m2, PAGE_W-2*m2, PAGE_H-2*m2)
    def wrap(self, *a): return (0, 0)

class Watermark(Flowable):
    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(HexColor('#C7D2FE'))
        c.setFillAlpha(0.11)
        c.setFont(TITLE_FONT, 44)
        c.translate(PAGE_W/2, PAGE_H/2)
        c.rotate(42)
        c.drawCentredString(0, 0, 'OFFICIAL DOCUMENT')
        c.restoreState()
    def wrap(self, *a): return (0, 0)

def _draw_dmu_logo(canvas, cx, cy, size):
    r = size / 2
    canvas.setFillColor(NAVY);  canvas.circle(cx, cy, r, fill=1, stroke=0)
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(2.2)
    canvas.circle(cx, cy, r-2.5, fill=0, stroke=1)
    canvas.setFillColor(WHITE); canvas.circle(cx, cy, r*0.60, fill=1, stroke=0)
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(0.8)
    canvas.circle(cx, cy, r*0.63, fill=0, stroke=1)
    canvas.setFillColor(NAVY);  canvas.setFont(TITLE_FONT, size*0.21)
    canvas.drawCentredString(cx, cy+size*0.04, 'DMU')
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(0.7)
    canvas.line(cx-size*0.18, cy, cx+size*0.18, cy)
    canvas.setFillColor(SLATE_MID); canvas.setFont(SANS_FONT, size*0.08)
    canvas.drawCentredString(cx, cy-size*0.14, 'EST. 2011')

class Letterhead(Flowable):
    def __init__(self, ref_no, academic_year, doc_date, width, logo_path=None):
        Flowable.__init__(self)
        self.ref_no        = ref_no
        self.academic_year = academic_year
        self.doc_date      = doc_date
        self.width         = width
        self.height        = 105
        self.logo_path     = logo_path

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        logo_size = 100
        lx, ly = 4, (h - logo_size) / 2
        if self.logo_path and os.path.exists(self.logo_path):
            try:
                img = ImageReader(self.logo_path)
                c.drawImage(img, lx, ly, width=logo_size, height=logo_size, mask='auto')
            except: _draw_dmu_logo(c, lx + logo_size/2, h/2, logo_size)
        else: _draw_dmu_logo(c, lx + logo_size/2, h/2, logo_size)

        xd = lx + logo_size + 6
        c.setStrokeColor(GOLD); c.setLineWidth(1.2); c.line(xd, 4, xd, h - 4)
        ref_box_x = w * 0.80; text_start = xd + 8
        c.setFillColor(NAVY); c.setFont(TITLE_FONT, 11); c.drawString(text_start, h-16, 'DEBRE MARKOS UNIVERSITY')
        c.setFont(SANS_MED, 8); c.setFillColor(SLATE); c.drawString(text_start, h-30, 'Office of University Industry Linkage (UIL)')
        c.setFont(SANS_FONT, 8); c.setFillColor(GOLD); c.drawString(text_start, h-44, 'Internship Management System')
        c.setFont(ITALIC_FONT, 8); c.setFillColor(SLATE_MID); c.drawString(text_start, h-62, 'Official Evaluation Report')
        
        bw, bh = w - ref_box_x, h - 8
        c.setFillColor(LIGHT_BLUE); c.setStrokeColor(NAVY); c.setLineWidth(0.5); c.roundRect(ref_box_x, 4, bw, bh, 4, fill=1, stroke=1)
        mcx = ref_box_x + bw/2
        c.setFillColor(NAVY); c.setFont(TITLE_FONT, 6.5); c.drawCentredString(mcx, bh-5, 'DOCUMENT REFERENCE')
        c.setFillColor(BLUE_MID); c.setFont(TITLE_FONT, 7.5); c.drawCentredString(mcx, bh-22, self.ref_no)
        c.setFillColor(SLATE); c.setFont(SANS_FONT, 7); c.drawCentredString(mcx, bh-35, f'Acad. Year: {self.academic_year}')
        c.drawCentredString(mcx, bh-47, f'Date: {self.doc_date}')

    def wrap(self, avail_w, avail_h): return (self.width, self.height)

class SectionHeader(Flowable):
    def __init__(self, title, width):
        Flowable.__init__(self); self.title = title; self.width = width; self.height = 26
    def draw(self):
        c = self.canv; c.setFillColor(NAVY); c.roundRect(0, 0, self.width, self.height, 3, fill=1, stroke=0)
        c.setFillColor(GOLD); c.rect(0, 0, 4, self.height, fill=1, stroke=0)
        c.setFillColor(WHITE); c.setFont(TITLE_FONT, 9.5); c.drawString(13, 8, self.title.upper())
    def wrap(self, avail_w, avail_h): return (self.width, self.height)

class SignatureBlock(Flowable):
    def __init__(self, signatories, width):
        Flowable.__init__(self); self.signatories = signatories; self.width = width; self.height = 72
    def draw(self):
        c = self.canv; cw = self.width / len(self.signatories)
        for i, (name, title, dt) in enumerate(self.signatories):
            x = i*cw + cw*0.08; lw = cw*0.84; c.setStrokeColor(SLATE); c.setLineWidth(0.7); c.line(x, 38, x+lw, 38)
            c.setFillColor(NAVY); c.setFont(TITLE_FONT, 8); c.drawCentredString(x+lw/2, 26, name)
            c.setFillColor(SLATE_MID); c.setFont(SANS_FONT, 7.5); c.drawCentredString(x+lw/2, 15, title)
            c.setFont(SANS_FONT, 7); c.drawCentredString(x+lw/2, 5, dt)
    def wrap(self, avail_w, avail_h): return (self.width, self.height)

def _styles():
    return {
        'doc_title':    ParagraphStyle('dt',  fontName=TITLE_FONT, fontSize=14, textColor=NAVY, alignment=TA_CENTER, spaceAfter=2),
        'doc_subtitle': ParagraphStyle('ds',  fontName=ITALIC_FONT,fontSize=10, textColor=SLATE_MID, alignment=TA_CENTER, spaceAfter=4),
        'label':        ParagraphStyle('lb',  fontName=TITLE_FONT, fontSize=8,  textColor=SLATE_MID),
        'value':        ParagraphStyle('vl',  fontName=SANS_FONT,  fontSize=9.5,textColor=SLATE),
        'body':         ParagraphStyle('bd',  fontName=BODY_FONT,  fontSize=10, textColor=SLATE, leading=14, alignment=TA_JUSTIFY),
        'footer':       ParagraphStyle('ft',  fontName=SANS_FONT,  fontSize=7.5,textColor=SLATE_MID, alignment=TA_CENTER),
        'stat_val':     ParagraphStyle('sv',  fontName=TITLE_FONT, fontSize=22, textColor=NAVY,  alignment=TA_CENTER),
        'stat_lbl':     ParagraphStyle('sl',  fontName=SANS_FONT,  fontSize=7.5,textColor=SLATE_MID, alignment=TA_CENTER),
    }

def _info_tbl(rows, col_widths):
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([('FONTNAME',(0,0),(0,-1),TITLE_FONT),('FONTSIZE',(0,0),(-1,-1),9),('TEXTCOLOR',(0,0),(0,-1),SLATE_MID),('ROWBACKGROUNDS',(0,0),(-1,-1),[WHITE,OFF_WHITE]),('GRID',(0,0),(-1,-1),0.4,RULE),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    return t

def _text_block(text, S, width):
    t = Table([[Paragraph(text or '—', S['body'])]], colWidths=[width-0.01])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),OFF_WHITE),('BOX',(0,0),(-1,-1),0.6,RULE),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]))
    return t

def _build_final(filepath, logo_path, ref_no, academic_year, submitted_str,
                 student_name, university_id, dept_name,
                 company_name, advisor_name, position,
                 start_date, end_date, duration,
                 # State 1: Company
                 company_submitted, company_assessment, company_recommendation, company_score,
                 # Stage 2: Advisor
                 advisor_submitted, advisor_evaluation, criteria_scores, advisor_score,
                 # Final
                 total_score, overall_grade, grade_label):

    S         = _styles()
    buf       = BytesIO()
    content_w = PAGE_W - 2.0 * inch
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=1.05*inch, rightMargin=0.95*inch, topMargin=0.55*inch, bottomMargin=0.75*inch)
    story = [Watermark(), PageBorder(), Letterhead(ref_no, academic_year, submitted_str, content_w, logo_path), Spacer(1, 4), HRFlowable(width='100%', thickness=2, color=NAVY, spaceAfter=8), Paragraph('Final Internship Evaluation Report', S['doc_title']), Paragraph(f'{position} \u00b7 {company_name} \u00b7 {duration}', S['doc_subtitle']), Spacer(1, 10)]

    story.append(SectionHeader('Section 1 — Participant Information', content_w))
    cw2 = content_w / 2
    wrapper = Table([[
        _info_tbl([[Paragraph('STUDENT NAME', S['label']), Paragraph(student_name, S['value'])], [Paragraph('UNIVERSITY ID', S['label']), Paragraph(university_id, S['value'])], [Paragraph('DEPARTMENT', S['label']), Paragraph(dept_name, S['value'])]], [1.2*inch, cw2-1.2*inch]),
        _info_tbl([[Paragraph('COMPANY', S['label']), Paragraph(company_name, S['value'])], [Paragraph('POSITION', S['label']), Paragraph(position, S['value'])], [Paragraph('ADVISOR', S['label']), Paragraph(advisor_name, S['value'])]], [1.2*inch, cw2-1.2*inch])
    ]], colWidths=[cw2, cw2])
    story.append(wrapper); story.append(Spacer(1, 14))

    # STAGE 1: Company
    _STAGE_W = content_w * 0.75
    story.append(Table([[Paragraph('STAGE 1 — INDUSTRY SUPERVISOR EVALUATION (50%)', ParagraphStyle('s1', fontName=TITLE_FONT, fontSize=8, textColor=WHITE)), Paragraph(f'Submitted: {company_submitted}', ParagraphStyle('s1r', fontName=SANS_FONT, fontSize=7.5, textColor=GOLD_LIGHT, alignment=TA_RIGHT))]], colWidths=[_STAGE_W*0.7, _STAGE_W*0.3], style=[('BACKGROUND',(0,0),(-1,-1),BLUE_MID),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story.append(Spacer(1, 8))
    rec_colors = {'YES': (HexColor('#065F46'), HexColor('#D1FAE5')), 'NO': (HexColor('#991B1B'), HexColor('#FEE2E2')), 'CONDITIONAL': (HexColor('#92400E'), HexColor('#FEF3C7'))}
    rec_fg, rec_bg = rec_colors.get(company_recommendation, (NAVY, LIGHT_BLUE))
    metrics = Table([[Paragraph({'YES':'Recommended','NO':'Not Recommended'}.get(company_recommendation, company_recommendation), ParagraphStyle('r', fontName=TITLE_FONT, fontSize=11, textColor=rec_fg, alignment=1)), Paragraph(f'Industry Score: {company_score}/100', ParagraphStyle('s', fontName=TITLE_FONT, fontSize=11, textColor=NAVY, alignment=1))]], colWidths=[content_w/2, content_w/2])
    metrics.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),rec_bg),('BACKGROUND',(1,0),(1,0),LIGHT_BLUE),('BOX',(0,0),(-1,-1),0.6,RULE),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    story.append(metrics); story.append(Spacer(1, 8)); story.append(Paragraph('INDUSTRY PERFORMANCE ASSESSMENT', S['label'])); story.append(_text_block(company_assessment, S, content_w)); story.append(Spacer(1, 14))

    # STAGE 2: Advisor
    story.append(Table([[Paragraph('STAGE 2 — ACADEMIC ADVISOR EVALUATION (50%)', ParagraphStyle('s2', fontName=TITLE_FONT, fontSize=8, textColor=WHITE)), Paragraph(f'Submitted: {advisor_submitted or "Pending"}', ParagraphStyle('s2r', fontName=SANS_FONT, fontSize=7.5, textColor=GOLD_LIGHT, alignment=TA_RIGHT))]], colWidths=[_STAGE_W*0.7, _STAGE_W*0.3], style=[('BACKGROUND',(0,0),(-1,-1),HexColor('#6D28D9')),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story.append(Spacer(1, 8))
    if criteria_scores:
        labels = {'technical': 'Technical Prof.', 'academic': 'Academic Int.', 'quality': 'Report Quality', 'growth': 'Growth', 'soft_skills': 'Soft Skills'}
        c_data = [['CRITERION', 'SCORE / 20']] + [[labels.get(k, k).upper(), f'{v} / 20'] for k, v in criteria_scores.items()]
        ct = Table(c_data, colWidths=[content_w*0.7, content_w*0.3]); ct.setStyle(TableStyle([('FONTNAME',(0,0),(-1,0),TITLE_FONT),('GRID',(0,0),(-1,-1),0.5,RULE),('ALIGN',(1,0),(1,-1),'CENTER')]))
        story.append(ct); story.append(Spacer(1, 8))
    story.append(Paragraph('ADVISOR QUALITATIVE EVALUATION', S['label'])); story.append(_text_block(advisor_evaluation, S, content_w)); story.append(Spacer(1, 14))

    # Final Result
    story.append(SectionHeader('Section 4 — Final Academic Result', content_w)); story.append(Spacer(1, 8))
    grade_colors = {'A': (HexColor('#065F46'), HexColor('#D1FAE5')), 'B': (HexColor('#1E40AF'), HexColor('#DBEAFE')), 'C': (HexColor('#92400E'), HexColor('#FEF3C7')), 'D': (HexColor('#6B7280'), HexColor('#F3F4F6')), 'F': (HexColor('#991B1B'), HexColor('#FEE2E2'))}
    gfg, gbg = grade_colors.get(overall_grade, (NAVY, LIGHT_BLUE))
    res_t = Table([[Paragraph(f'Total Score: {total_score:.1f}/100', S['stat_val']), Paragraph(f'Final Grade: {overall_grade} ({grade_label})', ParagraphStyle('gv', fontName=TITLE_FONT, fontSize=18, textColor=gfg, alignment=1))]], colWidths=[content_w/2, content_w/2])
    res_t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),LIGHT_BLUE),('BACKGROUND',(1,0),(1,0),gbg),('BOX',(0,0),(-1,-1),1,gfg),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    story.append(res_t); story.append(Spacer(1, 20))
    story.append(SignatureBlock([(advisor_name, 'Academic Advisor', advisor_submitted or ''), ('_________________', 'Department Head', '')], content_w))
    story.append(Spacer(1, 20)); story.append(Paragraph(f'Debre Markos University · ref: {ref_no} · Generated: {submitted_str}', S['footer']))

    doc.build(story)
    with open(filepath, 'wb') as f: f.write(buf.getvalue())

def generate_final_report_pdf(report):
    from django.conf import settings
    student_dir = os.path.join(settings.MEDIA_ROOT, 'reports', 'final', str(report.student.id))
    os.makedirs(student_dir, exist_ok=True)
    filepath = os.path.join(student_dir, 'final_report.pdf')
    logo = os.path.join(settings.BASE_DIR, 'static', 'images', 'dmu_logo.png')
    sub_at = report.advisor_submitted_at or report.company_submitted_at
    grade_labels = {'A': 'Excellent', 'B': 'Very Good', 'C': 'Good', 'D': 'Pass', 'F': 'Fail'}
    _build_final(filepath=filepath, logo_path=logo if os.path.exists(logo) else None, ref_no=f'DMU-IMS-FR-{sub_at.year}-{report.id}', academic_year=f'{sub_at.year-1}/{sub_at.year}', submitted_str=sub_at.strftime('%B %d, %Y'), student_name=report.student.get_full_name(), university_id=getattr(report.student.student_profile, 'university_id', '—'), dept_name=getattr(report.student.department, 'name', '—'), company_name=getattr(report.company.company_profile, 'company_name', getattr(report.company, 'email', '—')), advisor_name=report.advisor.get_full_name(), position=getattr(report.advisor_assignment.internship, 'title', 'Intern'), start_date=report.advisor_assignment.internship.start_date.strftime('%Y-%m-%d'), end_date=report.advisor_assignment.internship.end_date.strftime('%Y-%m-%d'), duration=f"{report.advisor_assignment.internship.duration_months} Months", company_submitted=report.company_submitted_at.strftime('%Y-%m-%d') if report.company_submitted_at else '—', company_assessment=report.company_performance_assessment, company_recommendation=report.company_recommendation, company_score=report.company_score, advisor_submitted=report.advisor_submitted_at.strftime('%Y-%m-%d') if report.advisor_submitted_at else '—', advisor_evaluation=report.advisor_evaluation, criteria_scores=report.criteria_scores, advisor_score=report.advisor_score, total_score=report.total_score, overall_grade=report.overall_grade, grade_label=grade_labels.get(report.overall_grade, '—'))
    return f'reports/final/{report.student.id}/final_report.pdf'

def generate_monthly_report_pdf(report):
    """Generates a single monthly report PDF (Company evaluation)."""
    from django.conf import settings
    S = _styles()
    buf = BytesIO()
    content_w = PAGE_W - 2.0 * inch
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=1.05*inch, rightMargin=0.95*inch, topMargin=0.55*inch, bottomMargin=0.75*inch)
    
    student_name = report.student.get_full_name()
    company_name = getattr(report.company.company_profile, 'company_name', report.company.email)
    
    # Logo resolution
    logo = os.path.join(settings.BASE_DIR, 'static', 'images', 'dmu_logo.png')
    logo_path = logo if os.path.exists(logo) else None
    
    story = [
        Watermark(), 
        PageBorder(), 
        Letterhead(f'DMU-IMS-MON-{report.id}', f'2023/2024', report.submitted_at.strftime('%Y-%m-%d'), content_w, logo_path), 
        Spacer(1, 10),
        Paragraph(f'Monthly Progress Evaluation — Month {report.report_month}', S['doc_title']),
        Paragraph(f'Student: {student_name} \u00b7 Company: {company_name}', S['doc_subtitle']),
        Spacer(1, 15)
    ]

    story.append(SectionHeader(f'Section 1 — Industry Performance Review', content_w))
    story.append(Spacer(1, 10))
    
    perf_fg, perf_bg = PERF.get(report.performance_rating, (SLATE, LIGHT_BLUE))
    
    stats = Table([[
        Paragraph(f'{report.attendance_rate}%', S['stat_val']),
        Paragraph(report.get_performance_rating_display(), ParagraphStyle('p', fontName=TITLE_FONT, fontSize=14, textColor=perf_fg, alignment=1))
    ]], colWidths=[content_w/2, content_w/2])
    stats.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), LIGHT_BLUE),
        ('BACKGROUND', (1,0), (1,0), perf_bg),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, RULE)
    ]))
    story.append(stats)
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('TASKS COMPLETED & MILESTONES:', S['label']))
    story.append(_text_block(report.tasks_completed, S, content_w))
    
    story.append(Spacer(1, 14))
    story.append(SectionHeader('Section 2 — Scoring Breakdown', content_w))
    story.append(Spacer(1, 8))
    
    c_data = [
        ['CRITERION', 'SCORE / 10'],
        ['TASK COMPLETION', f'{report.task_completion_score} / 10'],
        ['SKILL DEVELOPMENT', f'{report.skill_development_score} / 10'],
        ['PROBLEM SOLVING', f'{report.problem_solving_score} / 10'],
        ['PROFESSIONALISM', f'{report.professionalism_score} / 10'],
        ['OVERALL AVG', f'{(report.task_completion_score + report.skill_development_score + report.problem_solving_score + report.professionalism_score)/4} / 10']
    ]
    ct = Table(c_data, colWidths=[content_w*0.7, content_w*0.3])
    ct.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,0), TITLE_FONT),
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('GRID', (0,0), (-1,-1), 0.5, RULE),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, OFF_WHITE])
    ]))
    story.append(ct)
    
    if report.comments:
        story.append(Spacer(1, 14))
        story.append(Paragraph('SUPERVISOR COMMENTS:', S['label']))
        story.append(_text_block(report.comments, S, content_w))

    story.append(Spacer(1, 40))
    story.append(SignatureBlock([
        (report.submitted_by.get_full_name() if report.submitted_by else company_name, 'Industry Supervisor', report.submitted_at.strftime('%Y-%m-%d')),
        ('_________________', 'Student Acknowledgment', '')
    ], content_w))

    doc.build(story)
    
    # Save to file
    save_dir = os.path.join(settings.MEDIA_ROOT, 'reports', 'monthly')
    os.makedirs(save_dir, exist_ok=True)
    filename = f'{report.id}_monthly.pdf'
    filepath = os.path.join(save_dir, filename)
    
    with open(filepath, 'wb') as f:
        f.write(buf.getvalue())
        
    return f'reports/monthly/{filename}'

def generate_consolidated_report_pdf(assignment, company_reports, student_reports):
    """
    Generates a single PDF containing all monthly reports for a student.
    Organized by Month.
    """
    from django.conf import settings
    S = _styles()
    buf = BytesIO()
    content_w = PAGE_W - 2.0 * inch
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=1.05*inch, rightMargin=0.95*inch, topMargin=0.55*inch, bottomMargin=0.75*inch)
    
    student_name = assignment.student.get_full_name()
    company_name = getattr(assignment.internship.company.company_profile, 'company_name', assignment.internship.company.email)
    
    # Logo resolution
    logo = os.path.join(settings.BASE_DIR, 'static', 'images', 'dmu_logo.png')
    logo_path = logo if os.path.exists(logo) else None
    
    story = [
        Watermark(), 
        PageBorder(), 
        Letterhead(f'DMU-IMS-CON-{assignment.id}', '2023/2024', 'Consolidated', content_w, logo_path), 
        Spacer(1, 10),
        Paragraph('Consolidated Monthly Progress Report', S['doc_title']),
        Paragraph(f'Student: {student_name} \u00b7 Company: {company_name}', S['doc_subtitle']),
        Spacer(1, 15)
    ]

    # Group by month
    months = sorted(list(set(
        [r.report_month for r in company_reports] + 
        [r.report_month for r in student_reports]
    )))

    for m in months:
        story.append(SectionHeader(f'Month {m} Evaluation & Progress', content_w))
        story.append(Spacer(1, 10))
        
        # Company Report
        creport = next((r for r in company_reports if r.report_month == m), None)
        if creport:
            story.append(Paragraph('INDUSTRY SUPERVISOR EVALUATION', S['label']))
            story.append(Spacer(1, 4))
            
            perf_fg, perf_bg = PERF.get(creport.performance_rating, (SLATE, LIGHT_BLUE))
            
            stats = Table([[
                Paragraph(f'{creport.attendance_rate}%', S['stat_val']),
                Paragraph(creport.get_performance_rating_display(), ParagraphStyle('p', fontName=TITLE_FONT, fontSize=14, textColor=perf_fg, alignment=1))
            ]], colWidths=[content_w/2, content_w/2])
            stats.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,0), LIGHT_BLUE),
                ('BACKGROUND', (1,0), (1,0), perf_bg),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOX', (0,0), (-1,-1), 0.5, RULE)
            ]))
            story.append(stats)
            story.append(Spacer(1, 8))
            story.append(Paragraph('Tasks Completed (Company Review):', S['label']))
            story.append(_text_block(creport.tasks_completed, S, content_w))
            if creport.comments:
                story.append(Spacer(1, 8))
                story.append(Paragraph('Company Comments:', S['label']))
                story.append(_text_block(creport.comments, S, content_w))
        else:
            story.append(Paragraph('No company evaluation submitted for this month.', S['body']))

        story.append(Spacer(1, 15))

        # Student Report
        sreport = next((r for r in student_reports if r.report_month == m), None)
        if sreport:
            story.append(Paragraph('STUDENT SELF-REPORT', S['label']))
            story.append(Spacer(1, 4))
            
            story.append(Paragraph('Tasks Performed:', S['label']))
            story.append(_text_block(sreport.tasks_performed, S, content_w))
            
            story.append(Spacer(1, 8))
            story.append(Paragraph('Skills Learned & Challenges:', S['label']))
            story.append(_info_tbl([
                [Paragraph('SKILLS', S['label']), Paragraph(sreport.skills_learned, S['value'])],
                [Paragraph('CHALLENGES', S['label']), Paragraph(sreport.challenges_faced, S['value'])],
                [Paragraph('SOLUTIONS', S['label']), Paragraph(sreport.solutions_applied, S['value'])]
            ], [1.2*inch, content_w-1.2*inch]))
        else:
            story.append(Paragraph('No student self-report submitted for this month.', S['body']))

        story.append(Spacer(1, 24))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE))
        story.append(Spacer(1, 24))

    doc.build(story)
    
    # Save to file
    student_dir = os.path.join(settings.MEDIA_ROOT, 'reports', 'consolidated', str(assignment.student.id))
    os.makedirs(student_dir, exist_ok=True)
    filepath = os.path.join(student_dir, f'consolidated_reports_{assignment.id}.pdf')
    
    with open(filepath, 'wb') as f:
        f.write(buf.getvalue())
        
    return f'reports/consolidated/{assignment.student.id}/consolidated_reports_{assignment.id}.pdf'