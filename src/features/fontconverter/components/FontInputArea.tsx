import React from 'react';

interface FontInputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
}

const FontInputArea: React.FC<FontInputAreaProps> = ({ inputText, setInputText }) => {
  return (
    <textarea
      className="w-full h-40 p-2 border rounded"
      placeholder="Enter text here..."
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
    />
  );
};

export default FontInputArea;
