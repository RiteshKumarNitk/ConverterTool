import React from "react";
import {
  FileText,
  Menu,
  ChevronDown,
  FileImage,
  Image,
  Layers3,
  Type,
} from "lucide-react";
import { Button } from "../ui/Button";
import { ToolType } from "../../types";
import { MobileMenu } from "./MobileMenu";

interface NavbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTool,
  setActiveTool,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const tools = [
    {
      key: "pdf",
      label: "Image to PDF",
      icon: <FileImage className="w-5 h-5 text-blue-600" />,
      description: "Convert images into a single PDF document.",
    },
    {
      key: "image",
      label: "PDF to Image",
      icon: <Image className="w-5 h-5 text-green-600" />,
      description: "Extract images from PDF pages.",
    },
    {
      key: "merge",
      label: "Merge PDFs",
      icon: <Layers3 className="w-5 h-5 text-yellow-600" />,
      description: "Combine multiple PDFs into one.",
    },
    {
      key: "rename-image",
      label: "Rename Images",
      icon: <Type className="w-5 h-5 text-indigo-600" />,
      description: "Batch rename images with custom rules.",
    },
    {
      key: "signature",
      label: "E-Signatures",
      icon: <Type className="w-5 h-5 text-red-600" />,
      description: "Digitally sign PDF documents.",
    },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-red-400" />
            <Button
              variant={activeTool === "home" ? "primary" : "secondary"}
              onClick={() => setActiveTool("home")}
            >
              FileTools Pro
            </Button>
          </div>

          {/* Desktop Dropdown */}
          <div className="hidden md:block relative group">
            {/* Trigger (Tools button) */}
            <div className="flex items-center space-x-2 cursor-pointer justify-start">
              <span className="text-gray-700 font-medium">Tools</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {/* Dropdown (centered under Tools) */}
            <div
              className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 
               absolute right-1/4 top-full mt-3 bg-white shadow-xl border border-gray-200 
               rounded-xl w-[500px] p-4 z-50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.key}
                    onClick={() => {
                      setActiveTool(tool.key as ToolType);
                    }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  >
                    {tool.icon}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {tool.label}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="secondary"
              icon={<Menu className="w-5 h-5" />}
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />
    </nav>
  );
};
