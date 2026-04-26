from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import Payment

# ── Serializer ──────────────────────────────────────────────
class PaymentSerializer(serializers.ModelSerializer):
    patient_name     = serializers.CharField(source='patient.full_name', read_only=True)
    appointment_date = serializers.DateField(source='appointment.date', read_only=True)
    appointment_time = serializers.TimeField(source='appointment.time', read_only=True)
    doctor_name      = serializers.CharField(source='appointment.doctor.full_name', read_only=True)

    class Meta:
        model  = Payment
        fields = '__all__'

# ── ViewSet ──────────────────────────────────────────────────
class PaymentViewSet(viewsets.ModelViewSet):
    queryset           = Payment.objects.select_related('patient', 'appointment').all()
    serializer_class   = PaymentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_f = self.request.query_params.get('status')
        patient  = self.request.query_params.get('patient')
        if status_f: qs = qs.filter(status=status_f)
        if patient:  qs = qs.filter(patient_id=patient)
        return qs

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        payment = self.get_object()
        payment.status  = 'paid'
        payment.paid_at = timezone.now()
        payment.save()
        # appointment is_paid نوێ بکەرەوە
        if payment.appointment:
            payment.appointment.is_paid = True
            payment.appointment.save()
        return Response({'message': 'پارەدان تۆمارکرا', 'invoice_no': payment.invoice_no})

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'refunded'
        payment.save()
        return Response({'message': 'گەڕاندنەوەی پارە تۆمارکرا'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.db.models import Sum
        from datetime import date
        today = date.today()
        qs    = Payment.objects.filter(status='paid')
        return Response({
            'today_revenue': float(qs.filter(paid_at__date=today).aggregate(Sum('amount'))['amount__sum'] or 0),
            'total_revenue': float(qs.aggregate(Sum('amount'))['amount__sum'] or 0),
            'pending_count': Payment.objects.filter(status='pending').count(),
            'paid_count':    qs.count(),
        })

# ── URLs ─────────────────────────────────────────────────────
router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')
urlpatterns = [path('', include(router.urls))]
