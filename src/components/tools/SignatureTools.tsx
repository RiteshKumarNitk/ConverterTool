import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const SignatureTools: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional E-Signature Solutions</h2>
          <p className="text-gray-600 mb-6">
            Securely sign documents and verify signatures with our upcoming 
            digital signature tools. Preserve signatures across conversions
            and maintain document integrity.
          </p>
        </Card>

        <Card className="p-4 mt-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-700">
            Your current PDF to image conversions already preserve existing signatures
          </p>
        </Card>
      </div>
    </div>
  );
};