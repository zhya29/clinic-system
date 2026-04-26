from django.db import models
from appointments.models import Appointment
from patients.models import Patient

class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash',   'کاش'),
        ('card',   'کارتی بانکی'),
        ('online', 'ئۆنلاین'),
    ]
    STATUS_CHOICES = [
        ('paid',    'پارەدراوە'),
        ('pending', 'چاوەڕوان'),
        ('refunded','گەڕاوەتەوە'),
    ]

    appointment = models.OneToOneField(
        Appointment, on_delete=models.CASCADE,
        related_name='payment', null=True, blank=True
    )
    patient     = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='payments')
    amount      = models.DecimalField(max_digits=10, decimal_places=2)
    method      = models.CharField(max_length=10, choices=METHOD_CHOICES, default='cash')
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    invoice_no  = models.CharField(max_length=20, unique=True, blank=True)
    notes       = models.TextField(blank=True)
    paid_at     = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'فاکتوور #{self.invoice_no} — {self.patient}'

    def save(self, *args, **kwargs):
        if not self.invoice_no:
            import random, string
            self.invoice_no = 'INV-' + ''.join(random.choices(string.digits, k=6))
        super().save(*args, **kwargs)
