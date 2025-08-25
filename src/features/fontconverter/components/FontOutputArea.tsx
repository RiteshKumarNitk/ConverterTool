import React from 'react';

interface FontOutputAreaProps {
  outputText: string;
}

const FontOutputArea: React.FC<FontOutputAreaProps> = ({ outputText }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="mt-4">
      <textarea
        className="w-full h-40 p-2 border rounded bg-gray-100"
        value={outputText}
        readOnly
      />
      <button
        onClick={handleCopy}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Copy
      </button>
    </div>
  );
};

export default FontOutputArea;
