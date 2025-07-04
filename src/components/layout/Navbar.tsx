import React from 'react';
import { FileText, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { ToolType } from '../../types';
import { MobileMenu } from './MobileMenu';

interface NavbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}


export const Navbar: React.FC<NavbarProps> = ({ activeTool, setActiveTool }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              {/* <span className="ml-2 text-xl font-bold text-gray-800">FileTools Pro</span> */}
                <Button
                  variant={activeTool === 'home' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTool('home')}
                >
                  FileTools Pro
                </Button>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <Button
                  variant={activeTool === 'pdf' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTool('pdf')}
                >
                 Image To PDF
                </Button>
                <Button
                  variant={activeTool === 'image' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTool('image')}
                >
                  PDF To Image  
                </Button>
                <Button
                  variant={activeTool === 'signature' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTool('signature')}
                >
                  E-Signatures
                </Button>
                <Button
                  variant={activeTool === 'merge' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTool('merge')}
                >
                  Merge PDFs
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <Button
              variant="secondary"
              icon={<Menu className="w-5 h-5" />}
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />
    </nav>
  );
};