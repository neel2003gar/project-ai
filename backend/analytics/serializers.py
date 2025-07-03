from rest_framework import serializers
from .models import Dataset, Analysis, Visualization


class DatasetSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = [
            'id', 'name', 'description', 'file', 'uploaded_at',
            'file_size', 'file_size_mb', 'rows_count', 'columns_count', 'file_type'
        ]
        read_only_fields = ['id', 'uploaded_at', 'file_size', 'rows_count', 'columns_count', 'file_type']

    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None


class AnalysisSerializer(serializers.ModelSerializer):
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)

    class Meta:
        model = Analysis
        fields = [
            'id', 'dataset', 'dataset_name', 'analysis_type', 'title',
            'description', 'parameters', 'results', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VisualizationSerializer(serializers.ModelSerializer):
    analysis_title = serializers.CharField(source='analysis.title', read_only=True)

    class Meta:
        model = Visualization
        fields = [
            'id', 'analysis', 'analysis_title', 'chart_type', 'title',
            'config', 'data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DatasetUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)


class AnalysisRequestSerializer(serializers.Serializer):
    dataset_id = serializers.UUIDField()
    analysis_type = serializers.ChoiceField(choices=Analysis.ANALYSIS_TYPES)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    parameters = serializers.JSONField(default=dict)
