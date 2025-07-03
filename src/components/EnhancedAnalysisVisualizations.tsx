/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PlotWrapper from '@/components/PlotWrapper';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/config';
import {
    AlertCircle,
    BarChart3,
    Database,
    Download,
    Eye,
    Info,
    Layers,
    Maximize2,
    PieChart,
    Target,
    TrendingUp
} from "lucide-react";
import { useEffect } from "react";

interface AnalysisVisualizationsProps {
  datasetId: string;
  analysisData?: any;
  analysisType?: string;
}

export default function EnhancedAnalysisVisualizations({
  datasetId,
  analysisData,
  analysisType = 'unknown'
}: AnalysisVisualizationsProps) {

  console.log('Enhanced AnalysisVisualizations received:', { datasetId, analysisData, analysisType });

  // Fetch dataset preview for creating enhanced visualizations
  useEffect(() => {
    const fetchDatasetPreview = async () => {
      try {
        const token = getToken();
        const response = await fetch(getApiUrl(`/datasets/${datasetId}/preview/`), {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Dataset preview loaded:', data);
        }
      } catch (error) {
        console.error('Error fetching dataset preview:', error);
      }
    };

    if (datasetId) {
      fetchDatasetPreview();
    }
  }, [datasetId]);

  // Enhanced chart rendering with better styling and information
  const renderEnhancedChart = (chartData: any, title: string, description: string, insights?: string[]) => {
    if (!chartData) return null;

    // Enhance chart layout for better appearance
    const enhancedLayout = {
      ...chartData.layout,
      autosize: true,
      height: 500,
      font: { family: 'Inter, sans-serif', size: 12 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 60, r: 30, t: 80, b: 60 },
      showlegend: chartData.data?.length > 1,
      legend: {
        orientation: 'h',
        y: -0.15,
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        ...chartData.layout?.xaxis,
        gridcolor: '#f0f0f0',
        zerolinecolor: '#e0e0e0'
      },
      yaxis: {
        ...chartData.layout?.yaxis,
        gridcolor: '#f0f0f0',
        zerolinecolor: '#e0e0e0'
      }
    };

    // Enhance chart data with better colors and styling
    const enhancedData = chartData.data?.map((trace: any, index: number) => ({
      ...trace,
      marker: {
        ...trace.marker,
        color: trace.marker?.color || getChartColor(index),
        line: { width: 1, color: '#ffffff' }
      },
      hovertemplate: trace.hovertemplate || `%{x}<br>%{y}<extra></extra>`
    }));

    return (
      <Card className="mb-6 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border p-4">
            <PlotWrapper
              data={enhancedData}
              layout={enhancedLayout}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                responsive: true
              }}
            />
          </div>

          {/* Chart insights */}
          {insights && insights.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Key Insights</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Get appropriate colors for charts
  const getChartColor = (index: number) => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  };

  // Enhanced descriptive statistics visualizations
  const renderEnhancedDescriptiveVisualizations = () => {
    const charts = [];

    // Distribution charts with enhanced styling
    if (analysisData.distribution_charts && Object.keys(analysisData.distribution_charts).length > 0) {
      Object.entries(analysisData.distribution_charts).forEach(([column, chartData]: [string, any]) => {
        const stats = analysisData.numeric_stats?.[column];
        const insights = [];

        if (stats) {
          insights.push(`Mean: ${stats.mean?.toFixed(2)}, Standard Deviation: ${stats.std?.toFixed(2)}`);

          const skewness = calculateSkewness(stats);
          if (skewness > 1) insights.push("Distribution is positively skewed (right tail)");
          else if (skewness < -1) insights.push("Distribution is negatively skewed (left tail)");
          else insights.push("Distribution is approximately symmetric");

          const cv = stats.std / stats.mean;
          if (cv > 0.5) insights.push("High variability in the data");
          else if (cv < 0.1) insights.push("Low variability - data points are close to the mean");
        }

        charts.push(
          <div key={`distribution-${column}`}>
            {renderEnhancedChart(
              chartData,
              `Distribution of ${column}`,
              `Histogram showing the frequency distribution of ${column} values`,
              insights
            )}
          </div>
        );
      });
    }

    // Summary statistics table
    if (analysisData.numeric_stats) {
      charts.push(
        <Card key="summary-stats" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Summary Statistics</span>
            </CardTitle>
            <CardDescription>Comprehensive statistical overview of numeric variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Variable</th>
                    <th className="text-right p-2 font-medium">Count</th>
                    <th className="text-right p-2 font-medium">Mean</th>
                    <th className="text-right p-2 font-medium">Std Dev</th>
                    <th className="text-right p-2 font-medium">Min</th>
                    <th className="text-right p-2 font-medium">25%</th>
                    <th className="text-right p-2 font-medium">50%</th>
                    <th className="text-right p-2 font-medium">75%</th>
                    <th className="text-right p-2 font-medium">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysisData.numeric_stats).map(([column, stats]: [string, any]) => (
                    <tr key={column} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{column}</td>
                      <td className="p-2 text-right">{stats.count}</td>
                      <td className="p-2 text-right">{stats.mean?.toFixed(3)}</td>
                      <td className="p-2 text-right">{stats.std?.toFixed(3)}</td>
                      <td className="p-2 text-right">{stats.min?.toFixed(3)}</td>
                      <td className="p-2 text-right">{stats['25%']?.toFixed(3)}</td>
                      <td className="p-2 text-right">{stats['50%']?.toFixed(3)}</td>
                      <td className="p-2 text-right">{stats['75%']?.toFixed(3)}</td>
                      <td className="p-2 text-right">{stats.max?.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );
    }

    return charts;
  };

  // Enhanced correlation visualizations
  const renderEnhancedCorrelationVisualizations = () => {
    const charts = [];

    if (analysisData.visualization) {
      const insights = [];

      if (analysisData.strong_correlations?.length > 0) {
        insights.push(`Found ${analysisData.strong_correlations.length} strong correlations (|r| > 0.7)`);
        const strongest = analysisData.strong_correlations.reduce((max: any, curr: any) =>
          Math.abs(curr.correlation) > Math.abs(max.correlation) ? curr : max
        );
        insights.push(`Strongest correlation: ${strongest.feature1} ↔ ${strongest.feature2} (r=${strongest.correlation.toFixed(3)})`);
      } else {
        insights.push("No strong correlations found - variables are relatively independent");
      }

      charts.push(
        <div key="correlation-heatmap">
          {renderEnhancedChart(
            analysisData.visualization,
            "Correlation Heatmap",
            "Visual representation of correlations between all numeric variables",
            insights
          )}
        </div>
      );
    }

    // Strong correlations table
    if (analysisData.strong_correlations?.length > 0) {
      charts.push(
        <Card key="correlations-table" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-600" />
              <span>Strong Correlations</span>
            </CardTitle>
            <CardDescription>Variable pairs with correlation |r| &gt; 0.7</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisData.strong_correlations.map((corr: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{corr.feature1}</div>
                    <div className="text-gray-400">↔</div>
                    <div className="font-medium">{corr.feature2}</div>
                  </div>
                  <Badge
                    variant={Math.abs(corr.correlation) > 0.8 ? "destructive" : "secondary"}
                    className="font-mono"
                  >
                    {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return charts;
  };

  // Enhanced regression visualizations
  const renderEnhancedRegressionVisualizations = () => {
    const charts = [];

    // Model Performance Summary Card
    if (analysisData.model_performance) {
      const perf = analysisData.model_performance;
      charts.push(
        <Card key="performance-summary" className="mb-6 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Model Performance Summary</span>
            </CardTitle>
            <CardDescription>Key metrics for the regression model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{(perf.test_r2 * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">R² Score</div>
                <div className="text-xs text-gray-500">Variance Explained</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{perf.test_rmse?.toFixed(3) || 'N/A'}</div>
                <div className="text-sm text-gray-600">RMSE</div>
                <div className="text-xs text-gray-500">Root Mean Square Error</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">{perf.test_mae?.toFixed(3) || 'N/A'}</div>
                <div className="text-sm text-gray-600">MAE</div>
                <div className="text-xs text-gray-500">Mean Absolute Error</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">{perf.test_mse?.toFixed(3) || 'N/A'}</div>
                <div className="text-sm text-gray-600">MSE</div>
                <div className="text-xs text-gray-500">Mean Square Error</div>
              </div>
            </div>

            {/* Model Equation */}
            {analysisData.model_equation && (
              <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-gray-800 mb-1">Regression Equation:</h4>
                <code className="text-sm text-blue-800 font-mono">{analysisData.model_equation}</code>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Actual vs Predicted scatter plot
    if (analysisData.visualizations?.scatter_plot) {
      const r2Score = analysisData.model_performance?.test_r2;
      const insights = [
        `R² Score: ${r2Score ? (r2Score * 100).toFixed(1) + '%' : 'N/A'} - proportion of variance explained`,
      ];

      if (r2Score) {
        if (r2Score > 0.8) insights.push("Excellent model fit - predictions are highly accurate");
        else if (r2Score > 0.6) insights.push("Good model fit - predictions are reasonably accurate");
        else if (r2Score > 0.4) insights.push("Moderate model fit - some predictive power");
        else insights.push("Poor model fit - predictions may not be reliable");
      }

      if (analysisData.model_performance?.test_rmse) {
        insights.push(`RMSE: ${analysisData.model_performance.test_rmse.toFixed(3)} - average prediction error`);
      }

      charts.push(
        <div key="regression-scatter">
          {renderEnhancedChart(
            analysisData.visualizations.scatter_plot,
            "Actual vs Predicted Values",
            "Scatter plot comparing actual target values with model predictions",
            insights
          )}
        </div>
      );
    }

    // Feature importance chart
    if (analysisData.visualizations?.feature_importance || analysisData.feature_importance) {
      const chartData = analysisData.visualizations?.feature_importance;
      const insights = ["Features with higher absolute values have more influence on predictions"];

      if (analysisData.feature_importance) {
        const topFeature = Object.entries(analysisData.feature_importance)
          .sort(([,a], [,b]) => Math.abs(Number(b)) - Math.abs(Number(a)))[0];

        if (topFeature) {
          const [name, coef] = topFeature;
          const coefValue = Number(coef);
          insights.push(`Most influential: ${name} (coefficient: ${coefValue.toFixed(4)})`);
          insights.push(`${coefValue > 0 ? 'Positive' : 'Negative'} relationship with target variable`);
        }
      }

      charts.push(
        <div key="feature-importance">
          {renderEnhancedChart(
            chartData,
            "Feature Importance (Coefficients)",
            "Relative importance of each feature in making predictions",
            insights
          )}
        </div>
      );
    }

    // Residuals plot
    if (analysisData.visualizations?.residuals) {
      const insights = [
        "Residuals should be randomly distributed around zero for a good model",
        "Patterns in residuals may indicate model limitations or missing features",
        "Outliers (extreme residuals) may indicate unusual data points"
      ];

      charts.push(
        <div key="residuals-plot">
          {renderEnhancedChart(
            analysisData.visualizations.residuals,
            "Residuals Plot (Prediction Errors)",
            "Distribution of prediction errors - shows where the model makes larger mistakes",
            insights
          )}
        </div>
      );
    }

    // Performance metrics comparison chart
    if (analysisData.visualizations?.performance_metrics) {
      charts.push(
        <div key="performance-metrics">
          {renderEnhancedChart(
            analysisData.visualizations.performance_metrics,
            "Training vs Testing Performance",
            "Comparison of model performance on training and testing data",
            [
              "Training and testing metrics should be similar for a good model",
              "Large differences may indicate overfitting or underfitting",
              "Lower error metrics (RMSE, MAE) and higher R² indicate better performance"
            ]
          )}
        </div>
      );
    }

    // Data Information Card
    if (analysisData.data_info) {
      const info = analysisData.data_info;
      charts.push(
        <Card key="data-info" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <span>Training Data Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Samples:</span>
                <div className="text-lg text-blue-600">{info.total_samples}</div>
              </div>
              <div>
                <span className="font-medium">Training Set:</span>
                <div className="text-lg text-green-600">{info.training_samples}</div>
              </div>
              <div>
                <span className="font-medium">Testing Set:</span>
                <div className="text-lg text-orange-600">{info.testing_samples}</div>
              </div>
              <div>
                <span className="font-medium">Features Used:</span>
                <div className="text-lg text-purple-600">{info.features_used?.length || 0}</div>
              </div>
              <div>
                <span className="font-medium">Target Variable:</span>
                <div className="text-sm text-gray-700">{info.target_column}</div>
              </div>
              <div>
                <span className="font-medium">Data Split:</span>
                <div className="text-sm text-gray-700">{info.data_split_ratio}</div>
              </div>
            </div>

            {info.features_used && info.features_used.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-sm">Feature Variables:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {info.features_used.map((feature: string) => (
                    <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {info.missing_values_handled > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {info.missing_values_handled} missing values were automatically handled
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return charts.length > 0 ? charts : (
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Regression Visualizations Available</h3>
        <p className="text-gray-500">The regression analysis may have encountered an error or the data is not suitable for visualization.</p>
      </div>
    );
  };

  // Enhanced classification visualizations
  const renderEnhancedClassificationVisualizations = () => {
    const charts = [];

    // Feature importance
    if (analysisData.visualizations?.feature_importance) {
      charts.push(
        <div key="classification-feature-importance">
          {renderEnhancedChart(
            analysisData.visualizations.feature_importance,
            "Feature Importance for Classification",
            "Features ranked by their importance in classification decisions",
            ["Higher importance features are more critical for accurate classification"]
          )}
        </div>
      );
    }

    // Confusion matrix
    if (analysisData.visualizations?.confusion_matrix) {
      const insights = [];
      if (analysisData.accuracy) {
        insights.push(`Overall Accuracy: ${(analysisData.accuracy * 100).toFixed(1)}%`);
      }
      insights.push("Diagonal elements show correct predictions");
      insights.push("Off-diagonal elements show misclassifications");

      charts.push(
        <div key="confusion-matrix">
          {renderEnhancedChart(
            analysisData.visualizations.confusion_matrix,
            "Confusion Matrix",
            "Detailed breakdown of correct and incorrect predictions by class",
            insights
          )}
        </div>
      );
    }

    return charts;
  };

  // Enhanced clustering visualizations
  const renderEnhancedClusteringVisualizations = () => {
    const charts = [];

    // Cluster visualization
    if (analysisData.visualizations?.cluster_plot) {
      const insights = [];
      if (analysisData.n_clusters) {
        insights.push(`Identified ${analysisData.n_clusters} distinct clusters`);
      }
      insights.push("Points are colored by cluster assignment");
      insights.push("Cluster centers represent the average of each cluster");

      charts.push(
        <div key="cluster-plot">
          {renderEnhancedChart(
            analysisData.visualizations.cluster_plot,
            "Cluster Visualization",
            "Data points grouped into clusters with similar characteristics",
            insights
          )}
        </div>
      );
    }

    // Cluster summary
    if (analysisData.cluster_summary) {
      charts.push(
        <Card key="cluster-summary" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-orange-600" />
              <span>Cluster Summary</span>
            </CardTitle>
            <CardDescription>Characteristics of each identified cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysisData.cluster_summary).map(([cluster, info]: [string, any]) => (
                <div key={cluster} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getChartColor(parseInt(cluster)) }}
                    ></div>
                    <span>Cluster {cluster}</span>
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Size: <Badge variant="outline">{info.size} points</Badge></div>
                    <div>Percentage: <Badge variant="outline">{info.percentage?.toFixed(1)}%</Badge></div>
                    {info.center && (
                      <div className="mt-2">
                        <div className="text-xs font-medium">Center coordinates:</div>
                        <div className="text-xs">{JSON.stringify(info.center)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return charts;
  };

  // Helper function to calculate skewness
  const calculateSkewness = (stats: any) => {
    if (!stats.mean || !stats.std || !stats['50%']) return 0;
    return (stats.mean - stats['50%']) / stats.std;
  };

  // Main render function based on analysis type
  const renderVisualizationsByType = () => {
    if (!analysisData) {
      return (
        <div className="text-center py-12">
          <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data</h3>
          <p className="text-gray-500">Analysis data is not available for visualization.</p>
        </div>
      );
    }

    switch (analysisType) {
      case 'descriptive':
        return renderEnhancedDescriptiveVisualizations();
      case 'correlation':
        return renderEnhancedCorrelationVisualizations();
      case 'regression':
        return renderEnhancedRegressionVisualizations();
      case 'classification':
        return renderEnhancedClassificationVisualizations();
      case 'clustering':
        return renderEnhancedClusteringVisualizations();
      case 'quick_analysis':
        return [
          ...renderEnhancedDescriptiveVisualizations(),
          ...renderEnhancedCorrelationVisualizations()
        ];
      default:
        return (
          <div className="text-center py-12">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Visualization Not Available</h3>
            <p className="text-gray-500">This analysis type doesn&apos;t have specific visualizations yet.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis type header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            {analysisType === 'descriptive' && <BarChart3 className="h-6 w-6" />}
            {analysisType === 'correlation' && <Target className="h-6 w-6" />}
            {analysisType === 'regression' && <TrendingUp className="h-6 w-6" />}
            {analysisType === 'classification' && <Target className="h-6 w-6" />}
            {analysisType === 'clustering' && <Layers className="h-6 w-6" />}
            {analysisType === 'quick_analysis' && <Eye className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {analysisType.charAt(0).toUpperCase() + analysisType.slice(1).replace('_', ' ')} Visualizations
            </h2>
            <p className="text-gray-600">Enhanced interactive charts and insights</p>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      {renderVisualizationsByType()}
    </div>
  );
}
