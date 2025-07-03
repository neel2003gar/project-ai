"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, Eye, GitBranch, PieChart, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

interface Dataset {
  id: string;
  name: string;
  rows_count: number;
  columns_count: number;
  uploaded_at: string;
}

interface AnalysisOptionsProps {
  dataset: Dataset;
  onAnalysisStart: (analysisType: string, datasetId: string, parameters?: Record<string, unknown>) => void;
  onViewDataset: (datasetId: string) => void;
  onConfigureAnalysis: (analysisType: string) => void;
  completedAnalyses?: string[];
}

export default function AnalysisOptions({ dataset, onAnalysisStart, onViewDataset, onConfigureAnalysis, completedAnalyses = [] }: AnalysisOptionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // Use a combination of prop completedAnalyses and local state
  const [localCompletedAnalyses, setLocalCompletedAnalyses] = useState<string[]>([]);
  const allCompletedAnalyses = [...completedAnalyses, ...localCompletedAnalyses];

  const analysisTypes = [
    {
      id: 'quick_analysis',
      name: 'Quick AI Analysis',
      description: 'Get comprehensive descriptive statistics, correlations, and initial insights',
      icon: Brain,
      color: 'bg-purple-500',
      recommended: true
    },
    {
      id: 'correlation',
      name: 'Correlation Analysis',
      description: 'Explore relationships between variables with correlation matrix',
      icon: GitBranch,
      color: 'bg-blue-500'
    },
    {
      id: 'regression',
      name: 'Regression Analysis',
      description: 'Build predictive models and analyze variable relationships',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'clustering',
      name: 'Clustering Analysis',
      description: 'Discover hidden patterns and group similar data points',
      icon: Zap,
      color: 'bg-orange-500'
    },
    {
      id: 'classification',
      name: 'Classification',
      description: 'Build models to classify and predict categories',
      icon: PieChart,
      color: 'bg-red-500'
    }
  ];
  const handleAnalysisClick = async (analysisType: string) => {
    console.log('Analysis clicked:', analysisType); // Debug log

    // Check if this analysis type requires parameter configuration
    const parametricAnalyses = ['regression', 'classification', 'clustering'];

    if (parametricAnalyses.includes(analysisType)) {
      console.log('Redirecting to configuration for:', analysisType); // Debug log
      // Redirect to configuration page
      onConfigureAnalysis(analysisType);
      return;
    }

    console.log('Running analysis directly:', analysisType); // Debug log
    // For simple analyses like quick_analysis and correlation, run directly
    setLoading(analysisType);
    try {
      await onAnalysisStart(analysisType, dataset.id);
      // Track completed analysis locally
      setLocalCompletedAnalyses(prev => [...prev, analysisType]);
    } catch (error) {
      console.error('Error in handleAnalysisClick:', error); // Debug log
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dataset Summary with Animation */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-800 shadow-lg animate-pulse-subtle">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Dataset Ready: {dataset.name}
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-300">
                {dataset.rows_count?.toLocaleString()} rows × {dataset.columns_count} columns
              </CardDescription>
              {allCompletedAnalyses.length > 0 && (
                <CardDescription className="text-green-600 dark:text-green-300 mt-1">
                  ✅ {allCompletedAnalyses.length} analysis{allCompletedAnalyses.length !== 1 ? 'es' : ''} completed
                </CardDescription>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDataset(dataset.id)}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Data
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Call to Action */}
      <div className="text-center py-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {allCompletedAnalyses.length === 0 ? '🚀 Ready to Analyze Your Data?' : '🔄 Continue Analyzing Your Data'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-3">
          {allCompletedAnalyses.length === 0
            ? 'Your dataset has been successfully uploaded and is ready for analysis. Choose one of the analysis options below to get started with AI-powered insights.'
            : `Great! You've completed ${allCompletedAnalyses.length} analysis${allCompletedAnalyses.length !== 1 ? 'es' : ''}. You can run additional analyses on the same dataset to get more insights.`
          }
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <span className="text-sm text-purple-800 dark:text-purple-200">
            {allCompletedAnalyses.length === 0
              ? <>💡 <strong>First time?</strong> We recommend starting with <strong>Quick AI Analysis</strong> for comprehensive insights</>
              : <>✨ <strong>Tip:</strong> Try different analysis types to explore various aspects of your data</>
            }
          </span>
        </div>
      </div>

      {/* Analysis Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Choose Your Analysis</CardTitle>
          <CardDescription className="text-center">
            Select the type of analysis you&apos;d like to perform on your dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((analysis) => {
              const Icon = analysis.icon;
              const isLoading = loading === analysis.id;
              const isCompleted = allCompletedAnalyses.includes(analysis.id);

              return (
                <Card
                  key={analysis.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    isCompleted
                      ? 'ring-2 ring-green-200 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200'
                      : analysis.recommended
                      ? 'ring-2 ring-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => !isLoading && handleAnalysisClick(analysis.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${analysis.color} text-white shadow-md`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {analysis.name}
                          </h3>
                          {isCompleted && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              ✅ Completed
                            </span>
                          )}
                          {analysis.recommended && !isCompleted && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                              ⭐ Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                          {analysis.description}
                        </p>
                        <Button
                          size="sm"
                          className={`mt-4 w-full transition-all ${
                            isCompleted
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                              : analysis.recommended
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                              : ''
                          }`}
                          disabled={isLoading}
                          variant={isCompleted || analysis.recommended ? "default" : "outline"}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing...
                            </>
                          ) : isCompleted ? (
                            <>
                              🔄 Run Again
                            </>
                          ) : (
                            <>
                              {analysis.recommended && '🚀 '}
                              Start Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200 text-lg">
            💡 Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>• <strong>New to data analysis?</strong> Start with &quot;Quick AI Analysis&quot; to get a comprehensive overview</p>
            <p>• <strong>Looking for patterns?</strong> Try &quot;Correlation Analysis&quot; to see how variables relate to each other</p>
            <p>• <strong>Want to predict outcomes?</strong> Use &quot;Regression Analysis&quot; for continuous predictions or &quot;Classification&quot; for categories</p>
            <p>• <strong>Exploring data segments?</strong> &quot;Clustering Analysis&quot; helps discover hidden groups in your data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
