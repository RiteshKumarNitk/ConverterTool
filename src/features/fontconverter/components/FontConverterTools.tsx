import React from 'react';
import { useFontConverter } from '../hooks/useFontConverter';
import { ArrowLeftRight, Copy, Trash2, Type } from 'lucide-react';

const FontConverterTools: React.FC = () => {
  const { inputText, setInputText, outputText, direction, setDirection } = useFontConverter();

  const handleCopy = async (text: string) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      // Optional: Add toast notification logic here
    }
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <Type className="w-8 h-8 text-blue-600" />
          Devlys 010 ↔ Mangal (Unicode) Converter
        </h1>
        <p className="text-gray-600">
          Professional Hindi Font Converter for Government & Official Work
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setDirection('DEVLYS_TO_UNICODE')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${direction === 'DEVLYS_TO_UNICODE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Devlys → Mangal
            </button>
            <button
              onClick={() => setDirection('UNICODE_TO_DEVLYS')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${direction === 'UNICODE_TO_DEVLYS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Mangal → Devlys
            </button>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Input/Output Area */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Input Section */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                {direction === 'DEVLYS_TO_UNICODE' ? 'Devlys 010 (Legacy)' : 'Mangal (Unicode)'}
              </label>
              <span className="text-xs text-gray-400">
                {inputText.length} chars
              </span>
            </div>
            <textarea
              className={`w-full h-96 p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${direction === 'DEVLYS_TO_UNICODE' ? 'font-serif' : 'font-sans' // Try to use appropriate fonts if available
                }`}
              style={{ fontFamily: direction === 'DEVLYS_TO_UNICODE' ? '"Kruti Dev 010", "Devlys 010", serif' : 'inherit' }}
              placeholder={direction === 'DEVLYS_TO_UNICODE' ? "Paste Kruti Dev code here..." : "यहाँ टाइप करें..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleCopy(inputText)}
                className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                title="Copy Input"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Swap Icon (Visual Only) */}
          <div className="hidden md:flex items-center justify-center bg-gray-50 w-12 border-l border-r border-gray-200">
            <ArrowLeftRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Output Section */}
          <div className="flex-1 p-6 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                {direction === 'DEVLYS_TO_UNICODE' ? 'Mangal (Unicode)' : 'Devlys 010 (Legacy)'}
              </label>
              <button
                onClick={() => handleCopy(outputText)}
                className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Output
              </button>
            </div>
            <textarea
              className="w-full h-96 p-4 border border-gray-200 rounded-xl resize-none bg-white focus:outline-none"
              style={{ fontFamily: direction === 'DEVLYS_TO_UNICODE' ? 'inherit' : '"Kruti Dev 010", "Devlys 010", serif' }}
              value={outputText}
              readOnly
              placeholder="Output will appear here..."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Note: For Devlys text to display correctly, ensure the font is installed on your system.</p>
      </div>
    </div>
  );
};

export default FontConverterTools;
