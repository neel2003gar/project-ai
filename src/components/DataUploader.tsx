"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/config";
import axios from "axios";
import { AlertCircle, CheckCircle, FileText, Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DataUploaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDatasetUploaded: (dataset: any) => void;
}

export default function DataUploader({ onDatasetUploaded }: DataUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', datasetName || file.name);
      formData.append('description', datasetDescription);

      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data',
      };

      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await axios.post(getApiUrl('/datasets/'), formData, {
        headers,
      });

      setUploadStatus({
        type: 'success',
        message: `Dataset "${response.data.name}" uploaded successfully! Redirecting to analysis options...`
      });

      // Small delay to show success message before transitioning
      setTimeout(() => {
        onDatasetUploaded(response.data);
      }, 1500);

      // Reset form
      setDatasetName('');
      setDatasetDescription('');

    } catch (error: unknown) {
      let errorMessage = 'Failed to upload dataset';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setUploadStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  }, [datasetName, datasetDescription, onDatasetUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Dataset</span>
          </CardTitle>
          <CardDescription>
            Upload your data files (CSV, Excel, JSON) to start analyzing with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dataset Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dataset Name</label>
              <Input
                placeholder="Enter dataset name (optional)"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                placeholder="Brief description of the dataset"
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              ) : (
                <FileText className="h-12 w-12 text-gray-400" />
              )}

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {uploading
                    ? 'Uploading and processing...'
                    : isDragActive
                      ? 'Drop the file here...'
                      : 'Drag & drop a file here, or click to select'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports CSV, Excel (.xlsx, .xls), and JSON files
                </p>
              </div>

              {!uploading && (
                <Button variant="outline">
                  Choose File
                </Button>
              )}
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus.type && (
            <div className={`
              flex items-center space-x-2 p-4 rounded-lg
              ${uploadStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }
            `}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{uploadStatus.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported File Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported File Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'CSV', desc: 'Comma-separated values', ext: '.csv' },
              { type: 'Excel', desc: 'Microsoft Excel files', ext: '.xlsx, .xls' },
              { type: 'JSON', desc: 'JavaScript Object Notation', ext: '.json' },
              { type: 'More', desc: 'Additional formats coming soon', ext: '...' }
            ].map((format, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white">{format.type}</div>
                <div className="text-sm text-gray-500 mt-1">{format.desc}</div>
                <div className="text-xs text-gray-400 mt-1">{format.ext}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
