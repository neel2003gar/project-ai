/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/config';
import {
  Award,
  BarChart3,
  Brain,
  ChevronRight,
  Database,
  Eye,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Home,
  Layers,
  Lightbulb,
  PieChart,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Workflow
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AnalysisConfiguration from './AnalysisConfiguration';
import AnalysisInsights from './AnalysisInsights';
import AnalysisOptions from './AnalysisOptions';
import DatasetPreview from './DatasetPreview';
import DataUploader from './DataUploader';
import AnalysisVisualizations from './EnhancedAnalysisVisualizations';
import QuickAnalysisResults from './QuickAnalysisResults';

interface Dataset {
  id: string;
  name: string;
  description?: string;
  rows_count: number;
  columns_count: number;
  uploaded_at: string;
  file_size?: number;
  file_size_mb?: number;
  file_type?: string;
}

interface Analysis {
  id: string;
  dataset: string;
  dataset_name: string;
  analysis_type: string;
  title: string;
  description?: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalDatasets: number;
  totalAnalyses: number;
  totalFileSize: number;
  recentActivity: number;
  analysisTypes: Record<string, number>;
  avgAccuracy?: number;
  topPerformingModel?: string;
}

type ViewType = 'overview' | 'datasets' | 'analyses' | 'upload' | 'analyze' | 'configure' | 'preview' | 'results' | 'insights' | 'workflow' | 'settings';

export default function AdvancedDashboard() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [configureAnalysisType, setConfigureAnalysisType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [quickAnalysisResults, setQuickAnalysisResults] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDatasets: 0,
    totalAnalyses: 0,
    totalFileSize: 0,
    recentActivity: 0,
    analysisTypes: {},
    avgAccuracy: 0,
    topPerformingModel: 'None'
  });

  // Fetch data functions
  const fetchDatasets = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(getApiUrl('/datasets/'), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDatasets(data);

        // Calculate enhanced stats
        const totalSize = data.reduce((sum: number, dataset: Dataset) => sum + (dataset.file_size || 0), 0);
        const recentCount = data.filter((dataset: Dataset) => {
          const uploadDate = new Date(dataset.uploaded_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return uploadDate > weekAgo;
        }).length;

        setStats(prev => ({
          ...prev,
          totalDatasets: data.length,
          totalFileSize: totalSize,
          recentActivity: recentCount
        }));
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  }, []);

  const fetchAnalyses = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(getApiUrl('/analyses/'), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);

        // Calculate analysis statistics
        const analysisTypes: Record<string, number> = {};
        let totalAccuracy = 0;
        let accuracyCount = 0;
        let topPerformingModel = 'None';
        let maxAccuracy = 0;

        data.forEach((analysis: Analysis) => {
          analysisTypes[analysis.analysis_type] = (analysisTypes[analysis.analysis_type] || 0) + 1;

          // Extract accuracy if available
          if (analysis.results?.accuracy) {
            totalAccuracy += analysis.results.accuracy;
            accuracyCount++;
            if (analysis.results.accuracy > maxAccuracy) {
              maxAccuracy = analysis.results.accuracy;
              topPerformingModel = analysis.analysis_type;
            }
          }
          if (analysis.results?.model_performance?.test_r2) {
            const r2 = analysis.results.model_performance.test_r2;
            totalAccuracy += r2;
            accuracyCount++;
            if (r2 > maxAccuracy) {
              maxAccuracy = r2;
              topPerformingModel = analysis.analysis_type;
            }
          }
        });

        setStats(prev => ({
          ...prev,
          totalAnalyses: data.length,
          analysisTypes,
          avgAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0,
          topPerformingModel
        }));
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  }, []);

  // Effect to debug state changes
  useEffect(() => {
    console.log('Current view changed to:', currentView);
    if (currentView === 'results') {
      console.log('Selected analysis:', selectedAnalysis);
    }
  }, [currentView, selectedAnalysis]);

  // Effect hooks
  useEffect(() => {
    fetchDatasets();
    fetchAnalyses();
  }, [fetchDatasets, fetchAnalyses]);

  // Event handlers
  const handleDatasetUploaded = (dataset: Dataset) => {
    setDatasets(prev => [dataset, ...prev]);
    setSelectedDataset(dataset);
    setCurrentView('analyze');
  };

  const handleAnalysisStart = async (analysisType: string, datasetId: string, parameters: Record<string, any> = {}) => {
    setLoading(true);
    console.log('Starting analysis:', { analysisType, datasetId, parameters });

    // Handle Quick Analysis separately
    if (analysisType === 'quick_analysis') {
      console.log('Redirecting to Quick Analysis handler');
      setLoading(false);
      await handleQuickAnalysis(datasetId);
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(getApiUrl('/analyses/'), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset_id: datasetId,
          analysis_type: analysisType,
          title: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis`,
          description: `Analysis performed on ${selectedDataset?.name}`,
          parameters
        }),
      });

      if (response.ok) {
        const newAnalysis = await response.json();
        console.log('New analysis created:', newAnalysis);
        setAnalyses(prev => [newAnalysis, ...prev]);
        setSelectedAnalysis(newAnalysis);
        setCurrentView('results');
        await fetchAnalyses();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);

        // Enhanced error message with more details
        let errorMessage = `Error creating analysis: ${errorData.detail || 'Unknown error'}`;

        // Add specific error information if available
        if (errorData.error) {
          errorMessage = `Analysis failed: ${errorData.error}`;
        }

        // Show user-friendly error message
        alert(errorMessage + `

Please check:
• Your dataset contains numeric columns for ${analysisType} analysis
• Numeric columns don't contain commas, dollar signs, or text
• The dataset has enough valid data points
• Try uploading a clean dataset with properly formatted numbers

Technical details have been logged to the console.`);
      }
    } catch (error) {
      console.error('Error creating analysis:', error);
      if (error instanceof Error) {
        alert(`Network error: ${error.message}`);
      } else {
        alert('Network error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnalysis = async (datasetId: string) => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(getApiUrl('/analyses/quick_analysis/'), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset_id: datasetId }),
      });

      if (response.ok) {
        const results = await response.json();
        console.log('Quick analysis results:', results);
        setQuickAnalysisResults(results);
        setCurrentView('insights');
      } else {
        const errorData = await response.json();
        console.error('Quick analysis error:', errorData);
        alert(`Error performing quick analysis: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error performing quick analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset functionality - clears all user data
  const handleResetUserData = async () => {
    // Enhanced confirmation dialog
    const confirmMessage = `⚠️ DANGER ZONE ⚠️

Are you absolutely sure you want to reset ALL your data?

This will permanently delete:
• ${stats.totalDatasets} dataset(s)
• ${stats.totalAnalyses} analysis/analyses
• All uploaded files and results
• All analysis configurations

This action CANNOT be undone!

Type "RESET" below to confirm:`;

    const userInput = window.prompt(confirmMessage);

    if (userInput !== 'RESET') {
      if (userInput !== null) {
        alert('Reset cancelled. Please type "RESET" exactly to confirm.');
      }
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      let deletedDatasets = 0;
      let deletedAnalyses = 0;

      // Delete all analyses first
      if (analyses.length > 0) {
        console.log(`Deleting ${analyses.length} analyses...`);
        const deleteAnalysesPromises = analyses.map(async (analysis) => {
          try {
            const response = await fetch(getApiUrl(`/analyses/${analysis.id}/`), {
              method: 'DELETE',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) deletedAnalyses++;
            return response;
          } catch (error) {
            console.error(`Error deleting analysis ${analysis.id}:`, error);
            return null;
          }
        });
        await Promise.all(deleteAnalysesPromises);
      }

      // Delete all datasets
      if (datasets.length > 0) {
        console.log(`Deleting ${datasets.length} datasets...`);
        const deleteDatasetsPromises = datasets.map(async (dataset) => {
          try {
            const response = await fetch(getApiUrl(`/datasets/${dataset.id}/`), {
              method: 'DELETE',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) deletedDatasets++;
            return response;
          } catch (error) {
            console.error(`Error deleting dataset ${dataset.id}:`, error);
            return null;
          }
        });
        await Promise.all(deleteDatasetsPromises);
      }

      // Reset local state
      setDatasets([]);
      setAnalyses([]);
      setSelectedDataset(null);
      setSelectedAnalysis(null);
      setConfigureAnalysisType('');
      setQuickAnalysisResults(null);
      setStats({
        totalDatasets: 0,
        totalAnalyses: 0,
        totalFileSize: 0,
        recentActivity: 0,
        analysisTypes: {},
        avgAccuracy: 0,
        topPerformingModel: 'None'
      });

      // Navigate back to overview
      setCurrentView('overview');

      alert(`✅ Reset Complete!

Successfully deleted:
• ${deletedDatasets} dataset(s)
• ${deletedAnalyses} analysis/analyses

Your account is now reset and ready for fresh data.`);

    } catch (error) {
      console.error('Error resetting user data:', error);
      alert(`❌ Reset Error

An error occurred while resetting data:
${error instanceof Error ? error.message : 'Unknown error'}

Some data may not have been deleted. Please try again or contact support if the problem persists.`);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisTypeInfo = (type: string) => {
    const types: Record<string, { name: string; icon: any; color: string; description: string }> = {
      'quick_analysis': {
        name: 'Quick AI Analysis',
        icon: Sparkles,
        color: 'bg-purple-500',
        description: 'Comprehensive overview with AI insights'
      },
      'descriptive': {
        name: 'Descriptive Statistics',
        icon: BarChart3,
        color: 'bg-blue-500',
        description: 'Statistical summary of your data'
      },
      'correlation': {
        name: 'Correlation Analysis',
        icon: GitBranch,
        color: 'bg-cyan-500',
        description: 'Relationships between variables'
      },
      'regression': {
        name: 'Regression Analysis',
        icon: TrendingUp,
        color: 'bg-green-500',
        description: 'Predictive modeling for continuous outcomes'
      },
      'classification': {
        name: 'Classification',
        icon: Target,
        color: 'bg-red-500',
        description: 'Predictive modeling for categories'
      },
      'clustering': {
        name: 'Clustering Analysis',
        icon: Layers,
        color: 'bg-orange-500',
        description: 'Discover hidden patterns and groups'
      },
      'visualization': {
        name: 'Data Visualization',
        icon: PieChart,
        color: 'bg-indigo-500',
        description: 'Custom charts and plots'
      }
    };
    return types[type] || { name: type, icon: FileText, color: 'bg-gray-500', description: 'Analysis' };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Navigation items with enhanced categorization
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      category: 'main',
      description: 'Dashboard summary and key metrics'
    },
    {
      id: 'datasets',
      label: 'Datasets',
      icon: Database,
      category: 'data',
      description: 'Manage your uploaded datasets'
    },
    {
      id: 'analyses',
      label: 'Analyses',
      icon: Brain,
      category: 'analysis',
      description: 'View and manage your analyses'
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Sparkles,
      category: 'analysis',
      description: 'AI-powered data insights'
    },
    {
      id: 'workflow',
      label: 'Workflow',
      icon: Workflow,
      category: 'tools',
      description: 'Multi-step analysis workflow'
    },
    {
      id: 'upload',
      label: 'Upload Data',
      icon: Upload,
      category: 'tools',
      description: 'Add new datasets'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      category: 'config',
      description: 'Configure preferences'
    },
  ];

  // Enhanced sidebar with better organization
  const renderSidebar = () => (
    <div className="w-72 bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-xl shadow-2xl h-screen overflow-y-auto border-r border-white/20 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/30 backdrop-blur-sm"></div>
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-gradient-to-r from-transparent via-blue-200/30 to-transparent">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">AI Analytics</h1>
            <p className="text-sm text-gray-600 font-medium">Data Analysis Platform</p>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user?.first_name || user?.username || 'User'}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-green-600 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Datasets</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{stats.totalDatasets}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-100/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Analyses</span>
            </div>
            <p className="text-xl font-bold text-emerald-800">{stats.totalAnalyses}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id as ViewType)}
                  className={`w-full group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-blue-200/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'} transition-colors duration-200`} />
                  <div className="flex-1 text-left">
                    <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                    {isActive && (
                      <p className="text-xs text-blue-100 mt-0.5 font-medium">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.id === 'analyses' && stats.totalAnalyses > 0 && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={`text-xs ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {stats.totalAnalyses}
                    </Badge>
                  )}
                  {item.id === 'datasets' && stats.totalDatasets > 0 && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={`text-xs ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {stats.totalDatasets}
                    </Badge>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-blue-200/40 to-transparent">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 border-gray-200 hover:border-transparent transition-all duration-300 backdrop-blur-sm"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  // Enhanced Overview with comprehensive metrics
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Welcome back, {user?.first_name || user?.username || 'User'}!
            </h2>
            <p className="text-blue-100 text-lg font-medium">
              Ready to unlock insights from your data? Let&apos;s dive into your analytics dashboard.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-28 h-28 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-14 w-14 text-white animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <Button
            onClick={() => setCurrentView('upload')}
            className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Dataset
          </Button>
          <Button
            onClick={() => setCurrentView('analyses')}
            variant="outline"
            className="border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm hover:scale-105 transition-all duration-200 font-semibold"
          >
            <Brain className="h-4 w-4 mr-2" />
            View Analyses
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">Total Datasets</CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Database className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">{stats.totalDatasets}</div>
            <p className="text-sm text-emerald-600 mt-2 font-medium">
              +{stats.recentActivity} this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-green-100/50 border-emerald-200/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700">Total Analyses</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
              <Brain className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-900 bg-clip-text text-transparent">{stats.totalAnalyses}</div>
            <p className="text-sm text-blue-600 mt-2 font-medium">
              Across {Object.keys(stats.analysisTypes).length} types
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700">Storage Used</CardTitle>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
              <FileSpreadsheet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">{formatFileSize(stats.totalFileSize)}</div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Data processed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-amber-100/50 border-orange-200/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-orange-700">Avg Performance</CardTitle>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
              <Award className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-700 to-amber-900 bg-clip-text text-transparent">
              {stats.avgAccuracy ? `${(stats.avgAccuracy * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Model accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Types Distribution */}
      {Object.keys(stats.analysisTypes).length > 0 && (
        <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">Analysis Types Distribution</span>
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Breakdown of analysis types you&apos;ve performed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.analysisTypes).map(([type, count]) => {
                const info = getAnalysisTypeInfo(type);
                const Icon = info.icon;
                return (
                  <div key={type} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className={`p-3 rounded-xl ${info.color} shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{info.name}</p>
                      <p className="text-xs text-gray-600 font-medium">{count} analyses</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Datasets */}
        <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/30 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <Database className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">Recent Datasets</span>
            </CardTitle>
            <CardDescription className="font-medium text-gray-600">Your latest uploaded datasets</CardDescription>
          </CardHeader>
          <CardContent>
            {datasets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-gray-600 mb-4 font-medium">No datasets uploaded yet</p>
                <Button
                  onClick={() => setCurrentView('upload')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Dataset
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {datasets.slice(0, 3).map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <FileSpreadsheet className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{dataset.name}</p>
                        <p className="text-xs text-gray-600 font-medium">
                          {dataset.rows_count} rows • {dataset.columns_count} columns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDataset(dataset);
                          setCurrentView('analyze');
                        }}
                        className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white border-blue-300 text-blue-700 transition-all duration-200"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                ))}
                {datasets.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                    onClick={() => setCurrentView('datasets')}
                  >
                    View All Datasets ({datasets.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200/30 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-emerald-800 bg-clip-text text-transparent">Recent Analyses</span>
            </CardTitle>
            <CardDescription className="font-medium text-gray-600">Your latest analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-gray-600 mb-4 font-medium">No analyses performed yet</p>
                <Button
                  onClick={() => setCurrentView('datasets')}
                  disabled={datasets.length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Analyzing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.slice(0, 3).map((analysis) => {
                  const info = getAnalysisTypeInfo(analysis.analysis_type);
                  const Icon = info.icon;
                  return (
                    <div key={analysis.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 rounded-xl border border-emerald-200/50 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${info.color} shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{analysis.title}</p>
                          <p className="text-xs text-gray-600 font-medium">
                            {formatDate(analysis.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAnalysis(analysis);
                          setCurrentView('results');
                        }}
                        className="hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-600 hover:text-white border-emerald-300 text-emerald-700 transition-all duration-200"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  );
                })}
                {analyses.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 border-emerald-300 text-emerald-700 hover:text-emerald-800 transition-all duration-200"
                    onClick={() => setCurrentView('analyses')}
                  >
                    View All Analyses ({analyses.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-white to-amber-50/30 border-amber-200/30 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-amber-800 bg-clip-text text-transparent">Quick Actions</span>
          </CardTitle>
          <CardDescription className="font-medium text-gray-600">Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button
              onClick={() => setCurrentView('upload')}
              className="h-24 flex-col space-y-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              variant="default"
            >
              <Upload className="h-8 w-8" />
              <span className="font-semibold">Upload Dataset</span>
            </Button>
            <Button
              onClick={() => {
                if (datasets.length > 0) {
                  setSelectedDataset(datasets[0]);
                  handleQuickAnalysis(datasets[0].id);
                }
              }}
              className="h-24 flex-col space-y-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500"
              variant="default"
              disabled={datasets.length === 0}
            >
              <Sparkles className="h-8 w-8" />
              <span className="font-semibold">Quick Analysis</span>
            </Button>
            <Button
              onClick={() => setCurrentView('workflow')}
              className="h-24 flex-col space-y-3 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              variant="default"
            >
              <Workflow className="h-8 w-8" />
              <span className="font-semibold">Start Workflow</span>
            </Button>
          </div>

          {/* Additional Actions Row */}
          <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-amber-200/40 to-transparent">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => setCurrentView('datasets')}
                variant="ghost"
                size="sm"
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-blue-700 hover:text-blue-800 transition-all duration-200"
              >
                <Database className="h-4 w-4 mr-2" />
                View All Datasets
              </Button>
              <Button
                onClick={() => setCurrentView('analyses')}
                variant="ghost"
                size="sm"
                className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-100 text-emerald-700 hover:text-emerald-800 transition-all duration-200"
              >
                <Brain className="h-4 w-4 mr-2" />
                View All Analyses
              </Button>
              <Button
                onClick={() => setCurrentView('settings')}
                variant="ghost"
                size="sm"
                className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:text-gray-800 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {(stats.totalDatasets > 0 || stats.totalAnalyses > 0) && (
                <Button
                  onClick={handleResetUserData}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced Datasets View
  const renderDatasets = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">Your Datasets</h2>
          <p className="text-gray-600 font-medium mt-2">Manage and analyze your uploaded data files</p>
        </div>
        <Button
          onClick={() => setCurrentView('upload')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Dataset
        </Button>
      </div>

      {datasets.length === 0 ? (
        <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/30 shadow-xl backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Database className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No datasets yet</h3>
            <p className="text-gray-600 mb-8 font-medium">Upload your first dataset to start analyzing your data</p>
            <Button
              onClick={() => setCurrentView('upload')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Dataset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {datasets.map((dataset) => (
            <Card key={dataset.id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/30 border-blue-200/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800">{dataset.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-blue-600">
                        {dataset.file_type?.toUpperCase()} file
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                      <p className="text-sm text-blue-700 font-semibold">Rows</p>
                      <p className="text-xl font-bold text-blue-800">{dataset.rows_count.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200/50">
                      <p className="text-sm text-emerald-700 font-semibold">Columns</p>
                      <p className="text-xl font-bold text-emerald-800">{dataset.columns_count}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Size</p>
                      <p className="font-bold text-gray-800">{formatFileSize(dataset.file_size || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Uploaded</p>
                      <p className="font-bold text-gray-800">{formatDate(dataset.uploaded_at)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDataset(dataset);
                        setCurrentView('preview');
                      }}
                      variant="outline"
                      className="flex-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDataset(dataset);
                        setCurrentView('analyze');
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleQuickAnalysis(dataset.id)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Quick AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Enhanced Analyses View
  const renderAnalyses = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent">Your Analyses</h2>
          <p className="text-gray-600 font-medium mt-2">Review your completed data analysis results</p>
        </div>
        <Button
          onClick={() => setCurrentView('datasets')}
          disabled={datasets.length === 0}
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {analyses.length === 0 ? (
        <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200/30 shadow-xl backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No analyses yet</h3>
            <p className="text-gray-600 mb-8 font-medium">Start by analyzing one of your datasets</p>
            <Button
              onClick={() => setCurrentView('datasets')}
              disabled={datasets.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500"
            >
              <Brain className="h-4 w-4 mr-2" />
              Start Analyzing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {analyses.map((analysis) => {
            const info = getAnalysisTypeInfo(analysis.analysis_type);
            const Icon = info.icon;
            return (
              <Card key={analysis.id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200/30 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${info.color} shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{analysis.title}</h3>
                        <p className="text-gray-600 font-medium">
                          Dataset: {analysis.dataset_name} • {formatDate(analysis.created_at)}
                        </p>
                        <p className="text-sm text-emerald-600 mt-2 font-medium">{info.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold"
                      >
                        {info.name}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('Viewing analysis results for:', analysis);
                          setSelectedAnalysis(analysis);
                          setCurrentView('results');
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Enhanced Workflow View
  const renderWorkflow = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">Analysis Workflow</h2>
        <p className="text-gray-600 font-medium mt-2">Step-by-step guided analysis process</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Data */}
        <Card className="border-l-4 border-blue-500 bg-gradient-to-br from-white to-blue-50/30 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">1</div>
              <span className="text-lg font-bold text-blue-800">Select Dataset</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4 font-medium">Choose a dataset to analyze</p>
            {selectedDataset ? (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl shadow-md">
                <p className="font-bold text-green-800">{selectedDataset.name}</p>
                <p className="text-sm text-green-600 font-medium">
                  {selectedDataset.rows_count} rows • {selectedDataset.columns_count} columns
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {datasets.slice(0, 3).map((dataset) => (
                  <button
                    key={dataset.id}
                    onClick={() => setSelectedDataset(dataset)}
                    className="w-full p-4 text-left border border-blue-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <p className="font-semibold text-sm text-gray-800">{dataset.name}</p>
                    <p className="text-xs text-gray-600 font-medium">
                      {dataset.rows_count} rows • {dataset.columns_count} columns
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Analysis Type */}
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <span>Choose Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Select analysis type</p>
            <div className="space-y-2">
              {['descriptive', 'correlation', 'regression', 'clustering'].map((type) => {
                const info = getAnalysisTypeInfo(type);
                const Icon = info.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setConfigureAnalysisType(type)}
                    className={`w-full p-3 text-left border rounded-lg hover:bg-gray-50 ${
                      configureAnalysisType === type ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{info.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Execute */}
        <Card className="border-l-4 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <span>Run Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Execute your analysis</p>
            <Button
              onClick={() => {
                if (selectedDataset && configureAnalysisType) {
                  handleAnalysisStart(configureAnalysisType, selectedDataset.id);
                }
              }}
              disabled={!selectedDataset || !configureAnalysisType || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>

            {selectedDataset && configureAnalysisType && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700">
                  Ready to run {getAnalysisTypeInfo(configureAnalysisType).name} on {selectedDataset.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Enhanced AI Insights View
  const renderInsights = () => (
    <div className="space-y-6">
      {quickAnalysisResults ? (
        <QuickAnalysisResults
          results={quickAnalysisResults}
          onBack={() => setCurrentView('overview')}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
              <p className="text-gray-600">Automated analysis and intelligent recommendations</p>
            </div>
            <Button
              onClick={() => {
                if (datasets.length > 0) {
                  handleQuickAnalysis(datasets[0].id);
                }
              }}
              disabled={datasets.length === 0 || loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Insights
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights generated yet</h3>
              <p className="text-gray-500 mb-6">Upload a dataset and generate AI insights to see automated analysis</p>
              <Button
                onClick={() => setCurrentView('upload')}
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Dataset
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  // Main content renderer
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'datasets':
        return renderDatasets();
      case 'analyses':
        return renderAnalyses();
      case 'insights':
        return renderInsights();
      case 'workflow':
        return renderWorkflow();
      case 'upload':
        return (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Dataset</h2>
              <p className="text-gray-600">Add a new dataset to start your analysis journey</p>
            </div>
            <DataUploader onDatasetUploaded={handleDatasetUploaded} />
          </div>
        );
      case 'analyze':
        return selectedDataset ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analyze Dataset</h2>
                <p className="text-gray-600">Choose analysis type for {selectedDataset.name}</p>
              </div>
              <Button
                onClick={() => setCurrentView('datasets')}
                variant="outline"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Datasets
              </Button>
            </div>
            <AnalysisOptions
              dataset={selectedDataset}
              onAnalysisStart={handleAnalysisStart}
              onViewDataset={() => setCurrentView('preview')}
              onConfigureAnalysis={(type) => {
                setConfigureAnalysisType(type);
                setCurrentView('configure');
              }}
              completedAnalyses={analyses.filter(a => a.dataset === selectedDataset.id).map(a => a.analysis_type)}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No dataset selected</p>
            <Button onClick={() => setCurrentView('datasets')} className="mt-4">
              Select Dataset
            </Button>
          </div>
        );
      case 'configure':
        return selectedDataset && configureAnalysisType ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configure Analysis</h2>
                <p className="text-gray-600">
                  Set parameters for {getAnalysisTypeInfo(configureAnalysisType).name}
                </p>
              </div>
              <Button
                onClick={() => setCurrentView('analyze')}
                variant="outline"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Back
              </Button>
            </div>
            <AnalysisConfiguration
              dataset={selectedDataset}
              analysisType={configureAnalysisType}
              onAnalysisStart={handleAnalysisStart}
              onBack={() => setCurrentView('analyze')}
            />
          </div>
        ) : null;
      case 'preview':
        return selectedDataset ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dataset Preview</h2>
                <p className="text-gray-600">Exploring {selectedDataset.name}</p>
              </div>
              <Button
                onClick={() => setCurrentView('datasets')}
                variant="outline"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Datasets
              </Button>
            </div>
            <DatasetPreview datasetId={selectedDataset.id} onBack={() => setCurrentView('datasets')} />
          </div>
        ) : null;
      case 'results':
        return selectedAnalysis ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <p className="text-gray-600">{selectedAnalysis.title}</p>
              </div>
              <Button
                onClick={() => setCurrentView('analyses')}
                variant="outline"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Analyses
              </Button>
            </div>
            <Tabs defaultValue="insights">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                <TabsTrigger value="raw">Raw Results (Debug)</TabsTrigger>
              </TabsList>
              <TabsContent value="insights">
                {selectedAnalysis.results ? (
                  <AnalysisInsights
                    analysisType={selectedAnalysis.analysis_type}
                    results={selectedAnalysis.results}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500">No analysis results available.</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Analysis Type: {selectedAnalysis.analysis_type}<br/>
                      Results: {JSON.stringify(selectedAnalysis.results)}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="visualizations">
                <AnalysisVisualizations
                  datasetId={selectedAnalysis.dataset}
                  analysisData={selectedAnalysis.results}
                  analysisType={selectedAnalysis.analysis_type}
                />
              </TabsContent>
              <TabsContent value="raw">
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Analysis Results</CardTitle>
                    <CardDescription>
                      Debug view of the complete analysis output from the backend
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Analysis Type:</h4>
                        <code className="text-sm bg-gray-100 text-gray-800 p-2 rounded">{selectedAnalysis.analysis_type}</code>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Results:</h4>
                        <pre className="text-xs bg-gray-50 text-gray-900 p-4 rounded border overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                          {JSON.stringify(selectedAnalysis.results, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Full Analysis Object:</h4>
                        <pre className="text-xs bg-gray-50 text-gray-900 p-4 rounded border overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                          {JSON.stringify(selectedAnalysis, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis selected</h3>
            <p className="text-gray-500 mb-6">Please select an analysis to view its results</p>
            <Button onClick={() => setCurrentView('analyses')}>
              <Brain className="h-4 w-4 mr-2" />
              View Analyses
            </Button>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Configure your preferences and account settings</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <p className="text-sm text-gray-900">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your datasets, analyses, and application data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Data Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{stats.totalDatasets}</div>
                      <div className="text-sm text-blue-600">Datasets</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{stats.totalAnalyses}</div>
                      <div className="text-sm text-green-600">Analyses</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">{formatFileSize(stats.totalFileSize)}</div>
                      <div className="text-sm text-purple-600">Storage Used</div>
                    </div>
                  </div>

                  {/* Reset Section */}
                  <div className="border-t pt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-800">Reset All Data</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Permanently delete all your datasets, analyses, and start fresh.
                            This action cannot be undone.
                          </p>
                          <Button
                            onClick={handleResetUserData}
                            variant="destructive"
                            size="sm"
                            className="mt-3"
                            disabled={loading || (stats.totalDatasets === 0 && stats.totalAnalyses === 0)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Reset All Data
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setCurrentView('upload')}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Dataset
                      </Button>
                      <Button
                        onClick={() => setCurrentView('datasets')}
                        variant="outline"
                        size="sm"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        View Datasets
                      </Button>
                      <Button
                        onClick={() => setCurrentView('analyses')}
                        variant="outline"
                        size="sm"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        View Analyses
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {renderSidebar()}
      <div className="flex-1 overflow-auto">
        <main className="p-6 max-w-7xl mx-auto">
          {loading && (
            <div className="fixed top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="font-medium">Processing analysis...</span>
              </div>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
