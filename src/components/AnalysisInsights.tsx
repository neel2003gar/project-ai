/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Brain,
    Calculator,
    CheckCircle,
    Database,
    GitBranch,
    Info,
    Layers,
    Target,
    TrendingUp,
    Zap
} from "lucide-react";

interface AnalysisInsightsProps {
  analysisType: string;
  results: any;
  datasetInfo?: any;
}

export default function AnalysisInsights({ analysisType, results, datasetInfo }: AnalysisInsightsProps) {

  console.log('AnalysisInsights component called with:', { analysisType, results, datasetInfo });

  // Check for backend errors first
  if (results?.error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Analysis Error</span>
            </CardTitle>
            <CardDescription>
              An error occurred during {analysisType} analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Error Details</h4>
                  <p className="text-red-700 mt-1">{results.error}</p>
                  {results.traceback && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                        Show technical details
                      </summary>
                      <pre className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 overflow-auto max-h-40">
                        {results.traceback}
                      </pre>
                    </details>
                  )}
                  <div className="mt-3 text-sm text-red-600">
                    <strong>Possible solutions:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Check that your data contains numeric columns for regression analysis</li>
                      <li>Ensure numeric columns don&apos;t contain text or special characters</li>
                      <li>Try uploading a clean dataset with properly formatted numbers</li>
                      <li>Remove commas, dollar signs, or other formatting from numeric data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate insights based on analysis type
  const generateInsights = () => {
    switch (analysisType) {
      case 'descriptive':
        return generateDescriptiveInsights();
      case 'correlation':
        return generateCorrelationInsights();
      case 'regression':
        return generateRegressionInsights();
      case 'classification':
        return generateClassificationInsights();
      case 'clustering':
        return generateClusteringInsights();
      case 'quick_analysis':
        return generateQuickAnalysisInsights();
      case 'visualization':
        return generateVisualizationInsights();
      default:
        return [
          {
            type: 'info',
            title: 'Analysis Complete',
            message: 'Your analysis has been completed successfully.',
            icon: CheckCircle
          }
        ];
    }
  };

  const generateDescriptiveInsights = () => {
    const insights = [];

    if (results?.numeric_stats) {
      const numericColumns = Object.keys(results.numeric_stats);
      insights.push({
        type: 'info',
        title: 'Numeric Data Summary',
        message: `Found ${numericColumns.length} numeric columns with statistical summaries.`,
        icon: BarChart3
      });

      // Check for outliers or interesting patterns
      Object.entries(results.numeric_stats).forEach(([column, stats]: [string, any]) => {
        if (stats.std && stats.mean) {
          const cv = stats.std / stats.mean;
          if (cv > 1) {
            insights.push({
              type: 'warning',
              title: `High Variability in ${column}`,
              message: `This column shows high variability (CV: ${cv.toFixed(2)}), indicating significant spread in the data.`,
              icon: AlertCircle
            });
          }

          if (cv < 0.1) {
            insights.push({
              type: 'success',
              title: `Low Variability in ${column}`,
              message: `This column shows low variability (CV: ${cv.toFixed(2)}), indicating consistent values.`,
              icon: CheckCircle
            });
          }
        }

        // Check for potential outliers using IQR
        if (stats['75%'] && stats['25%'] && stats.max && stats.min) {
          const iqr = stats['75%'] - stats['25%'];
          const upperBound = stats['75%'] + 1.5 * iqr;
          const lowerBound = stats['25%'] - 1.5 * iqr;

          if (stats.max > upperBound || stats.min < lowerBound) {
            insights.push({
              type: 'warning',
              title: `Potential Outliers in ${column}`,
              message: `Values outside normal range detected. Consider investigating extreme values.`,
              icon: AlertCircle
            });
          }
        }
      });
    }

    if (results?.categorical_stats) {
      const categoricalColumns = Object.keys(results.categorical_stats);
      insights.push({
        type: 'info',
        title: 'Categorical Data Summary',
        message: `Found ${categoricalColumns.length} categorical columns with frequency distributions.`,
        icon: BarChart3
      });

      // Check for categorical insights
      Object.entries(results.categorical_stats).forEach(([column, stats]: [string, any]) => {
        if (stats.unique_count === 1) {
          insights.push({
            type: 'warning',
            title: `Single Value in ${column}`,
            message: `This column contains only one unique value and may not be useful for analysis.`,
            icon: AlertCircle
          });
        } else if (stats.unique_count > 50) {
          insights.push({
            type: 'info',
            title: `High Cardinality in ${column}`,
            message: `This column has ${stats.unique_count} unique values, consider grouping for analysis.`,
            icon: Info
          });
        }
      });
    }

    return insights;
  };

  const generateCorrelationInsights = () => {
    const insights = [];

    insights.push({
      type: 'info',
      title: 'Correlation Analysis Complete',
      message: 'Variable relationships have been analyzed using correlation coefficients.',
      icon: GitBranch
    });

    if (results?.strong_correlations) {
      const strongCorrs = results.strong_correlations.filter((corr: any) => Math.abs(corr.correlation) > 0.7);
      if (strongCorrs.length > 0) {
        insights.push({
          type: 'success',
          title: 'Strong Correlations Found',
          message: `Found ${strongCorrs.length} strong correlations (|r| &gt; 0.7) between variables.`,
          icon: CheckCircle
        });

        // Add specific insights for strongest correlations
        const strongest = strongCorrs.reduce((prev: any, current: any) =>
          Math.abs(current.correlation) > Math.abs(prev.correlation) ? current : prev
        );

        insights.push({
          type: 'info',
          title: 'Strongest Correlation',
          message: `${strongest.feature1} and ${strongest.feature2} show the strongest correlation (r = ${strongest.correlation.toFixed(3)}).`,
          icon: TrendingUp
        });
      } else {
        insights.push({
          type: 'warning',
          title: 'No Strong Correlations',
          message: 'No strong correlations found between variables. Variables appear to be relatively independent.',
          icon: AlertCircle
        });
      }
    }

    return insights;
  };

  const generateRegressionInsights = () => {
    const insights = [];

    insights.push({
      type: 'success',
      title: 'Regression Analysis Complete',
      message: 'Linear regression model has been trained and evaluated with comprehensive metrics.',
      icon: TrendingUp
    });

    // Model performance insights
    if (results?.model_performance?.test_r2 !== undefined) {
      const r2 = results.model_performance.test_r2;
      const rmse = results.model_performance.test_rmse;
      const mae = results.model_performance.test_mae;

      if (r2 > 0.8) {
        insights.push({
          type: 'success',
          title: 'Excellent Model Performance',
          message: `Outstanding R² score of ${(r2 * 100).toFixed(1)}% indicates excellent predictive power. The model explains most of the variance in the target variable.`,
          icon: CheckCircle
        });
      } else if (r2 > 0.6) {
        insights.push({
          type: 'info',
          title: 'Good Model Performance',
          message: `Good R² score of ${(r2 * 100).toFixed(1)}% shows solid predictive capability. Model captures most important patterns.`,
          icon: Info
        });
      } else if (r2 > 0.4) {
        insights.push({
          type: 'warning',
          title: 'Moderate Model Performance',
          message: `Moderate R² score of ${(r2 * 100).toFixed(1)}% suggests room for improvement. Consider feature engineering or additional data.`,
          icon: AlertCircle
        });
      } else if (r2 > 0) {
        insights.push({
          type: 'warning',
          title: 'Limited Model Performance',
          message: `R² score of ${(r2 * 100).toFixed(1)}% indicates limited predictive power. The model may need significant improvement.`,
          icon: AlertCircle
        });
      } else {
        insights.push({
          type: 'warning',
          title: 'Poor Model Performance',
          message: `Negative R² score indicates the model performs worse than simply predicting the mean. Consider reviewing your features and data.`,
          icon: AlertTriangle
        });
      }

      // Add error metrics insight
      if (rmse && mae) {
        insights.push({
          type: 'info',
          title: 'Prediction Error Analysis',
          message: `Average prediction error (RMSE): ${rmse.toFixed(3)}. Mean absolute error: ${mae.toFixed(3)}. Lower values indicate better accuracy.`,
          icon: BarChart3
        });
      }
    }

    // Feature importance insights
    if (results?.feature_importance && Object.keys(results.feature_importance).length > 0) {
      const features = Object.entries(results.feature_importance)
        .sort(([,a], [,b]) => Math.abs(Number(b)) - Math.abs(Number(a)))
        .slice(0, 3);

      const topFeature = features[0];
      if (topFeature) {
        const [featureName, featureCoef] = topFeature;
        const coefValue = Number(featureCoef);
        insights.push({
          type: 'info',
          title: 'Key Contributing Features',
          message: `Most influential feature: "${featureName}" with coefficient ${coefValue.toFixed(4)}. ${coefValue > 0 ? 'Positive' : 'Negative'} relationship with target variable.`,
          icon: BarChart3
        });
      }

      if (features.length > 1) {
        insights.push({
          type: 'info',
          title: 'Feature Relationships',
          message: `Top contributing features: ${features.map(([name, coef]) => {
            const coefNum = Number(coef);
            return `${name} (${coefNum > 0 ? '+' : ''}${coefNum.toFixed(3)})`;
          }).join(', ')}`,
          icon: GitBranch
        });
      }
    }

    // Model equation insight
    if (results?.model_equation) {
      insights.push({
        type: 'info',
        title: 'Regression Equation',
        message: `Model equation: ${results.model_equation}`,
        icon: Calculator
      });
    }

    // Data quality insights
    if (results?.data_info) {
      const info = results.data_info;
      insights.push({
        type: 'info',
        title: 'Training Data Summary',
        message: `Model trained on ${info.training_samples} samples, tested on ${info.testing_samples} samples. Used ${info.features_used?.length || 0} features.`,
        icon: Database
      });

      if (info.missing_values_handled > 0) {
        insights.push({
          type: 'warning',
          title: 'Data Quality Note',
          message: `${info.missing_values_handled} missing values were automatically handled during analysis. Consider data cleaning for better results.`,
          icon: AlertCircle
        });
      }
    }

    // Interpretation from backend
    if (results?.interpretation) {
      insights.push({
        type: 'info',
        title: 'Model Analysis',
        message: results.interpretation,
        icon: Brain
      });
    }

    return insights;
  };

  const generateClassificationInsights = () => {
    const insights = [];

    insights.push({
      type: 'info',
      title: 'Classification Analysis Complete',
      message: 'Classification model has been trained and evaluated.',
      icon: Target
    });

    if (results?.accuracy) {
      const accuracy = results.accuracy;
      if (accuracy > 0.9) {
        insights.push({
          type: 'success',
          title: 'Excellent Classification Accuracy',
          message: `Model achieved ${(accuracy * 100).toFixed(1)}% accuracy on test data.`,
          icon: CheckCircle
        });
      } else if (accuracy > 0.8) {
        insights.push({
          type: 'info',
          title: 'Good Classification Performance',
          message: `Model achieved ${(accuracy * 100).toFixed(1)}% accuracy on test data.`,
          icon: Info
        });
      } else {
        insights.push({
          type: 'warning',
          title: 'Classification Needs Improvement',
          message: `Model achieved ${(accuracy * 100).toFixed(1)}% accuracy. Consider feature engineering.`,
          icon: AlertCircle
        });
      }
    }

    // Feature importance insights
    if (results?.feature_importance) {
      const topFeatures = Object.entries(results.feature_importance)
        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
        .slice(0, 3);

      insights.push({
        type: 'info',
        title: 'Most Important Features',
        message: `Key predictors: ${topFeatures.map(([name]) => name).join(', ')}`,
        icon: BarChart3
      });
    }

    return insights;
  };

  const generateClusteringInsights = () => {
    const insights = [];

    insights.push({
      type: 'info',
      title: 'Clustering Analysis Complete',
      message: 'K-means clustering has identified patterns in your data.',
      icon: Layers
    });

    if (results?.cluster_summary) {
      const numClusters = Object.keys(results.cluster_summary).length;
      insights.push({
        type: 'info',
        title: `${numClusters} Clusters Identified`,
        message: `Data has been segmented into ${numClusters} distinct groups.`,
        icon: Zap
      });

      // Analyze cluster balance
      const clusterSizes = Object.values(results.cluster_summary).map((cluster: any) => {
        // Try to find size information in various possible formats
        if (typeof cluster === 'object' && cluster !== null) {
          return cluster.size || cluster.count || Object.keys(cluster).length || 0;
        }
        return 0;
      });

      const maxSize = Math.max(...clusterSizes);
      const minSize = Math.min(...clusterSizes);
      const ratio = maxSize / minSize;

      if (ratio > 5) {
        insights.push({
          type: 'warning',
          title: 'Imbalanced Clusters',
          message: 'Clusters vary significantly in size. Consider adjusting the number of clusters.',
          icon: AlertCircle
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Well-Balanced Clusters',
          message: 'Clusters are relatively balanced in size.',
          icon: CheckCircle
        });
      }
    }

    if (results?.inertia) {
      insights.push({
        type: 'info',
        title: 'Cluster Cohesion',
        message: `Within-cluster sum of squares: ${results.inertia.toFixed(2)}`,
        icon: Info
      });
    }

    return insights;
  };

  const generateQuickAnalysisInsights = () => {
    const insights = [];

    insights.push({
      type: 'success',
      title: 'Quick Analysis Complete',
      message: 'Comprehensive analysis covering descriptive statistics and correlations.',
      icon: Brain
    });

    // Combine insights from descriptive and correlation
    if (results?.descriptive) {
      const descriptiveInsights = generateDescriptiveInsights();
      insights.push(...descriptiveInsights.slice(0, 2)); // Add top 2 descriptive insights
    }

    if (results?.correlation) {
      const correlationInsights = generateCorrelationInsights();
      insights.push(...correlationInsights.slice(1, 3)); // Add correlation insights (skip the completion message)
    }

    return insights;
  };

  const generateVisualizationInsights = () => {
    const insights = [];

    insights.push({
      type: 'info',
      title: 'Visualization Created',
      message: 'Custom visualization has been generated for your data.',
      icon: BarChart3
    });

    return insights;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const insights = generateInsights();

  if (!results) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
        <p className="text-gray-500">Analysis results are not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI-Generated Insights</span>
          </CardTitle>
          <CardDescription>
            Intelligent analysis and recommendations for your {analysisType} analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${getInsightColor(insight.type)}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results by Analysis Type */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Comprehensive analysis results and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {analysisType === 'descriptive' && results.numeric_stats && (
            <Tabs defaultValue="numeric">
              <TabsList>
                <TabsTrigger value="numeric">Numeric Statistics</TabsTrigger>
                {results.categorical_stats && (
                  <TabsTrigger value="categorical">Categorical Statistics</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="numeric" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Column</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Mean</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Std Dev</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Min</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results.numeric_stats).map(([column, stats]: [string, any]) => (
                        <tr key={column}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{column}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{stats.mean?.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{stats.std?.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{stats.min?.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{stats.max?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {results.categorical_stats && (
                <TabsContent value="categorical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(results.categorical_stats).map(([column, stats]: [string, any]) => (
                      <div key={column} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{column}</h4>
                        <div className="space-y-2 text-sm">
                          <div>Unique values: <Badge variant="secondary">{stats.unique_count}</Badge></div>
                          <div>Most frequent: <Badge variant="outline">{stats.most_frequent}</Badge></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}

          {analysisType === 'correlation' && results.strong_correlations && (
            <div className="space-y-4">
              <h4 className="font-medium">Strong Correlations</h4>
              {results.strong_correlations.length > 0 ? (
                <div className="space-y-2">
                  {results.strong_correlations.map((corr: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">
                        {corr.feature1} ↔ {corr.feature2}
                      </span>
                      <Badge variant={Math.abs(corr.correlation) > 0.8 ? "default" : "secondary"}>
                        {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No strong correlations found (|r| &gt; 0.5)</p>
              )}
            </div>
          )}

          {analysisType === 'regression' && results.model_performance && (
            <div className="space-y-4">
              <h4 className="font-medium">Model Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {(results.model_performance.test_r2 * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">R² Score</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {results.model_performance.test_mse?.toFixed(4)}
                  </div>
                  <div className="text-sm text-green-600">MSE</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {(results.model_performance.train_r2 * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-600">Train R²</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    {Math.sqrt(results.model_performance.test_mse).toFixed(4)}
                  </div>
                  <div className="text-sm text-orange-600">RMSE</div>
                </div>
              </div>
            </div>
          )}

          {analysisType === 'classification' && (
            <div className="space-y-4">
              {results.accuracy && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {(results.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-600">Accuracy</div>
                </div>
              )}
              {results.classification_report?.macro_avg && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {(results.classification_report.macro_avg.precision * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">Precision</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {(results.classification_report.macro_avg.recall * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">Recall</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">
                      {(results.classification_report.macro_avg['f1-score'] * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-orange-600">F1-Score</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisType === 'clustering' && results.cluster_summary && (
            <div className="space-y-4">
              <h4 className="font-medium">Cluster Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.cluster_summary).map(([cluster, info]: [string, any]) => (
                  <div key={cluster} className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Cluster {cluster}</h5>
                    <div className="text-xs text-gray-600">
                      <div>Size: <Badge variant="secondary">{info.size || 'N/A'}</Badge></div>
                      <div className="mt-1">Percentage: <Badge variant="secondary">{info.percentage?.toFixed(1) || 'N/A'}%</Badge></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw data display for debugging */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              View Raw Results (Debug)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 text-gray-900 rounded text-xs overflow-auto max-h-96 font-mono">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
