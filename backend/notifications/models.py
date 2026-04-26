from django.db import models
from appointments.models import Appointment


class Notification(models.Model):
    TYPE_CHOICES = [
        ('appointment_reminder', 'یادخستنەوەی کاتژمێر'),
        ('payment_due',          'پارەدانی ماوە'),
        ('general',              'گشتی'),
    ]

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE,
                                    null=True, blank=True, related_name='notifications')
    type        = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    title       = models.CharField(max_length=200)
    message     = models.TextField()
    is_sent     = models.BooleanField(default=False)
    sent_at     = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} — {self.created_at.date()}'


# ─── یادخستنەوەی ئۆتۆماتیک ──────────────────────────────────
# ئەمە بە django-crontab یان celery-beat هەموو ڕۆژێک جێبەجێ بکە

def send_appointment_reminders():
    """هەموو نەخۆشێک یادی کاتژمێری سبەینەی بکەرەوە"""
    from datetime import date, timedelta
    from django.utils import timezone

    tomorrow = date.today() + timedelta(days=1)
    appts = Appointment.objects.filter(
        date=tomorrow,
        status__in=['waiting', 'active']
    ).select_related('patient', 'doctor')

    created = 0
    for appt in appts:
        # ئەگەر ئاگادارکردنەوەی ئەم کاتژمێرە نەنێردراوێت
        already = Notification.objects.filter(
            appointment=appt,
            type='appointment_reminder',
            is_sent=True
        ).exists()
        if not already:
            n = Notification.objects.create(
                appointment=appt,
                type='appointment_reminder',
                title=f'یادخستنەوەی کاتژمێر — {appt.patient.full_name}',
                message=(
                    f'بەڕێز {appt.patient.full_name}،\n'
                    f'کاتژمێرەکەت لەگەڵ {appt.doctor.full_name} '
                    f'سبەینە {appt.date} کاتژمێر {str(appt.time)[:5]}ە.\n'
                    f'تکایە کاتی ڕاگەیشتن.'
                ),
            )
            # ئێرە SMS یان ئیمەیل بنێرە — تەلەفۆن: appt.patient.phone
            n.is_sent = True
            n.sent_at = timezone.now()
            n.save()
            created += 1

    return f'{created} ئاگادارکردنەوە نێردرا'
