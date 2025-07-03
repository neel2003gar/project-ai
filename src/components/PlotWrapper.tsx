"use client";

import dynamic from 'next/dynamic';

// Define the Plot component props interface
interface PlotProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layout?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  style?: React.CSSProperties;
  className?: string;
}

// Dynamically import Plot with no SSR to avoid "self is not defined" error
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading visualization...</p>
      </div>
    </div>
  ),
}) as React.ComponentType<PlotProps>;

export default function PlotWrapper(props: PlotProps) {
  return <Plot {...props} />;
}
