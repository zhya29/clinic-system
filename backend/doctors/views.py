from rest_framework import serializers, viewsets
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import Doctor, Clinic

# --- Serializers ---
class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'

# --- Views ---
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.filter(is_active=True).select_related('clinic')
    serializer_class = DoctorSerializer

class ClinicViewSet(viewsets.ModelViewSet):
    queryset = Clinic.objects.filter(is_active=True)
    serializer_class = ClinicSerializer

# --- URLs ---
router = DefaultRouter()
router.register(r'clinics', ClinicViewSet, basename='clinic')
router.register(r'', DoctorViewSet, basename='doctor')

urlpatterns = [path('', include(router.urls))]
