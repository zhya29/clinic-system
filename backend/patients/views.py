from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'phone']
    ordering_fields = ['created_at', 'first_name', 'last_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return PatientListSerializer
        return PatientSerializer

    def get_queryset(self):
        queryset = Patient.objects.filter(is_active=True)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Patient.objects.filter(is_active=True).count()
        male = Patient.objects.filter(is_active=True, gender='M').count()
        female = Patient.objects.filter(is_active=True, gender='F').count()
        from datetime import date, timedelta
        today = date.today()
        new_this_month = Patient.objects.filter(
            created_at__year=today.year,
            created_at__month=today.month
        ).count()
        return Response({
            'total': total,
            'male': male,
            'female': female,
            'new_this_month': new_this_month,
        })

    def destroy(self, request, *args, **kwargs):
        patient = self.get_object()
        patient.is_active = False
        patient.save()
        return Response({'message': 'نەخۆش سڕایەوە'}, status=status.HTTP_200_OK)
