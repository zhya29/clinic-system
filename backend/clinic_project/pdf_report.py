from django.http import HttpResponse
from django.utils import timezone
from rest_framework.decorators import api_view
from datetime import date, timedelta
import io

@api_view(['GET'])
def monthly_report_pdf(request):
    """راپۆرتی مانگانە بە PDF"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
    except ImportError:
        return HttpResponse('pip install reportlab پێویستە', status=500)

    from appointments.models import Appointment
    from patients.models import Patient
    from payments.models import Payment

    # داتاکان
    today = date.today()
    first_day = today.replace(day=1)

    appts   = Appointment.objects.filter(date__gte=first_day, date__lte=today)
    pays    = Payment.objects.filter(status='paid', paid_at__date__gte=first_day)
    revenue = sum(float(p.amount) for p in pays)
    new_pts = Patient.objects.filter(created_at__date__gte=first_day).count()

    # PDF دروستکردن
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    title_style  = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, spaceAfter=12, alignment=1)
    normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=11, spaceAfter=6)

    story = []

    # سەردێڕ
    story.append(Paragraph('🏥 Clinic System — Monthly Report', title_style))
    story.append(Paragraph(f'Report Period: {first_day} → {today}', normal_style))
    story.append(Spacer(1, 0.5*cm))

    # ئامارە گشتییەکان
    summary_data = [
        ['Metric', 'Value'],
        ['Total Appointments', str(appts.count())],
        ['Completed',          str(appts.filter(status='done').count())],
        ['Waiting/Active',     str(appts.filter(status__in=['waiting','active']).count())],
        ['New Patients',       str(new_pts)],
        ['Total Revenue',      f'${revenue:.2f}'],
        ['Paid Invoices',      str(pays.count())],
    ]
    t = Table(summary_data, colWidths=[10*cm, 6*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#534AB7')),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('FONTSIZE',   (0,0), (-1,0), 12),
        ('ALIGN',      (0,0), (-1,-1), 'CENTER'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('FONTSIZE', (0,1), (-1,-1), 11),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5*cm))

    # کاتژمێرەکانی دوایی
    story.append(Paragraph('Recent Appointments', ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13)))
    appt_data = [['Patient', 'Doctor', 'Date', 'Status', 'Fee']]
    for a in appts.order_by('-date')[:15]:
        appt_data.append([
            a.patient.full_name[:20],
            a.doctor.full_name[:20],
            str(a.date),
            a.get_status_display(),
            f'${a.fee}',
        ])
    if len(appt_data) > 1:
        t2 = Table(appt_data, colWidths=[5*cm, 4*cm, 3*cm, 3*cm, 3*cm])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a1a2e')),
            ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t2)

    # کۆتایی
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph(f'Generated: {timezone.now().strftime("%Y-%m-%d %H:%M")}', normal_style))

    doc.build(story)
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="clinic_report_{today}.pdf"'
    return response
