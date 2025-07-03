/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Brain,
    CheckCircle,
    Database,
    Download,
    Eye,
    Info,
    Layers,
    Lightbulb,
    Maximize2,
    PieChart,
    Sparkles,
    Target
} from 'lucide-react';
import PlotWrapper from './PlotWrapper';

interface AIInsight {
  type: string;
  title: string;
  message: string;
  recommendation?: string;
}

interface Correlation {
  feature1: string;
  feature2: string;
  correlation: number;
}

interface VisualizationRecommendation {
  type: string;
  title: string;
  description: string;
  columns?: string[];
  priority: string;
}

interface QuickAnalysisResultsProps {
  results: {
    dataset_info?: {
      rows_count?: number;
      columns_count?: number;
      numeric_columns?: string[];
      categorical_columns?: string[];
    };
    data_quality?: {
      data_quality_score?: number;
      missing_percentage?: number;
      missing_cells?: number;
      total_cells?: number;
      duplicate_percentage?: number;
      duplicate_rows?: number;
      quality_issues?: string[];
    };
    ai_insights?: AIInsight[];
    descriptive?: {
      distribution_charts?: Record<string, unknown>;
      numeric_stats?: Record<string, {
        mean?: number;
        std?: number;
        min?: number;
        max?: number;
      }>;
    };
    correlation?: {
      visualization?: unknown;
      strong_correlations?: Correlation[];
    };
    visualization_recommendations?: VisualizationRecommendation[];
  };
  onBack: () => void;
}

