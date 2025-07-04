import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const MergeTools: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">PDF Merging Tools Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Combine multiple PDF files into a single document with our upcoming
            merge tool. Reorder pages, remove content, and create professional
            documents from multiple sources.
          </p>
          <Button className="mx-auto" variant="primary">
            Join Waitlist
          </Button>
        </Card>
      </div>
    </div>
  );
};