from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, ClinicViewSet, DepartmentViewSet

router = DefaultRouter()
router.register(r'clinics', ClinicViewSet, basename='clinic')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'', DoctorViewSet, basename='doctor')
urlpatterns = [path('', include(router.urls))]
