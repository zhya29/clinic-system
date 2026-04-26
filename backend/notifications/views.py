from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import Notification, send_appointment_reminders


class NotificationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.full_name', read_only=True)

    class Meta:
        model  = Notification
        fields = '__all__'


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Notification.objects.all()[:50]
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['post'])
    def send_reminders(self, request):
        result = send_appointment_reminders()
        return Response({'message': result})

    @action(detail=False, methods=['get'])
    def unsent(self, request):
        qs = Notification.objects.filter(is_sent=False)
        return Response({'count': qs.count()})


router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')
urlpatterns = [path('', include(router.urls))]
