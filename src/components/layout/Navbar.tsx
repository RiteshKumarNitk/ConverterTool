import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Settings,
  Zap
} from "lucide-react";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Merge PDF", link: "/merge" },
    { label: "Split PDF", link: "/split-pdf" },
    { label: "Compress PDF", link: "/compress" },
  ];

  const convertTools = [
    { label: "Image to PDF", link: "/pdf", icon: <ImageIcon className="w-4 h-4 mr-2 text-blue-500" /> },
    { label: "PDF to Image", link: "/image", icon: <FileText className="w-4 h-4 mr-2 text-green-500" /> },
    { label: "Any to Image", link: "/any-to-image", icon: <Zap className="w-4 h-4 mr-2 text-purple-500" /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50"
        : "bg-white border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              C
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              ConverterTool
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.link}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${location.pathname === item.link
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Dropdown: Convert */}
            <div className="relative group px-2">
              <button className="flex items-center text-sm font-medium text-gray-600 group-hover:text-blue-600 py-2">
                Convert <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 overflow-hidden">
                <div className="p-2">
                  {convertTools.map((tool) => (
                    <Link
                      key={tool.label}
                      to={tool.link}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      {tool.icon}
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Dropdown: All Tools */}
            <div className="relative group px-2">
              <button className="flex items-center text-sm font-medium text-gray-600 group-hover:text-blue-600 py-2">
                All Tools <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                <div className="p-4 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      PDF Tools
                    </div>
                    {[
                      { label: "Merge", link: "/merge" },
                      { label: "Split", link: "/split-pdf" },
                      { label: "Compress", link: "/compress" },
                      { label: "Editor", link: "/PDFEdit" },
                    ].map((tool) => (
                      <Link
                        key={tool.label}
                        to={tool.link}
                        className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Image Tools
                    </div>
                    {[
                      { label: "To PDF", link: "/pdf" },
                      { label: "From PDF", link: "/image" },
                      { label: "Resize", link: "/image" },
                      { label: "Rename", link: "/rename-image" },
                    ].map((tool) => (
                      <Link
                        key={tool.label}
                        to={tool.link}
                        className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-b-xl border-t border-gray-100">
                  <Link to="/" className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All Tools
                    <Settings className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="items-center px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 hidden md:flex"
            >
              Sign up
            </Link>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.link}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2 pt-2">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
