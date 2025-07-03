import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score, classification_report
import plotly.express as px
import plotly.graph_objects as go
import plotly.figure_factory as ff
import json
import os
from io import StringIO


class DataAnalysisService:
    """Service class for AI-powered data analysis"""

    @staticmethod
    def clean_for_json(data):
        """Clean data structure to be JSON serializable by replacing NaN values"""
        if isinstance(data, dict):
            return {key: DataAnalysisService.clean_for_json(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [DataAnalysisService.clean_for_json(item) for item in data]
        elif isinstance(data, float):
            if np.isnan(data) or np.isinf(data):
                return None
            return data
        elif pd.isna(data):
            return None
        else:
            return data

    @staticmethod
    def read_dataset(file_path, file_type=None):
        """Read dataset from various file formats with enhanced data cleaning"""
        try:
            if file_type == 'csv' or file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_type == 'excel' or file_path.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path)
            elif file_type == 'json' or file_path.endswith('.json'):
                df = pd.read_json(file_path)
            else:
                # Try to auto-detect
                try:
                    df = pd.read_csv(file_path)
                except:
                    df = pd.read_excel(file_path)

            # Clean and preprocess the data
            df = DataAnalysisService._clean_dataset(df)
            return df
        except Exception as e:
            raise ValueError(f"Error reading file: {str(e)}")

    @staticmethod
    def _clean_dataset(df):
        """Clean dataset by handling common formatting issues"""
        df_cleaned = df.copy()

        for col in df_cleaned.columns:
            # Skip if already numeric
            if pd.api.types.is_numeric_dtype(df_cleaned[col]):
                continue

            # Try to convert object columns to numeric
            if df_cleaned[col].dtype == 'object':
                # Handle common formatting issues
                temp_series = df_cleaned[col].astype(str)

                # Remove common non-numeric characters
                temp_series = temp_series.str.replace(',', '', regex=False)  # Remove commas
                temp_series = temp_series.str.replace('$', '', regex=False)  # Remove dollar signs
                temp_series = temp_series.str.replace('%', '', regex=False)  # Remove percent signs
                temp_series = temp_series.str.strip()  # Remove whitespace

                # Replace 'nan', 'null', 'N/A', etc. with NaN
                temp_series = temp_series.replace(['nan', 'null', 'N/A', 'n/a', 'NULL', ''], np.nan)

                # Try to convert to numeric
                numeric_series = pd.to_numeric(temp_series, errors='coerce')

                # If more than 50% of non-null values are numeric, treat as numeric
                if numeric_series.notna().sum() > 0.5 * temp_series.notna().sum():
                    df_cleaned[col] = numeric_series

        return df_cleaned

    @staticmethod
    def get_dataset_info(df):
        """Get basic information about the dataset"""
        info = {
            'rows_count': len(df),
            'columns_count': len(df.columns),
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.to_dict().items()},
            'memory_usage': int(df.memory_usage(deep=True).sum()),
            'missing_values': {col: int(count) for col, count in df.isnull().sum().to_dict().items()},
            'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_columns': df.select_dtypes(include=['object']).columns.tolist()
        }

        # Clean for JSON serialization
        return DataAnalysisService.clean_for_json(info)

    @staticmethod
    def descriptive_statistics(df, columns=None):
        """Generate descriptive statistics with enhanced visualizations"""
        if columns:
            df = df[columns]

        numeric_df = df.select_dtypes(include=[np.number])
        categorical_df = df.select_dtypes(include=['object'])

        # Convert numeric stats to JSON-serializable format
        numeric_stats = {}
        distribution_charts = {}
        categorical_insights = {}
        distribution_charts = {}

        if not numeric_df.empty:
            desc_stats = numeric_df.describe()
            for col in desc_stats.columns:
                numeric_stats[col] = {
                    stat: float(value) if not pd.isna(value) else None
                    for stat, value in desc_stats[col].items()
                }

                # Create enhanced distribution histogram for each numeric column
                try:
                    # Calculate statistics for the column
                    col_stats = numeric_stats[col]

                    # Create histogram with enhanced styling
                    fig = px.histogram(
                        numeric_df,
                        x=col,
                        title=f'Distribution of {col}',
                        marginal="box",  # Add box plot on top
                        nbins=min(30, int(np.sqrt(len(numeric_df.dropna())))),
                        color_discrete_sequence=['#3B82F6']  # Blue color
                    )

                    # Add mean line
                    if col_stats.get('mean'):
                        fig.add_vline(
                            x=col_stats['mean'],
                            line_dash="dash",
                            line_color="red",
                            annotation_text=f"Mean: {col_stats['mean']:.2f}"
                        )

                    # Enhanced layout
                    fig.update_layout(
                        showlegend=False,
                        height=500,
                        xaxis_title=col,
                        yaxis_title='Frequency',
                        font=dict(family="Inter, sans-serif", size=12),
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)',
                        margin=dict(l=60, r=30, t=80, b=60)
                    )

                    # Update traces for better appearance
                    fig.update_traces(
                        marker_line_width=1,
                        marker_line_color="white",
                        opacity=0.8
                    )

                    distribution_charts[col] = json.loads(fig.to_json())
                except Exception as e:
                    print(f"Error creating distribution chart for {col}: {e}")

        results = {
            'numeric_stats': numeric_stats,
            'distribution_charts': distribution_charts,
            'categorical_stats': {},
            'missing_values': {col: int(count) for col, count in df.isnull().sum().to_dict().items()},
            'data_types': {col: str(dtype) for col, dtype in df.dtypes.to_dict().items()}
        }

        # Categorical statistics with visualizations
        categorical_charts = {}
        for col in categorical_df.columns:
            mode_val = categorical_df[col].mode()
            value_counts = categorical_df[col].value_counts().head(10)

            results['categorical_stats'][col] = {
                'unique_count': int(categorical_df[col].nunique()),
                'most_frequent': str(mode_val.iloc[0]) if not mode_val.empty else None,
                'value_counts': {str(k): int(v) for k, v in value_counts.to_dict().items()}
            }

            # Create bar chart for categorical variables
            try:
                if len(value_counts) > 1:
                    fig = px.bar(
                        x=value_counts.index[:10],
                        y=value_counts.values[:10],
                        title=f'Distribution of {col}',
                        labels={'x': col, 'y': 'Count'}
                    )
                    fig.update_layout(
                        showlegend=False,
                        height=400,
                        xaxis_title=col,
                        yaxis_title='Count'
                    )
                    categorical_charts[col] = json.loads(fig.to_json())
            except Exception as e:
                print(f"Error creating categorical chart for {col}: {e}")

        results['categorical_charts'] = categorical_charts

        # Clean all data for JSON serialization
        return DataAnalysisService.clean_for_json(results)

    @staticmethod
    def correlation_analysis(df, method='pearson'):
        """Perform correlation analysis"""
        numeric_df = df.select_dtypes(include=[np.number])

        if numeric_df.empty:
            return {'error': 'No numeric columns found for correlation analysis'}

        correlation_matrix = numeric_df.corr(method=method)

        # Create enhanced heatmap
        fig = px.imshow(
            correlation_matrix,
            labels=dict(color="Correlation"),
            x=correlation_matrix.columns,
            y=correlation_matrix.columns,
            color_continuous_scale='RdBu',
            title=f'{method.capitalize()} Correlation Matrix',
            aspect="auto",
            text_auto=True
        )

        # Enhanced layout
        fig.update_layout(
            height=600,
            font=dict(family="Inter, sans-serif", size=12),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=80, r=30, t=100, b=80)
        )

        # Update color scale
        fig.update_coloraxes(
            colorbar_title="Correlation",
            cmin=-1,
            cmax=1
        )

        # Add annotations for better readability
        fig.update_traces(
            texttemplate="%{z:.2f}",
            textfont_size=10
        )

        # Convert correlation matrix to JSON-serializable format
        corr_dict = {}
        for col in correlation_matrix.columns:
            corr_dict[col] = {
                other_col: float(correlation_matrix.loc[col, other_col]) if not pd.isna(correlation_matrix.loc[col, other_col]) else None
                for other_col in correlation_matrix.columns
            }

        result = {
            'correlation_matrix': corr_dict,
            'visualization': json.loads(fig.to_json()),
            'strong_correlations': DataAnalysisService._find_strong_correlations(correlation_matrix)
        }

        # Clean for JSON serialization
        return DataAnalysisService.clean_for_json(result)

    @staticmethod
    def _find_strong_correlations(corr_matrix, threshold=0.7):
        """Find strong correlations in the matrix"""
        strong_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                corr_value = abs(corr_matrix.iloc[i, j])
                if corr_value >= threshold:
                    strong_corr.append({
                        'feature1': corr_matrix.columns[i],
                        'feature2': corr_matrix.columns[j],
                        'correlation': round(corr_matrix.iloc[i, j], 3)
                    })
        return strong_corr

    @staticmethod
    def linear_regression_analysis(df, target_column, feature_columns=None):
        """Perform comprehensive linear regression analysis with enhanced validation and visualizations"""
        try:
            print(f"Starting regression analysis. Target: {target_column}, Features: {feature_columns}")

            # Validate inputs
            if not target_column:
                return {'error': 'Target column is required for regression analysis'}

            if target_column not in df.columns:
                return {'error': f'Target column "{target_column}" not found in dataset. Available columns: {list(df.columns)}'}

            # Clean the dataframe
            df_clean = DataAnalysisService._clean_dataset(df)
            print(f"Dataset cleaned. Shape: {df_clean.shape}")

            # Auto-select features if not provided
            if feature_columns is None or len(feature_columns) == 0:
                numeric_cols = df_clean.select_dtypes(include=[np.number]).columns.tolist()
                feature_columns = [col for col in numeric_cols if col != target_column]
                print(f"Auto-selected features: {feature_columns}")

            if not feature_columns:
                return {'error': f'No suitable numeric feature columns found. Target: {target_column}, Available numeric columns: {df_clean.select_dtypes(include=[np.number]).columns.tolist()}'}

            # Validate target column is numeric
            if not pd.api.types.is_numeric_dtype(df_clean[target_column]):
                return {'error': f'Target column "{target_column}" must be numeric. Current type: {df_clean[target_column].dtype}'}

            # Validate feature columns exist and are numeric
            missing_features = [col for col in feature_columns if col not in df_clean.columns]
            if missing_features:
                return {'error': f'Feature columns not found: {missing_features}'}

            non_numeric_features = [col for col in feature_columns if not pd.api.types.is_numeric_dtype(df_clean[col])]
            if non_numeric_features:
                print(f"Converting non-numeric features to numeric: {non_numeric_features}")
                for col in non_numeric_features:
                    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')

            # Prepare data
            X = df_clean[feature_columns].copy()
            y = df_clean[target_column].copy()

            print(f"Initial data shapes - X: {X.shape}, y: {y.shape}")
            print(f"Missing values - X: {X.isna().sum().sum()}, y: {y.isna().sum()}")

            # Handle missing values
            if X.isna().any().any() or y.isna().any():
                print("Handling missing values...")
                # For features, use median imputation
                for col in X.columns:
                    if X[col].isna().any():
                        median_val = X[col].median()
                        if pd.isna(median_val):
                            median_val = 0  # Fallback if all values are NaN
                        X[col] = X[col].fillna(median_val)

                # For target, use median imputation
                if y.isna().any():
                    y_median = y.median()
                    if pd.isna(y_median):
                        y_median = 0
                    y = y.fillna(y_median)

            # Remove infinite values
            print("Removing infinite values...")
            mask = np.isfinite(X).all(axis=1) & np.isfinite(y)
            X = X[mask]
            y = y[mask]

            print(f"After cleaning - X: {X.shape}, y: {y.shape}")

            if len(X) < 5:
                return {'error': f'Not enough valid data points for regression analysis. Need at least 5, found {len(X)}'}

            # Determine split size based on data size
            if len(X) < 20:
                test_size = 0.3  # Use larger test set for small datasets
            else:
                test_size = 0.2

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42, shuffle=True
            )

            print(f"Train/test split - Train: {len(X_train)}, Test: {len(X_test)}")

            # Train model
            model = LinearRegression()
            model.fit(X_train, y_train)

            # Make predictions
            y_pred_train = model.predict(X_train)
            y_pred_test = model.predict(X_test)

            # Calculate comprehensive metrics
            train_r2 = r2_score(y_train, y_pred_train)
            test_r2 = r2_score(y_test, y_pred_test)
            train_mse = mean_squared_error(y_train, y_pred_train)
            test_mse = mean_squared_error(y_test, y_pred_test)
            train_rmse = np.sqrt(train_mse)
            test_rmse = np.sqrt(test_mse)
            train_mae = np.mean(np.abs(y_train - y_pred_train))
            test_mae = np.mean(np.abs(y_test - y_pred_test))

            print(f"Model performance - R2: {test_r2:.4f}, RMSE: {test_rmse:.4f}")

            # Feature importance (coefficients)
            feature_importance = {col: float(coef) for col, coef in zip(feature_columns, model.coef_)}
            intercept = float(model.intercept_)

            # Create enhanced visualizations
            visualizations = {}

            try:
                # 1. Actual vs Predicted scatter plot with enhanced styling
                fig1 = go.Figure()

                # Add scatter points
                fig1.add_trace(go.Scatter(
                    x=y_test.tolist(),
                    y=y_pred_test.tolist(),
                    mode='markers',
                    name='Test Predictions',
                    marker=dict(
                        color='blue',
                        opacity=0.7,
                        size=8,
                        line=dict(width=1, color='darkblue')
                    ),
                    hovertemplate='Actual: %{x:.2f}<br>Predicted: %{y:.2f}<extra></extra>'
                ))

                # Add perfect prediction line
                min_val = min(float(y_test.min()), float(y_pred_test.min()))
                max_val = max(float(y_test.max()), float(y_pred_test.max()))
                fig1.add_trace(go.Scatter(
                    x=[min_val, max_val],
                    y=[min_val, max_val],
                    mode='lines',
                    name='Perfect Prediction',
                    line=dict(dash='dash', color='red', width=2),
                    hoverinfo='skip'
                ))

                fig1.update_layout(
                    title=f'Actual vs Predicted Values (R² = {test_r2:.3f})',
                    xaxis_title='Actual Values',
                    yaxis_title='Predicted Values',
                    height=500,
                    showlegend=True,
                    font=dict(family="Inter, sans-serif", size=12),
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    margin=dict(l=60, r=30, t=80, b=60)
                )

                visualizations['scatter_plot'] = json.loads(fig1.to_json())

                # 2. Feature importance bar chart with enhanced styling
                features_sorted = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)

                fig2 = go.Figure()
                fig2.add_trace(go.Bar(
                    x=[f[0] for f in features_sorted],
                    y=[f[1] for f in features_sorted],
                    marker_color=['#2E8B57' if x[1] > 0 else '#DC143C' for x in features_sorted],
                    text=[f'{x[1]:.3f}' for x in features_sorted],
                    textposition='outside',
                    hovertemplate='Feature: %{x}<br>Coefficient: %{y:.4f}<extra></extra>'
                ))

                fig2.update_layout(
                    title='Feature Importance (Regression Coefficients)',
                    xaxis_title='Features',
                    yaxis_title='Coefficient Value',
                    height=500,
                    showlegend=False,
                    font=dict(family="Inter, sans-serif", size=12),
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    margin=dict(l=60, r=30, t=80, b=80),
                    xaxis=dict(tickangle=45)
                )

                visualizations['feature_importance'] = json.loads(fig2.to_json())

                # 3. Residuals plot with enhanced analysis
                residuals = y_test - y_pred_test

                fig3 = go.Figure()
                fig3.add_trace(go.Scatter(
                    x=y_pred_test.tolist(),
                    y=residuals.tolist(),
                    mode='markers',
                    marker=dict(
                        color='blue',
                        opacity=0.7,
                        size=8,
                        line=dict(width=1, color='darkblue')
                    ),
                    name='Residuals',
                    hovertemplate='Predicted: %{x:.2f}<br>Residual: %{y:.2f}<extra></extra>'
                ))

                # Add horizontal line at y=0
                fig3.add_hline(y=0, line_dash="dash", line_color="red", line_width=2)

                fig3.update_layout(
                    title='Residuals Plot (Prediction Errors)',
                    xaxis_title='Predicted Values',
                    yaxis_title='Residuals (Actual - Predicted)',
                    height=500,
                    showlegend=False,
                    font=dict(family="Inter, sans-serif", size=12),
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    margin=dict(l=60, r=30, t=80, b=60)
                )

                visualizations['residuals'] = json.loads(fig3.to_json())

                # 4. Model performance comparison chart
                metrics_names = ['R²', 'RMSE', 'MAE']
                train_metrics = [train_r2, train_rmse, train_mae]
                test_metrics = [test_r2, test_rmse, test_mae]

                fig4 = go.Figure()
                fig4.add_trace(go.Bar(
                    name='Training',
                    x=metrics_names,
                    y=train_metrics,
                    marker_color='lightblue',
                    text=[f'{x:.3f}' for x in train_metrics],
                    textposition='outside'
                ))
                fig4.add_trace(go.Bar(
                    name='Testing',
                    x=metrics_names,
                    y=test_metrics,
                    marker_color='darkblue',
                    text=[f'{x:.3f}' for x in test_metrics],
                    textposition='outside'
                ))

                fig4.update_layout(
                    title='Model Performance Metrics',
                    xaxis_title='Metrics',
                    yaxis_title='Value',
                    height=400,
                    barmode='group',
                    font=dict(family="Inter, sans-serif", size=12),
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    margin=dict(l=60, r=30, t=80, b=60)
                )

                visualizations['performance_metrics'] = json.loads(fig4.to_json())

            except Exception as viz_error:
                print(f"Error creating visualizations: {viz_error}")

            # Generate comprehensive interpretation
            interpretation = DataAnalysisService._interpret_regression_results(test_r2, feature_importance)

            # Prepare comprehensive results
            results = {
                'analysis_type': 'regression',
                'model_performance': {
                    'train_r2': round(float(train_r2), 4),
                    'test_r2': round(float(test_r2), 4),
                    'train_mse': round(float(train_mse), 4),
                    'test_mse': round(float(test_mse), 4),
                    'train_rmse': round(float(train_rmse), 4),
                    'test_rmse': round(float(test_rmse), 4),
                    'train_mae': round(float(train_mae), 4),
                    'test_mae': round(float(test_mae), 4)
                },
                'feature_importance': feature_importance,
                'model_coefficients': {
                    'intercept': round(intercept, 4),
                    'coefficients': feature_importance
                },
                'visualizations': visualizations,
                'interpretation': interpretation,
                'data_info': {
                    'total_samples': int(len(df_clean)),
                    'training_samples': int(len(X_train)),
                    'testing_samples': int(len(X_test)),
                    'features_used': feature_columns,
                    'target_column': target_column,
                    'missing_values_handled': int((X.isna().sum().sum() + y.isna().sum())),
                    'data_split_ratio': f'{int((1-test_size)*100)}/{int(test_size*100)}'
                },
                'model_equation': DataAnalysisService._generate_regression_equation(intercept, feature_importance)
            }

            print("Regression analysis completed successfully")

            # Clean for JSON serialization
            return DataAnalysisService.clean_for_json(results)

        except Exception as e:
            import traceback
            error_msg = f'Error in regression analysis: {str(e)}'
            print(f"Regression analysis error: {error_msg}")
            print(f"Traceback: {traceback.format_exc()}")
            error_result = {
                'error': error_msg,
                'traceback': traceback.format_exc(),
                'analysis_type': 'regression'
            }
            return DataAnalysisService.clean_for_json(error_result)

    @staticmethod
    def clustering_analysis(df, n_clusters=3, features=None):
        """Perform K-means clustering analysis with enhanced data validation"""
        try:
            # Clean the dataframe first
            df_clean = DataAnalysisService._clean_dataset(df)

            # Select numeric features
            if features is None:
                numeric_df = df_clean.select_dtypes(include=[np.number])
            else:
                numeric_df = df_clean[features]

            if numeric_df.empty:
                return {'error': 'No numeric columns found for clustering'}

            if len(numeric_df) < n_clusters:
                return {'error': f'Not enough data points for {n_clusters} clusters. Need at least {n_clusters} data points'}

            # Prepare data with better missing value handling
            X = numeric_df.copy()

            # Fill missing values with median
            X = X.fillna(X.median())

            # Remove rows with infinite values
            mask = np.isfinite(X).all(axis=1)
            X = X[mask]

            if len(X) < n_clusters:
                return {'error': f'After cleaning, not enough valid data points for {n_clusters} clusters'}

            # Standardize features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # Perform clustering
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            clusters = kmeans.fit_predict(X_scaled)

            # Add clusters to dataframe
            result_df = X.copy()
            result_df['cluster'] = clusters

            # Cluster analysis - convert to JSON serializable
            cluster_summary_dict = {}
            cluster_summary = result_df.groupby('cluster').agg(['mean', 'count']).round(3)
            for cluster in cluster_summary.index:
                cluster_summary_dict[str(cluster)] = {}
                for col in cluster_summary.columns:
                    if col[1] == 'mean':
                        cluster_summary_dict[str(cluster)][f"{col[0]}_mean"] = float(cluster_summary.loc[cluster, col])
                    elif col[1] == 'count':
                        cluster_summary_dict[str(cluster)][f"{col[0]}_count"] = int(cluster_summary.loc[cluster, col])

            # Create visualizations
            visualizations = {}

            # Main cluster visualization
            if len(X.columns) >= 2:
                # 2D scatter plot
                fig1 = px.scatter(
                    x=X.iloc[:, 0].tolist(),
                    y=X.iloc[:, 1].tolist(),
                    color=clusters.tolist(),
                    title=f'K-Means Clustering (k={n_clusters})',
                    labels={'x': X.columns[0], 'y': X.columns[1], 'color': 'Cluster'},
                    color_continuous_scale='viridis'
                )
                # Add cluster centers
                fig1.add_trace(go.Scatter(
                    x=kmeans.cluster_centers_[:, 0],
                    y=kmeans.cluster_centers_[:, 1],
                    mode='markers',
                    marker=dict(size=15, color='red', symbol='x'),
                    name='Cluster Centers'
                ))
                visualizations['cluster_plot'] = json.loads(fig1.to_json())

                # If we have 3+ dimensions, also create a 3D plot
                if len(X.columns) >= 3:
                    fig2 = px.scatter_3d(
                        x=X.iloc[:, 0].tolist(),
                        y=X.iloc[:, 1].tolist(),
                        z=X.iloc[:, 2].tolist(),
                        color=clusters.tolist(),
                        title=f'3D K-Means Clustering (k={n_clusters})',
                        labels={'x': X.columns[0], 'y': X.columns[1], 'z': X.columns[2], 'color': 'Cluster'}
                    )
                    visualizations['cluster_plot_3d'] = json.loads(fig2.to_json())
            else:
                # 1D histogram
                fig1 = px.histogram(
                    x=clusters.tolist(),
                    title=f'Cluster Distribution (k={n_clusters})',
                    labels={'x': 'Cluster', 'y': 'Count'}
                )
                visualizations['cluster_distribution'] = json.loads(fig1.to_json())

            # Cluster size distribution
            cluster_counts = pd.Series(clusters).value_counts().sort_index()
            fig3 = px.bar(
                x=cluster_counts.index,
                y=cluster_counts.values,
                title='Cluster Sizes',
                labels={'x': 'Cluster', 'y': 'Number of Points'}
            )
            visualizations['cluster_sizes'] = json.loads(fig3.to_json())

            # Elbow plot (simplified)
            inertias = []
            k_range = range(1, min(11, n_clusters + 3))
            for k in k_range:
                if k <= len(X):
                    kmeans_temp = KMeans(n_clusters=k, random_state=42)
                    kmeans_temp.fit(X_scaled)
                    inertias.append(kmeans_temp.inertia_)

            if len(inertias) > 1:
                fig4 = go.Figure()
                fig4.add_trace(go.Scatter(
                    x=list(k_range[:len(inertias)]),
                    y=inertias,
                    mode='lines+markers',
                    name='Inertia'
                ))
                fig4.update_layout(
                    title='Elbow Plot for Optimal K',
                    xaxis_title='Number of Clusters (k)',
                    yaxis_title='Inertia',
                    height=400
                )
                visualizations['elbow_plot'] = json.loads(fig4.to_json())

            result = {
                'clusters': clusters.tolist(),
                'cluster_centers': [[float(val) for val in center] for center in kmeans.cluster_centers_],
                'cluster_summary': cluster_summary_dict,
                'inertia': float(kmeans.inertia_),
                'visualizations': visualizations
            }

            # Clean for JSON serialization
            return DataAnalysisService.clean_for_json(result)

        except Exception as e:
            error_result = {'error': f'Error in clustering analysis: {str(e)}'}
            return DataAnalysisService.clean_for_json(error_result)

    @staticmethod
    def classification_analysis(df, target_column, feature_columns=None):
        """Perform classification analysis with enhanced data validation"""
        try:
            if target_column not in df.columns:
                return {'error': f'Target column {target_column} not found'}

            # Clean the dataframe first
            df_clean = DataAnalysisService._clean_dataset(df)

            # Prepare features
            if feature_columns is None:
                feature_columns = [col for col in df_clean.columns if col != target_column]

            if not feature_columns:
                return {'error': 'No feature columns found'}

            # Handle categorical variables
            X = df_clean[feature_columns].copy()
            y = df_clean[target_column].copy()

            # Encode categorical variables
            le_dict = {}
            for col in X.select_dtypes(include=['object']).columns:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                le_dict[col] = le

            # Encode target if categorical
            target_le = None
            if y.dtype == 'object':
                target_le = LabelEncoder()
                y = target_le.fit_transform(y.astype(str))

            # Fill missing values with appropriate strategies
            for col in X.columns:
                if X[col].dtype in ['int64', 'float64']:
                    X[col] = X[col].fillna(X[col].median())
                else:
                    X[col] = X[col].fillna(X[col].mode().iloc[0] if not X[col].mode().empty else 0)

            # Remove rows with infinite values
            mask = np.isfinite(X).all(axis=1) & np.isfinite(y)
            X = X[mask]
            y = y[mask]

            if len(X) < 10:
                return {'error': 'Not enough valid data points for classification analysis (need at least 10)'}

            # Check if we have at least 2 classes
            if len(np.unique(y)) < 2:
                return {'error': 'Target column must have at least 2 different classes'}

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

            # Train model
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)

            # Predictions
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)

            # Feature importance - convert to JSON serializable
            feature_importance = {col: float(importance) for col, importance in zip(feature_columns, model.feature_importances_)}

            # Create visualizations
            visualizations = {}

            # Feature importance bar chart
            features_sorted = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
            fig1 = go.Figure(data=[
                go.Bar(
                    x=[f[0] for f in features_sorted[:10]],  # Top 10 features
                    y=[f[1] for f in features_sorted[:10]],
                    marker_color='blue'
                )
            ])
            fig1.update_layout(
                title='Top 10 Feature Importance',
                xaxis_title='Features',
                yaxis_title='Importance',
                height=400
            )
            visualizations['feature_importance'] = json.loads(fig1.to_json())

            # Confusion matrix (simplified)
            from sklearn.metrics import confusion_matrix
            cm = confusion_matrix(y_test, y_pred)

            # Get unique classes
            unique_classes = sorted(list(set(y_test) | set(y_pred)))

            fig2 = px.imshow(
                cm,
                labels=dict(x="Predicted", y="Actual", color="Count"),
                x=[f"Class {i}" for i in unique_classes],
                y=[f"Class {i}" for i in unique_classes],
                title="Confusion Matrix",
                color_continuous_scale='Blues'
            )
            visualizations['confusion_matrix'] = json.loads(fig2.to_json())

            # Class distribution
            unique, counts = np.unique(y_test, return_counts=True)
            fig3 = px.bar(
                x=[f"Class {u}" for u in unique],
                y=counts,
                title='Test Set Class Distribution',
                labels={'x': 'Class', 'y': 'Count'}
            )
            visualizations['class_distribution'] = json.loads(fig3.to_json())

            result = {
                'accuracy': round(float(accuracy), 4),
                'feature_importance': feature_importance,
                'classification_report': classification_report(y_test, y_pred, output_dict=True),
                'visualizations': visualizations,
                'interpretation': f'Model achieved {accuracy:.2%} accuracy on test data'
            }

            # Clean for JSON serialization
            return DataAnalysisService.clean_for_json(result)

        except Exception as e:
            error_result = {'error': f'Error in classification analysis: {str(e)}'}
            return DataAnalysisService.clean_for_json(error_result)

    @staticmethod
    def _interpret_regression_results(r2_score, feature_importance):
        """Interpret regression results"""
        interpretation = []

        if r2_score >= 0.8:
            interpretation.append("Excellent model performance with high explanatory power.")
        elif r2_score >= 0.6:
            interpretation.append("Good model performance with moderate explanatory power.")
        elif r2_score >= 0.4:
            interpretation.append("Fair model performance. Consider feature engineering.")
        else:
            interpretation.append("Poor model performance. Review features and data quality.")

        # Top features
        top_features = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
        interpretation.append(f"Most important features: {', '.join([f[0] for f in top_features])}")

        return ' '.join(interpretation)

    @staticmethod
    def create_visualization(df, chart_type, config):
        """Create various types of visualizations"""
        try:
            if chart_type == 'histogram':
                column = config.get('column')
                fig = px.histogram(df, x=column, title=f'Distribution of {column}')

            elif chart_type == 'scatter':
                x_col = config.get('x_column')
                y_col = config.get('y_column')
                color_col = config.get('color_column')
                fig = px.scatter(df, x=x_col, y=y_col, color=color_col,
                               title=f'{x_col} vs {y_col}')

            elif chart_type == 'line':
                x_col = config.get('x_column')
                y_col = config.get('y_column')
                fig = px.line(df, x=x_col, y=y_col, title=f'{y_col} over {x_col}')

            elif chart_type == 'bar':
                x_col = config.get('x_column')
                y_col = config.get('y_column')
                fig = px.bar(df, x=x_col, y=y_col, title=f'{y_col} by {x_col}')

            elif chart_type == 'box':
                column = config.get('column')
                fig = px.box(df, y=column, title=f'Box Plot of {column}')

            elif chart_type == 'heatmap':
                numeric_df = df.select_dtypes(include=[np.number])
                corr_matrix = numeric_df.corr()
                fig = px.imshow(corr_matrix, title='Correlation Heatmap')

            else:
                return {'error': f'Unsupported chart type: {chart_type}'}

            result = {'visualization': json.loads(fig.to_json())}
            return DataAnalysisService.clean_for_json(result)

        except Exception as e:
            error_result = {'error': f'Error creating visualization: {str(e)}'}
            return DataAnalysisService.clean_for_json(error_result)

    @staticmethod
    def _analyze_data_quality(df):
        """Analyze data quality and provide insights"""
        try:
            total_cells = df.shape[0] * df.shape[1]
            missing_cells = df.isnull().sum().sum()
            duplicate_rows = df.duplicated().sum()

            # Calculate data quality score
            missing_ratio = missing_cells / total_cells if total_cells > 0 else 0
            duplicate_ratio = duplicate_rows / len(df) if len(df) > 0 else 0
            quality_score = max(0, 100 - (missing_ratio * 50) - (duplicate_ratio * 30))

            # Analyze data types
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            datetime_cols = df.select_dtypes(include=['datetime']).columns.tolist()

            # Identify potential issues
            issues = []
            if missing_ratio > 0.1:
                issues.append(f"High missing data rate: {missing_ratio*100:.1f}%")
            if duplicate_ratio > 0.05:
                issues.append(f"Duplicate rows detected: {duplicate_rows} ({duplicate_ratio*100:.1f}%)")

            # Check for potential outliers in numeric columns
            outlier_columns = []
            for col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                if IQR > 0:
                    outliers = df[(df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)][col].count()
                    if outliers > len(df) * 0.05:  # More than 5% outliers
                        outlier_columns.append(col)

            if outlier_columns:
                issues.append(f"Potential outliers in: {', '.join(outlier_columns[:3])}")

            result = {
                'data_quality_score': round(quality_score, 1),
                'missing_data_ratio': round(missing_ratio * 100, 2),
                'duplicate_rows': int(duplicate_rows),
                'total_cells': int(total_cells),
                'missing_cells': int(missing_cells),
                'data_types_distribution': {
                    'numeric': len(numeric_cols),
                    'categorical': len(categorical_cols),
                    'datetime': len(datetime_cols)
                },
                'issues': issues,
                'recommendations': DataAnalysisService._get_data_quality_recommendations(quality_score, issues)
            }

            # Clean for JSON serialization
            return DataAnalysisService.clean_for_json(result)
        except Exception as e:
            error_result = {
                'data_quality_score': 0,
                'error': f'Error analyzing data quality: {str(e)}'
            }
            return DataAnalysisService.clean_for_json(error_result)

    @staticmethod
    def _get_data_quality_recommendations(quality_score, issues):
        """Generate data quality improvement recommendations"""
        recommendations = []

        if quality_score < 70:
            recommendations.append("Consider data cleaning and preprocessing")
        if quality_score < 50:
            recommendations.append("Significant data quality issues detected - review data sources")

        if any("missing data" in issue.lower() for issue in issues):
            recommendations.append("Handle missing values through imputation or removal")
        if any("duplicate" in issue.lower() for issue in issues):
            recommendations.append("Remove or investigate duplicate records")
        if any("outlier" in issue.lower() for issue in issues):
            recommendations.append("Investigate and handle outliers appropriately")

        return recommendations

    @staticmethod
    def _generate_ai_insights(df):
        """Generate AI-powered insights about the dataset"""
        try:
            insights = []
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            categorical_cols = df.select_dtypes(include=['object']).columns

            # Dataset size insights
            if len(df) > 10000:
                insights.append({
                    'type': 'info',
                    'title': 'Large Dataset',
                    'message': f'Dataset contains {len(df):,} rows - suitable for robust statistical analysis',
                    'recommendation': 'Consider sampling for exploratory analysis to improve performance'
                })
            elif len(df) < 100:
                insights.append({
                    'type': 'warning',
                    'title': 'Small Dataset',
                    'message': f'Dataset contains only {len(df)} rows - statistical results may be less reliable',
                    'recommendation': 'Collect more data if possible for more robust analysis'
                })

            # Numeric data insights
            if len(numeric_cols) > 0:
                # Check for highly correlated features
                if len(numeric_cols) > 1:
                    corr_matrix = df[numeric_cols].corr()
                    high_corr_pairs = []
                    for i in range(len(corr_matrix.columns)):
                        for j in range(i+1, len(corr_matrix.columns)):
                            corr_val = abs(corr_matrix.iloc[i, j])
                            if corr_val > 0.8:
                                high_corr_pairs.append((corr_matrix.columns[i], corr_matrix.columns[j], corr_val))

                    if high_corr_pairs:
                        insights.append({
                            'type': 'info',
                            'title': 'High Correlations Detected',
                            'message': f'Found {len(high_corr_pairs)} highly correlated feature pairs',
                            'recommendation': 'Consider feature selection to reduce multicollinearity'
                        })

                # Check for skewed distributions
                skewed_cols = []
                for col in numeric_cols:
                    skewness = df[col].skew()
                    if abs(skewness) > 2:
                        skewed_cols.append(col)

                if skewed_cols:
                    insights.append({
                        'type': 'info',
                        'title': 'Skewed Distributions',
                        'message': f'Columns with high skewness: {", ".join(skewed_cols[:3])}',
                        'recommendation': 'Consider log transformation or other normalization techniques'
                    })

            # Categorical data insights
            if len(categorical_cols) > 0:
                high_cardinality_cols = []
                for col in categorical_cols:
                    unique_ratio = df[col].nunique() / len(df)
                    if unique_ratio > 0.5:
                        high_cardinality_cols.append(col)

                if high_cardinality_cols:
                    insights.append({
                        'type': 'warning',
                        'title': 'High Cardinality Features',
                        'message': f'Categorical columns with many unique values: {", ".join(high_cardinality_cols[:3])}',
                        'recommendation': 'Consider grouping rare categories or using feature hashing'
                    })

            # Analysis type recommendations
            if len(numeric_cols) >= 2:
                insights.append({
                    'type': 'success',
                    'title': 'Multiple Numeric Features',
                    'message': 'Dataset is suitable for correlation analysis and regression modeling',
                    'recommendation': 'Explore relationships between numeric variables'
                })

            if len(categorical_cols) > 0 and len(numeric_cols) > 0:
                insights.append({
                    'type': 'success',
                    'title': 'Mixed Data Types',
                    'message': 'Dataset contains both categorical and numeric features',
                    'recommendation': 'Consider classification models or group-based analysis'
                })

            return insights

        except Exception as e:
            return [{
                'type': 'error',
                'title': 'Analysis Error',
                'message': f'Error generating insights: {str(e)}',
                'recommendation': 'Check data format and try again'
            }]

    @staticmethod
    def _get_visualization_recommendations(df):
        """Recommend appropriate visualizations based on data characteristics"""
        try:
            recommendations = []
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            categorical_cols = df.select_dtypes(include=['object']).columns

            # Distribution plots for numeric data
            for col in numeric_cols[:5]:  # Limit to first 5 columns
                recommendations.append({
                    'type': 'histogram',
                    'title': f'Distribution of {col}',
                    'description': f'Shows the frequency distribution of {col} values',
                    'columns': [col],
                    'priority': 'high' if col in numeric_cols[:3] else 'medium'
                })

            # Bar charts for categorical data
            for col in categorical_cols[:3]:
                if df[col].nunique() <= 20:  # Only for reasonable number of categories
                    recommendations.append({
                        'type': 'bar',
                        'title': f'Count by {col}',
                        'description': f'Shows the frequency of each category in {col}',
                        'columns': [col],
                        'priority': 'high'
                    })

            # Correlation heatmap if multiple numeric columns
            if len(numeric_cols) >= 3:
                recommendations.append({
                    'type': 'heatmap',
                    'title': 'Correlation Matrix',
                    'description': 'Shows correlations between numeric variables',
                    'columns': numeric_cols.tolist(),
                    'priority': 'high'
                })

            # Scatter plots for pairs of numeric variables
            if len(numeric_cols) >= 2:
                for i, col1 in enumerate(numeric_cols[:3]):
                    for col2 in numeric_cols[i+1:4]:
                        recommendations.append({
                            'type': 'scatter',
                            'title': f'{col1} vs {col2}',
                            'description': f'Shows relationship between {col1} and {col2}',
                            'columns': [col1, col2],
                            'priority': 'medium'
                        })

            # Box plots for numeric vs categorical
            if len(numeric_cols) > 0 and len(categorical_cols) > 0:
                for num_col in numeric_cols[:2]:
                    for cat_col in categorical_cols[:2]:
                        if df[cat_col].nunique() <= 10:
                            recommendations.append({
                                'type': 'box',
                                'title': f'{num_col} by {cat_col}',
                                'description': f'Shows distribution of {num_col} across {cat_col} categories',
                                'columns': [num_col, cat_col],
                                'priority': 'medium'
                            })

            return recommendations[:10]  # Limit to 10 recommendations

        except Exception as e:
            return [{
                'type': 'error',
                'title': 'Visualization Error',
                'description': f'Error generating recommendations: {str(e)}',
                'columns': [],
                'priority': 'low'
            }]

    @staticmethod
    def _generate_regression_equation(intercept, feature_importance):
        """Generate a human-readable regression equation"""
        try:
            equation_parts = [f"{intercept:.4f}"]

            for feature, coef in feature_importance.items():
                if coef >= 0:
                    equation_parts.append(f" + {coef:.4f} * {feature}")
                else:
                    equation_parts.append(f" - {abs(coef):.4f} * {feature}")

            equation = "y = " + "".join(equation_parts)
            return equation
        except:
            return "y = intercept + coefficient1 * feature1 + ..."
