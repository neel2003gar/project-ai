from django.db import models
from django.contrib.auth.models import User
import uuid


class Dataset(models.Model):
    """Model to store uploaded datasets"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='datasets/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    rows_count = models.IntegerField(null=True, blank=True)
    columns_count = models.IntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.name


class Analysis(models.Model):
    """Model to store analysis results"""
    ANALYSIS_TYPES = [
        ('descriptive', 'Descriptive Statistics'),
        ('correlation', 'Correlation Analysis'),
        ('regression', 'Regression Analysis'),
        ('clustering', 'Clustering'),
        ('classification', 'Classification'),
        ('prediction', 'Prediction'),
        ('visualization', 'Data Visualization'),
        ('quick_analysis', 'Quick AI Analysis'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='analyses')
    analysis_type = models.CharField(max_length=50, choices=ANALYSIS_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parameters = models.JSONField(default=dict)
    results = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.dataset.name}"


class Visualization(models.Model):
    """Model to store visualization configurations and results"""
    CHART_TYPES = [
        ('line', 'Line Chart'),
        ('bar', 'Bar Chart'),
        ('scatter', 'Scatter Plot'),
        ('histogram', 'Histogram'),
        ('box', 'Box Plot'),
        ('heatmap', 'Heatmap'),
        ('pie', 'Pie Chart'),
        ('violin', 'Violin Plot'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(Analysis, on_delete=models.CASCADE, related_name='visualizations')
    chart_type = models.CharField(max_length=50, choices=CHART_TYPES)
    title = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.chart_type})"
