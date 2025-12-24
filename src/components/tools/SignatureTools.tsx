import React from 'react';
import { AlertCircle, PenTool } from 'lucide-react';
import { Card } from '../ui/Card';
import { ToolLayout } from '../layout/ToolLayout';

export const SignatureTools: React.FC = () => {
  return (
    <ToolLayout
      title="E-Signature Tools"
      description="Securely sign documents and verify signatures. We adhere to strict standards to ensure your digital signatures are preserved across all conversions."
      icon={<PenTool className="w-10 h-10 text-rose-600" />}
    >
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">

        <div className="relative">
          <div className="absolute inset-0 bg-rose-100 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-white p-6 rounded-full shadow-lg border border-rose-50">
            <PenTool className="w-16 h-16 text-rose-500" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Professional Signatures Coming Soon</h2>
          <p className="text-gray-600 leading-relaxed">
            We are building a comprehensive suite of e-signature tools that will allow you to sign PDFs,
            request signatures from others, and manage signed documents securely.
            Currently, our conversion tools automatically preserve all existing signatures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-8">
          <Card className="p-6 bg-yellow-50 border-yellow-100 flex items-start text-left">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Preserved Integrity</h3>
              <p className="text-yellow-700 text-sm">
                Converting PDFs to images or other formats with our tools keeps your existing digital signatures intact and visible.
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-blue-50 border-blue-100 flex items-start text-left">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">ISO Compliant</h3>
              <p className="text-blue-700 text-sm">
                Our upcoming tools will follow standard PDF signature protocols to ensure legal validity.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};