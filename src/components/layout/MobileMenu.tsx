import React from 'react';
import { ToolType } from '../../types';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  activeTool, 
  setActiveTool 
}) => {
  if (!isOpen) return null;

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Menu</h3>
          <Button variant="secondary" icon={<X />} onClick={onClose} />
        </div>
        <div className="p-4 space-y-2">
          <Button
            variant={activeTool === 'pdf' ? 'primary' : 'secondary'}
            className="w-full"
            onClick={() => handleToolChange('pdf')}
          >
            PDF Tools
          </Button>
          <Button
            variant={activeTool === 'image' ? 'primary' : 'secondary'}
            className="w-full"
            onClick={() => handleToolChange('image')}
          >
            Image Tools
          </Button>
          <Button
            variant={activeTool === 'signature' ? 'primary' : 'secondary'}
            className="w-full"
            onClick={() => handleToolChange('signature')}
          >
            E-Signatures
          </Button>
          <Button
            variant={activeTool === 'merge' ? 'primary' : 'secondary'}
            className="w-full"
            onClick={() => handleToolChange('merge')}
          >
            Merge PDFs
          </Button>
        </div>
      </div>
    </div>
  );
};