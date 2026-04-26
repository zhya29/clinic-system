from rest_framework import serializers, viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from datetime import date
from .models import Appointment
from patients.serializers import PatientListSerializer
from doctors.views import DoctorSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient', 'doctor').all()
    serializer_class = AppointmentSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'time', 'status']

    def get_queryset(self):
        queryset = super().get_queryset()
        date_filter = self.request.query_params.get('date')
        doctor_id = self.request.query_params.get('doctor')
        status_filter = self.request.query_params.get('status')

        if date_filter:
            queryset = queryset.filter(date=date_filter)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @action(detail=False, methods=['get'])
    def today(self, request):
        today_appointments = self.get_queryset().filter(date=date.today())
        serializer = self.get_serializer(today_appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = date.today()
        return Response({
            'today_total': Appointment.objects.filter(date=today).count(),
            'today_waiting': Appointment.objects.filter(date=today, status='waiting').count(),
            'today_done': Appointment.objects.filter(date=today, status='done').count(),
            'today_revenue': sum(
                a.fee for a in Appointment.objects.filter(date=today, is_paid=True)
            ),
        })

router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointment')
urlpatterns = [path('', include(router.urls))]
