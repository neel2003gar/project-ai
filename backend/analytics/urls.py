from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DatasetViewSet, AnalysisViewSet, VisualizationViewSet

router = DefaultRouter()
router.register(r'datasets', DatasetViewSet)
router.register(r'analyses', AnalysisViewSet)
router.register(r'visualizations', VisualizationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
