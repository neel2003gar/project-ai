"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/config';
import { ArrowLeft, Calendar, Database, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface Dataset {
  id: string;
  name: string;
  description?: string;
  rows_count: number;
  columns_count: number;
  uploaded_at: string;
}

interface DatasetInfo {
  rows_count: number;
  columns_count: number;
  columns: string[];
  dtypes: Record<string, string>;
  memory_usage: number;
  missing_values: Record<string, number>;
  numeric_columns: string[];
  categorical_columns: string[];
}

interface DatasetPreviewData {
  columns: string[];
  data: Record<string, string | number | null>[];
  info: DatasetInfo;
}

interface DatasetPreviewProps {
  datasetId: string;
  onBack: () => void;
}

export default function DatasetPreview({ datasetId, onBack }: DatasetPreviewProps) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<DatasetPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasetPreview = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await fetch(getApiUrl(`/datasets/${datasetId}/preview/`), {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch dataset preview: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();

        // The backend returns the data directly, not nested under dataset/preview
        setDataset({
          id: datasetId,
          name: data.info?.name || 'Dataset',
          rows_count: data.info?.rows_count || 0,
          columns_count: data.info?.columns_count || 0,
          uploaded_at: new Date().toISOString()
        });
        setPreview(data);
      } catch (err) {
        console.error('Dataset preview error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the dataset preview');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasetPreview();
  }, [datasetId]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/30 shadow-xl backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-700 font-medium">Loading dataset preview...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 shadow-xl">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-700 mb-6 font-medium">Error: {error}</p>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dataset || !preview) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analysis Options
        </Button>
      </div>

      {/* Dataset Overview */}
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/30 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Database className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">{dataset.name}</span>
          </CardTitle>
          {dataset.description && (
            <CardDescription className="text-gray-600 font-medium">{dataset.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Rows</p>
                <p className="text-xl font-bold text-gray-800">{preview.info?.rows_count?.toLocaleString() || dataset.rows_count.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Columns</p>
                <p className="text-xl font-bold text-gray-800">{preview.info?.columns_count || dataset.columns_count}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Memory Usage</p>
                <p className="text-xl font-bold text-gray-800">{preview.info?.memory_usage ? `${(preview.info.memory_usage / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Information */}
      {preview.columns && preview.info && (
        <Card className="bg-gradient-to-br from-white to-green-50/30 border-green-200/30 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                <Database className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-green-800 bg-clip-text text-transparent">Columns Overview</span>
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Data types and column information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preview.columns.map((columnName: string, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
                  <div className="font-bold text-gray-900 mb-1">
                    {columnName}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Type: <span className="font-medium text-blue-600">{preview.info.dtypes[columnName] || 'unknown'}</span>
                  </div>
                  {preview.info.missing_values && (
                    <div className="text-xs text-gray-500">
                      Missing: <span className="font-medium">{preview.info.missing_values[columnName] || 0}</span> / {preview.info.rows_count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {preview.data && (
        <Card className="bg-gradient-to-br from-white to-purple-50/30 border-purple-200/30 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">Data Preview</span>
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">First few rows of your dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    {Object.keys(preview.data[0] || {}).map((header) => (
                      <th key={header} className="text-left p-3 font-bold text-gray-800 text-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.data.slice(0, 10).map((row: Record<string, string | number | null>, index: number) => (
                    <tr key={index} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      {Object.values(row).map((value: string | number | null, cellIndex: number) => (
                        <td key={cellIndex} className="p-3 text-sm text-gray-700">
                          {value !== null && value !== undefined ? String(value) : <span className="text-gray-400 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.data.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-3">
                Showing first 10 rows of <span className="font-bold text-gray-700">{preview.info?.rows_count?.toLocaleString() || 'many'}</span> total rows
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