export default function QuickAnalysisResults({ results, onBack }: QuickAnalysisResultsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderDatasetOverview = () => (
    <div className="space-y-6">
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-700">
                  {results.dataset_info?.rows_count?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-sm text-blue-600 font-medium">Total Rows</p>
                <p className="text-xs text-blue-500 mt-1">Data points analyzed</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Database className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-700">
                  {results.dataset_info?.columns_count || 'N/A'}
                </p>
                <p className="text-sm text-green-600 font-medium">Total Features</p>
                <p className="text-xs text-green-500 mt-1">Variables available</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Layers className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-700">
                  {results.dataset_info?.numeric_columns?.length || 0}
                </p>
                <p className="text-sm text-purple-600 font-medium">Numeric Features</p>
                <p className="text-xs text-purple-500 mt-1">Quantitative variables</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-700">
                  {results.data_quality?.data_quality_score?.toFixed(0) || 'N/A'}%
                </p>
                <p className="text-sm text-orange-600 font-medium">Data Quality</p>
                <p className="text-xs text-orange-500 mt-1">Overall assessment</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Detailed Analysis */}
      {results.data_quality && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Data Quality Assessment</span>
            </CardTitle>
            <CardDescription>Comprehensive analysis of your dataset&apos;s quality and characteristics</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quality Score Gauge */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-300"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      className={`${(results.data_quality?.data_quality_score ?? 0) > 80 ? 'text-green-500' :
                                   (results.data_quality?.data_quality_score ?? 0) > 60 ? 'text-yellow-500' : 'text-red-500'}`}
                      strokeDasharray={`${results.data_quality.data_quality_score}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{(results.data_quality?.data_quality_score ?? 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Quality Score</p>
              </div>

              {/* Data Statistics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Missing Data</span>
                    <span className="font-medium">{((results.data_quality as any)?.missing_data_ratio ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{width: `${Math.min((results.data_quality as any)?.missing_data_ratio ?? 0, 100)}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Duplicate Rows</span>
                    <span className="font-medium">{results.data_quality.duplicate_rows}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Total Cells</span>
                    <span className="font-medium">{results.data_quality.total_cells?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Data Types Distribution */}
              <div>
                <h4 className="font-medium text-sm mb-3">Data Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm">Numeric</span>
                    </div>
                    <span className="text-sm font-medium">{(results.data_quality as any)?.data_types_distribution?.numeric || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">Categorical</span>
                    </div>
                    <span className="text-sm font-medium">{(results.data_quality as any)?.data_types_distribution?.categorical || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-sm">DateTime</span>
                    </div>
                    <span className="text-sm font-medium">{(results.data_quality as any)?.data_types_distribution?.datetime || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues and Recommendations */}
            {(results.data_quality as any)?.issues && (results.data_quality as any)?.issues.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Data Quality Issues
                </h4>
                <ul className="space-y-1">
                  {(results.data_quality as any)?.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-700">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {(results.data_quality as any)?.recommendations && (results.data_quality as any)?.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {(results.data_quality as any)?.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAIInsights = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI-Powered Insights</span>
        </CardTitle>
        <CardDescription>
          Automated analysis and intelligent recommendations for your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.ai_insights && results.ai_insights.length > 0 ? (
          <div className="space-y-4">
            {results.ai_insights.map((insight: AIInsight, index: number) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm mt-1">{insight.message}</p>
                      {insight.recommendation && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No specific insights available for this dataset.</p>
        )}
      </CardContent>
    </Card>
  );

  const renderDataQuality = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Data Quality Assessment</span>
        </CardTitle>
        <CardDescription>
          Analysis of data completeness, consistency, and potential issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.data_quality ? (
          <div className="space-y-6">
            {/* Quality Score */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-green-700 mb-2">
                {results.data_quality.data_quality_score?.toFixed(0)}%
              </div>
              <p className="text-green-600 font-medium">Overall Data Quality Score</p>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Missing Data</h4>
                <div className="text-2xl font-bold text-gray-700">
                  {results.data_quality.missing_percentage?.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {results.data_quality.missing_cells?.toLocaleString()} of {results.data_quality.total_cells?.toLocaleString()} cells
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Duplicate Rows</h4>
                <div className="text-2xl font-bold text-gray-700">
                  {results.data_quality.duplicate_percentage?.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {results.data_quality.duplicate_rows} duplicate rows found
                </p>
              </div>
            </div>

            {/* Quality Issues */}
            {results.data_quality.quality_issues && results.data_quality.quality_issues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Identified Issues</h4>
                <div className="space-y-2">
                  {results.data_quality.quality_issues.map((issue: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span className="text-orange-800 text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Data quality information not available.</p>
        )}
      </CardContent>
    </Card>
  );

  const renderDistributionCharts = () => {
    if (!results.descriptive?.distribution_charts || Object.keys(results.descriptive.distribution_charts).length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No distribution charts available.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(results.descriptive.distribution_charts)
          .slice(0, 6) // Limit to first 6 charts
          .map(([column, chartData]: [string, unknown]) => (
            <Card key={column} className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Distribution of {column}</CardTitle>
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
                <CardDescription>
                  Frequency distribution showing the spread of values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg border p-4">
                  <PlotWrapper
                    data={chartData as Array<Record<string, unknown>>}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                  />
                </div>

                {/* Statistics summary */}
                {results.descriptive?.numeric_stats?.[column] && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Mean:</span>{' '}
                        {results.descriptive.numeric_stats[column].mean?.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Std Dev:</span>{' '}
                        {results.descriptive.numeric_stats[column].std?.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Min:</span>{' '}
                        {results.descriptive.numeric_stats[column].min?.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Max:</span>{' '}
                        {results.descriptive.numeric_stats[column].max?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  const renderCorrelationAnalysis = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-cyan-600" />
          <span>Correlation Analysis</span>
        </CardTitle>
        <CardDescription>
          Relationships and dependencies between numeric variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.correlation?.visualization ? (
          <div className="space-y-6">
            {/* Correlation Heatmap */}
            <div className="bg-white rounded-lg border p-4">
              <PlotWrapper
                data={results.correlation.visualization as Array<Record<string, unknown>>}
                config={{
                  displayModeBar: true,
                  displaylogo: false,
                  responsive: true
                }}
              />
            </div>

            {/* Strong Correlations */}
            {results.correlation.strong_correlations && results.correlation.strong_correlations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Strong Correlations (|r| ≥ 0.7)</h4>
                <div className="space-y-2">
                  {results.correlation.strong_correlations.map((corr: Correlation, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <span className="text-cyan-800 font-medium">
                        {corr.feature1} ↔ {corr.feature2}
                      </span>
                      <Badge
                        variant={Math.abs(corr.correlation) > 0.8 ? "default" : "secondary"}
                        className="ml-2"
                      >
                        r = {corr.correlation.toFixed(3)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Correlation analysis not available for this dataset.</p>
        )}
      </CardContent>
    </Card>
  );

  const renderVisualizationRecommendations = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Visualization Recommendations</span>
        </CardTitle>
        <CardDescription>
          Suggested charts and plots based on your data characteristics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.visualization_recommendations && results.visualization_recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.visualization_recommendations.map((rec: VisualizationRecommendation, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  rec.priority === 'high'
                    ? 'border-green-300 bg-green-50'
                    : 'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <PieChart className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{rec.title}</span>
                  <Badge variant={rec.priority === 'high' ? "default" : "secondary"}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                {rec.columns && (
                  <div className="text-xs text-gray-500">
                    <strong>Suggested columns:</strong> {rec.columns.slice(0, 3).join(', ')}
                    {rec.columns.length > 3 && ` +${rec.columns.length - 3} more`}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No specific visualization recommendations available.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <Sparkles className="h-8 w-8" />
              <span>Quick AI Analysis Results</span>
            </h1>
            <p className="text-purple-100 text-lg">
              Comprehensive automated analysis of your dataset with AI-powered insights
            </p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-purple-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Dataset Overview */}
      {renderDatasetOverview()}

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {renderAIInsights()}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {renderDataQuality()}
        </TabsContent>

        <TabsContent value="distributions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Distribution Analysis</span>
              </CardTitle>
              <CardDescription>
                Frequency distributions showing the spread and shape of your numeric variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDistributionCharts()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          {renderCorrelationAnalysis()}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {renderVisualizationRecommendations()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
