from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid

from .models import Dataset, Analysis, Visualization
from .serializers import (
    DatasetSerializer, AnalysisSerializer, VisualizationSerializer,
    DatasetUploadSerializer, AnalysisRequestSerializer
)
from .services import DataAnalysisService


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]  # Require authentication

    def get_queryset(self):
        """Return datasets for the current user only"""
        return Dataset.objects.filter(uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Upload and process a new dataset"""
        try:
            file = request.FILES.get('file')
            name = request.data.get('name', file.name if file else 'Unnamed Dataset')
            description = request.data.get('description', '')

            if not file:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Determine file type
            file_extension = os.path.splitext(file.name)[1].lower()
            file_type = 'csv' if file_extension == '.csv' else 'excel' if file_extension in ['.xlsx', '.xls'] else 'unknown'

            # Save file
            file_path = default_storage.save(f'datasets/{uuid.uuid4()}{file_extension}', ContentFile(file.read()))
            full_path = os.path.join(default_storage.location, file_path)

            # Analyze dataset
            try:
                df = DataAnalysisService.read_dataset(full_path, file_type)
                dataset_info = DataAnalysisService.get_dataset_info(df)

                # Create dataset object
                dataset = Dataset.objects.create(
                    name=name,
                    description=description,
                    file=file_path,
                    file_size=file.size,
                    rows_count=dataset_info['rows_count'],
                    columns_count=dataset_info['columns_count'],
                    file_type=file_type,
                    uploaded_by=request.user
                )

                serializer = DatasetSerializer(dataset)
                response_data = serializer.data
                response_data['dataset_info'] = dataset_info

                return Response(response_data, status=status.HTTP_201_CREATED)

            except Exception as e:
                # Clean up file if analysis fails
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get a preview of the dataset"""
        try:
            dataset = self.get_object()
            df = DataAnalysisService.read_dataset(dataset.file.path)

            # Clean the data to handle NaN values properly
            raw_data = df.head(10).to_dict('records')
            cleaned_data = DataAnalysisService.clean_for_json(raw_data)
            cleaned_info = DataAnalysisService.clean_for_json(DataAnalysisService.get_dataset_info(df))

            preview_data = {
                'columns': df.columns.tolist(),
                'data': cleaned_data,
                'info': cleaned_info
            }

            return Response(preview_data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalysisViewSet(viewsets.ModelViewSet):
    queryset = Analysis.objects.all()
    serializer_class = AnalysisSerializer
    permission_classes = [IsAuthenticated]  # Require authentication

    def get_queryset(self):
        """Return analyses for datasets owned by the current user"""
        return Analysis.objects.filter(dataset__uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new analysis"""
        try:
            serializer = AnalysisRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            dataset = Dataset.objects.get(id=data['dataset_id'])

            # Load dataset
            df = DataAnalysisService.read_dataset(dataset.file.path)

            # Perform analysis based on type
            analysis_type = data['analysis_type']
            parameters = data.get('parameters', {})

            if analysis_type == 'descriptive':
                results = DataAnalysisService.descriptive_statistics(df, parameters.get('columns'))
            elif analysis_type == 'correlation':
                results = DataAnalysisService.correlation_analysis(df, parameters.get('method', 'pearson'))
            elif analysis_type == 'regression':
                results = DataAnalysisService.linear_regression_analysis(
                    df, parameters.get('target_column'), parameters.get('feature_columns')
                )
            elif analysis_type == 'clustering':
                results = DataAnalysisService.clustering_analysis(
                    df, parameters.get('n_clusters', 3), parameters.get('features')
                )
            elif analysis_type == 'classification':
                results = DataAnalysisService.classification_analysis(
                    df, parameters.get('target_column'), parameters.get('feature_columns')
                )
            elif analysis_type == 'quick_analysis':
                # Comprehensive quick analysis
                results = {
                    'descriptive': DataAnalysisService.descriptive_statistics(df),
                    'correlation': DataAnalysisService.correlation_analysis(df),
                    'dataset_info': DataAnalysisService.get_dataset_info(df)
                }
            elif analysis_type == 'visualization':
                chart_type = parameters.get('chart_type', 'histogram')
                results = DataAnalysisService.create_visualization(df, chart_type, parameters)
            else:
                return Response({'error': 'Unsupported analysis type'}, status=status.HTTP_400_BAD_REQUEST)

            # Clean results for JSON serialization
            cleaned_results = DataAnalysisService.clean_for_json(results)

            # Create analysis object
            analysis = Analysis.objects.create(
                dataset=dataset,
                analysis_type=analysis_type,
                title=data['title'],
                description=data.get('description', ''),
                parameters=parameters,
                results=cleaned_results
            )

            serializer = AnalysisSerializer(analysis)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def quick_analysis(self, request):
        """Perform enhanced quick analysis on a dataset"""
        try:
            dataset_id = request.data.get('dataset_id')
            dataset = Dataset.objects.get(id=dataset_id)

            df = DataAnalysisService.read_dataset(dataset.file.path)

            # Clean the dataset first
            df_clean = DataAnalysisService._clean_dataset(df)

            # Perform comprehensive quick analyses
            results = {
                'descriptive': DataAnalysisService.descriptive_statistics(df_clean),
                'correlation': DataAnalysisService.correlation_analysis(df_clean),
                'dataset_info': DataAnalysisService.get_dataset_info(df_clean),
                'data_quality': DataAnalysisService._analyze_data_quality(df_clean),
                'ai_insights': DataAnalysisService._generate_ai_insights(df_clean),
                'visualization_recommendations': DataAnalysisService._get_visualization_recommendations(df_clean)
            }

            # Clean all results for JSON serialization
            cleaned_results = DataAnalysisService.clean_for_json(results)
            return Response(cleaned_results)

        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VisualizationViewSet(viewsets.ModelViewSet):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
    permission_classes = [IsAuthenticated]  # Require authentication

    def get_queryset(self):
        """Return visualizations for analyses owned by the current user"""
        return Visualization.objects.filter(analysis__dataset__uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new visualization"""
        try:
            analysis_id = request.data.get('analysis_id')
            chart_type = request.data.get('chart_type')
            title = request.data.get('title')
            config = request.data.get('config', {})

            analysis = Analysis.objects.get(id=analysis_id)
            dataset = analysis.dataset

            # Load dataset
            df = DataAnalysisService.read_dataset(dataset.file.path)

            # Create visualization
            viz_result = DataAnalysisService.create_visualization(df, chart_type, config)

            if 'error' in viz_result:
                return Response(viz_result, status=status.HTTP_400_BAD_REQUEST)

            # Create visualization object
            visualization = Visualization.objects.create(
                analysis=analysis,
                chart_type=chart_type,
                title=title,
                config=config,
                data=viz_result['visualization']
            )

            serializer = VisualizationSerializer(visualization)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Analysis.DoesNotExist:
            return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
