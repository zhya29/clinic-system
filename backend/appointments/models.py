from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'چاوەڕوان'),
        ('active', 'چالاک'),
        ('done', 'تەواو'),
        ('cancelled', 'هەڵوەشاوە'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField(verbose_name='بەروار')
    time = models.TimeField(verbose_name='کاتژمێر')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    notes = models.TextField(blank=True, verbose_name='تێبینی')
    diagnosis = models.TextField(blank=True, verbose_name='دیاریکردنی نەخۆشی')
    prescription = models.TextField(blank=True, verbose_name='دەرمان')
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='کرێ')
    is_paid = models.BooleanField(default=False, verbose_name='پارەدراوە')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'نوێنەری کات'
        verbose_name_plural = 'نوێنەرییەکانی کات'
        ordering = ['-date', '-time']

    def __str__(self):
        return f'{self.patient} - {self.doctor} - {self.date}'
