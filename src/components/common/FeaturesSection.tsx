import React from 'react';
import { Upload, CheckCircle, Download } from 'lucide-react';
import { Card } from '../ui/Card';

export const FeaturesSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-16">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Why Choose Our Converter?
      </h3>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">E-Signature Support</h4>
          <p className="text-gray-600">
            Preserves digital signatures when converting PDFs to images.
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Professional Quality</h4>
          <p className="text-gray-600">
            600 DPI resolution for crystal-clear document conversions.
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Instant Download</h4>
          <p className="text-gray-600">
            Get your converted files immediately with one-click downloads.
          </p>
        </Card>
      </div>
    </div>
  );
};