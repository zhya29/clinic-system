from django.db import models

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'نێر'),
        ('F', 'مێ'),
        ('O', 'تر'),
    ]
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    first_name = models.CharField(max_length=100, verbose_name='ناوی یەکەم')
    last_name = models.CharField(max_length=100, verbose_name='ناوی کۆتایی')
    date_of_birth = models.DateField(verbose_name='بەرواری لەدایکبوون')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name='ڕەگەز')
    phone = models.CharField(max_length=20, verbose_name='ژمارەی تەلەفۆن')
    address = models.TextField(blank=True, verbose_name='ناونیشان')
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True, verbose_name='گرووپی خوێن')
    allergies = models.TextField(blank=True, verbose_name='هەستیاری')
    medical_history = models.TextField(blank=True, verbose_name='مێژووی نەخۆشی')
    emergency_contact_name = models.CharField(max_length=100, blank=True, verbose_name='ناوی پەیوەندیکاری بەپەلە')
    emergency_contact_phone = models.CharField(max_length=20, blank=True, verbose_name='تەلەفۆنی بەپەلە')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'نەخۆش'
        verbose_name_plural = 'نەخۆشەکان'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    @property
    def age(self):
        from datetime import date
        today = date.today()
        dob = self.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
