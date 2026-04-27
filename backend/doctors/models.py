from django.db import models
from django.contrib.auth.models import User

class Clinic(models.Model):
    name = models.CharField(max_length=200, verbose_name='ناوی کلینیک')
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Department(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=200, verbose_name='ناوی بەش')
    description = models.TextField(blank=True, verbose_name='وەسف')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} — {self.clinic.name}'

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='doctors')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors', verbose_name='بەش')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100, verbose_name='پسپۆڕی')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['first_name']

    def __str__(self):
        return f'د. {self.first_name} {self.last_name}'

    @property
    def full_name(self):
        return f'د. {self.first_name} {self.last_name}'
