from rest_framework import serializers, viewsets
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import Doctor, Clinic, Department

# --- Serializers ---
class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    doctor_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_doctor_count(self, obj):
        return obj.doctors.filter(is_active=True).count()

class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'

# --- Views ---
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.filter(is_active=True).select_related('clinic', 'department')
    serializer_class = DoctorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        dept = self.request.query_params.get('department')
        if dept:
            qs = qs.filter(department_id=dept)
        return qs

class ClinicViewSet(viewsets.ModelViewSet):
    queryset = Clinic.objects.filter(is_active=True)
    serializer_class = ClinicSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.filter(is_active=True).select_related('clinic')
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        clinic = self.request.query_params.get('clinic')
        if clinic:
            qs = qs.filter(clinic_id=clinic)
        return qs

# --- URLs ---
router = DefaultRouter()
router.register(r'clinics', ClinicViewSet, basename='clinic')
router.register(r'', DoctorViewSet, basename='doctor')

urlpatterns = [path('', include(router.urls))]
