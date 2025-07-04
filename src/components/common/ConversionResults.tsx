import React from 'react';
import { Download, CheckCircle, AlertCircle, FileImage, FileText } from 'lucide-react';
import { ConversionResult } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ConversionResultsProps {
  results: ConversionResult[];
  warning: string | null;
  error: string | null;
  onReset: () => void;
}

export const ConversionResults: React.FC<ConversionResultsProps> = ({ 
  results, 
  warning, 
  error,
  onReset 
}) => {
  const downloadFile = (result: ConversionResult) => {
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    results.forEach(result => downloadFile(result));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">
            Conversion Complete
          </h2>
        </div>
        {results.length > 1 && (
          <Button
            onClick={downloadAll}
            icon={<Download className="w-5 h-5" />}
          >
            Download All
          </Button>
        )}
      </div>

      {warning && (
        <Card className="p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-700">{warning}</p>
        </Card>
      )}

      {error && (
        <Card className="p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              {result.type === 'pdf' ? (
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              ) : (
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileImage className="w-6 h-6 text-blue-600" />
                </div>
              )}
             <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {result.fileName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {result.type} file • Exact dimensions
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => downloadFile(result)}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Download
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};