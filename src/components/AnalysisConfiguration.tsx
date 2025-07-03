"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/config";
import { ArrowLeft, Brain, CheckCircle, PieChart, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Dataset {
  id: string;
  name: string;
  rows_count: number;
  columns_count: number;
  uploaded_at: string;
}

interface ColumnInfo {
  name: string;
  dtype: string;
  non_null_count?: number;
}

interface AnalysisParameters {
  target_column?: string;
  feature_columns?: string[];
  features?: string[];
  n_clusters?: number;
  [key: string]: string | string[] | number | undefined;
}

interface AnalysisConfigurationProps {
  dataset: Dataset;
  analysisType: string;
  onBack: () => void;
  onAnalysisStart: (analysisType: string, datasetId: string, parameters: AnalysisParameters) => void;
}

export default function AnalysisConfiguration({
  dataset,
  analysisType,
  onBack,
  onAnalysisStart
}: AnalysisConfigurationProps) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [parameters, setParameters] = useState<AnalysisParameters>({});

  const analysisInfo = {
    regression: {
      name: 'Regression Analysis',
      description: 'Build predictive models and analyze variable relationships',
      icon: TrendingUp,
      color: 'bg-green-500',
      requiredParams: ['target_column'],
      optionalParams: ['feature_columns']
    },
    classification: {
      name: 'Classification',
      description: 'Build models to classify and predict categories',
      icon: PieChart,
      color: 'bg-red-500',
      requiredParams: ['target_column'],
      optionalParams: ['feature_columns']
    },
    clustering: {
      name: 'Clustering Analysis',
      description: 'Discover hidden patterns and group similar data points',
      icon: Zap,
      color: 'bg-orange-500',
      requiredParams: [],
      optionalParams: ['features', 'n_clusters']
    }
  };

  const currentAnalysis = analysisInfo[analysisType as keyof typeof analysisInfo];

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await fetch(getApiUrl(`/datasets/${dataset.id}/preview/`), {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dataset columns');
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // Handle different possible response structures
        const previewData = data.preview || data;
        let columnsData = previewData?.columns || [];

        // If columns data is not in expected format, try to extract from other properties
        if (!Array.isArray(columnsData) || columnsData.length === 0) {
          // Try to get columns from sample_data keys or other sources
          if (previewData?.sample_data && Array.isArray(previewData.sample_data) && previewData.sample_data.length > 0) {
            const sampleRow = previewData.sample_data[0];
            columnsData = Object.keys(sampleRow).map(key => ({
              name: key,
              dtype: typeof sampleRow[key] === 'number' ? 'float64' : 'object'
            }));
          }
        }

        // Ensure each column has required properties with safe access
        columnsData = columnsData.map((col: unknown) => {
          if (typeof col === 'string') {
            return { name: col, dtype: 'object', non_null_count: undefined };
          }

          const colObj = col as Record<string, unknown>;
          return {
            name: (colObj.name || colObj.column || '') as string,
            dtype: (colObj.dtype || colObj.type || 'object') as string,
            non_null_count: colObj.non_null_count as number | undefined
          };
        }).filter((col: ColumnInfo) => col.name); // Remove any columns without names

        console.log('Processed columns data:', columnsData); // Debug log
        console.log('Setting columns:', columnsData); // Debug log
        setColumns(columnsData);
      } catch (error) {
        console.error('Error fetching columns:', error);
        // Set empty array as fallback
        setColumns([]);
        alert('Failed to load dataset columns. Please try again or check the dataset preview first.');
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [dataset.id]);

  // More robust column type detection
  const numericColumns = columns.filter(col => {
    if (!col.dtype) return false;
    const dtype = col.dtype.toLowerCase().trim();

    // Check for numeric patterns
    const isNumeric = dtype.includes('int') ||
           dtype.includes('float') ||
           dtype.includes('number') ||
           dtype.includes('numeric') ||
           dtype.includes('decimal') ||
           dtype.includes('double') ||
           dtype === 'int64' ||
           dtype === 'float64' ||
           dtype === 'int32' ||
           dtype === 'float32' ||
           dtype.startsWith('int') ||
           dtype.startsWith('float') ||
           dtype.includes('digit');

    return isNumeric;
  });

  const categoricalColumns = columns.filter(col => {
    if (!col.dtype) return false;
    const dtype = col.dtype.toLowerCase().trim();

    // Check for categorical/text patterns
    const isCategorical = dtype.includes('object') ||
           dtype.includes('string') ||
           dtype.includes('category') ||
           dtype.includes('text') ||
           dtype.includes('str') ||
           dtype.includes('categorical') ||
           dtype === 'object' ||
           dtype === 'string' ||
           dtype.includes('char') ||
           dtype.includes('varchar') ||
           dtype.includes('bool');

    return isCategorical;
  });

  // Fallback: if no columns are detected in either category,
  // try to guess based on column names or treat all as potential targets
  // const allColumnsAsFallback = columns.length > 0 && numericColumns.length === 0 && categoricalColumns.length === 0;

  // Debug logs to see what columns are detected
  console.log('All columns:', columns);
  console.log('Numeric columns:', numericColumns);
  console.log('Categorical columns:', categoricalColumns);

  // Log each column's dtype for debugging
  columns.forEach(col => {
    console.log(`Column "${col.name}": dtype="${col.dtype}", normalized="${col.dtype?.toLowerCase().trim()}"`);
  });

  const handleParameterChange = (key: string, value: string | string[] | number) => {
    setParameters((prev: AnalysisParameters) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required parameters
    if (currentAnalysis?.requiredParams) {
      for (const param of currentAnalysis.requiredParams) {
        if (!parameters[param]) {
          alert(`Please select ${param.replace('_', ' ')}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await onAnalysisStart(analysisType, dataset.id, parameters);
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = currentAnalysis?.icon || Brain;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading dataset columns...</span>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="text-red-600">
                <CardTitle>Error Loading Dataset</CardTitle>
                <CardDescription>
                  Could not load column information from the dataset. Please try viewing the dataset preview first or re-upload the file.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className={`p-3 rounded-lg ${currentAnalysis?.color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>{currentAnalysis?.name}</CardTitle>
              <CardDescription>{currentAnalysis?.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dataset Info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Dataset: {dataset.name}
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            {dataset.rows_count?.toLocaleString()} rows × {dataset.columns_count} columns
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Parameter Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Analysis Parameters</CardTitle>
          <CardDescription>
            Select the appropriate columns and parameters for your {analysisType} analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Column Selection */}
          {(analysisType === 'regression' || analysisType === 'classification') && (
            <div className="space-y-2">
              <Label htmlFor="target_column" className="text-sm font-medium">
                Target Column *
                <span className="text-gray-500 ml-1">
                  ({analysisType === 'regression' ? 'numeric column to predict' : 'categorical column to classify'})
                </span>
              </Label>
              <Select onValueChange={(value) => handleParameterChange('target_column', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target column" />
                </SelectTrigger>
                <SelectContent>
                  {/* Temporary fallback: show all columns if no suitable ones found */}
                  {(analysisType === 'regression' ? numericColumns : categoricalColumns).length === 0 ? (
                    columns.length > 0 ? (
                      <>
                        <SelectItem value="fallback-header" disabled className="font-bold">
                          No {analysisType === 'regression' ? 'numeric' : 'categorical'} columns detected. Showing all columns:
                        </SelectItem>
                        {columns.map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name} ({col.dtype}) - Manual selection
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <SelectItem value="no-columns" disabled>
                        No columns found. Check console logs.
                      </SelectItem>
                    )
                  ) : (
                    (analysisType === 'regression' ? numericColumns : categoricalColumns).map((col) => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name} ({col.dtype})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Feature Columns Selection */}
          {(analysisType === 'regression' || analysisType === 'classification') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Feature Columns
                <span className="text-gray-500 ml-1">
                  (leave empty to auto-select all numeric columns except target)
                </span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {numericColumns.map((col) => (
                  <label key={col.name} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        const currentFeatures = parameters.feature_columns || [];
                        if (e.target.checked) {
                          handleParameterChange('feature_columns', [...currentFeatures, col.name]);
                        } else {
                          handleParameterChange('feature_columns', currentFeatures.filter((f: string) => f !== col.name));
                        }
                      }}
                    />
                    <span>{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Clustering Parameters */}
          {analysisType === 'clustering' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="n_clusters" className="text-sm font-medium">
                  Number of Clusters
                </Label>
                <Select onValueChange={(value) => handleParameterChange('n_clusters', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of clusters (default: 3)" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} clusters
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Features for Clustering
                  <span className="text-gray-500 ml-1">
                    (leave empty to use all numeric columns)
                  </span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {numericColumns.map((col) => (
                    <label key={col.name} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        onChange={(e) => {
                          const currentFeatures = parameters.features || [];
                          if (e.target.checked) {
                            handleParameterChange('features', [...currentFeatures, col.name]);
                          } else {
                            handleParameterChange('features', currentFeatures.filter((f: string) => f !== col.name));
                          }
                        }}
                      />
                      <span>{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Column Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium mb-2">Available Columns</h4>

            {/* Debug section - show all columns first */}
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded border">
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Debug: All Detected Columns ({columns.length})
              </h5>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 max-h-32 overflow-y-auto">
                {columns.length === 0 ? (
                  <p>No columns detected. Check console logs for API response.</p>
                ) : (
                  columns.map((col) => (
                    <div key={col.name}>
                      <strong>{col.name}</strong>: {col.dtype}
                      {numericColumns.includes(col) && <span className="text-green-600"> (detected as numeric)</span>}
                      {categoricalColumns.includes(col) && <span className="text-blue-600"> (detected as categorical)</span>}
                      {!numericColumns.includes(col) && !categoricalColumns.includes(col) && <span className="text-red-600"> (not classified)</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-600">Numeric Columns ({numericColumns.length})</h5>
                <ul className="text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {numericColumns.map((col) => (
                    <li key={col.name}>{col.name} ({col.dtype})</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-600">Categorical Columns ({categoricalColumns.length})</h5>
                <ul className="text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {categoricalColumns.map((col) => (
                    <li key={col.name}>{col.name} ({col.dtype})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Analysis...
              </>
            ) : (
              <>
                🚀 Start {currentAnalysis?.name}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200 text-lg">
            💡 Tips for {currentAnalysis?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
            {analysisType === 'regression' && (
              <>
                <p>• <strong>Target Column:</strong> Choose a numeric column you want to predict</p>
                <p>• <strong>Features:</strong> Select numeric columns that might influence the target</p>
                <p>• <strong>Tip:</strong> Remove highly correlated features to improve model performance</p>
              </>
            )}
            {analysisType === 'classification' && (
              <>
                <p>• <strong>Target Column:</strong> Choose a categorical column you want to classify</p>
                <p>• <strong>Features:</strong> Select columns that might help predict the category</p>
                <p>• <strong>Tip:</strong> Make sure your target column has clear, distinct categories</p>
              </>
            )}
            {analysisType === 'clustering' && (
              <>
                <p>• <strong>Clusters:</strong> Start with 3-5 clusters, adjust based on your data</p>
                <p>• <strong>Features:</strong> Use columns that represent different aspects of your data</p>
                <p>• <strong>Tip:</strong> Standardized features work best for clustering</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
