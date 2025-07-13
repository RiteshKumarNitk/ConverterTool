import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  LayoutGrid,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const navItems = [
    { label: "Merge PDF", link: "/merge" },
    { label: "Split PDF", link: "/split-pdf" },
    { label: "Compress PDF", link: "/compress" },
  ];

  const convertTools = [
    { label: "Image to PDF", link: "/pdf" },
    { label: "PDF to Image", link: "/image" },
  ];

  const allTools = [
    ...navItems,
    ...convertTools,
    { label: "Rename Images", link: "/rename-image" },
    { label: "E-Sign PDF", link: "/signature" },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-2 flex justify-between items-center">
        {/* Left Logo */}
        <Link to="/" className="flex items-center space-x-1 text-black font-bold text-xl">
          <span className="text-red-600 text-2xl">❤</span>
          <span>PDF</span>
        </Link>

        {/* Center Menu */}
        <div className="hidden md:flex space-x-6 text-sm font-medium text-black">
          {navItems.map((item) => (
            <Link key={item.label} to={item.link} className="hover:text-red-500">
              {item.label}
            </Link>
          ))}

          {/* Dropdown: Convert PDF */}
          <div className="relative group">
            <button className="flex items-center hover:text-red-500">
              Convert PDF <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <div className="absolute left-0 mt-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity duration-200 w-48 z-50">
              {convertTools.map((tool) => (
                <Link
                  key={tool.label}
                  to={tool.link}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Dropdown: All Tools */}
         {/* Dropdown: All Tools */}
<div className="relative group">
  <button className="flex items-center hover:text-red-500">
    All PDF Tools <ChevronDown className="w-4 h-4 ml-1" />
  </button>

  <div className="absolute left-0 mt-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity duration-200 w-[320px] z-50">
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Column 1 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Convert from PDF</h4>
        <ul className="space-y-1">
          {[
            { label: "PDF to Image", link: "/image" },
            { label: "Split PDF", link: "/split-pdf" },
            { label: "Rename Images", link: "/rename-image" },
          ].map((tool) => (
            <li key={tool.label}>
              <Link
                to={tool.link}
                className="block text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
              >
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 2 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Convert from PDF</h4>
        <ul className="space-y-1">
          {[
            { label: "Image to PDF", link: "/pdf" },
            { label: "Merge PDF", link: "/merge" },
            { label: "E-Sign PDF", link: "/signature" },
            { label: "Compress PDF", link: "/compress" },
          ].map((tool) => (
            <li key={tool.label}>
              <Link
                to={tool.link}
                className="block text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
              >
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</div>

        </div>

        {/* Right Auth + Grid */}
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm text-gray-700 hover:text-red-500">
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-red-600"
          >
            Sign up
          </Link>
          <button className="p-2 rounded hover:bg-gray-100">
            <LayoutGrid className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </nav>
  );
};
