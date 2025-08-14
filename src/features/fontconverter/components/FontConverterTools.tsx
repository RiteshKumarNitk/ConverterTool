import React from 'react';
import { useFontConverter } from '../hooks/useFontConverter';

const FontConverterTools: React.FC = () => {
  const { inputText, setInputText, outputText, direction, setDirection } = useFontConverter();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Devlys ↔ Mangal Hindi Converter</h1>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="DEVLYS_TO_UNICODE"
            checked={direction === 'DEVLYS_TO_UNICODE'}
            onChange={() => setDirection('DEVLYS_TO_UNICODE')}
          />
          Devlys → Mangal
        </label>

        <label className="ml-4">
          <input
            type="radio"
            value="UNICODE_TO_DEVLYS"
            checked={direction === 'UNICODE_TO_DEVLYS'}
            onChange={() => setDirection('UNICODE_TO_DEVLYS')}
          />
          Mangal → Devlys
        </label>
      </div>

      <div className="flex gap-4">
        <textarea
          className="w-1/2 h-40 p-2 border rounded"
          placeholder="Paste text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <textarea
          className="w-1/2 h-40 p-2 border rounded bg-gray-100"
          value={outputText}
          readOnly
        />
      </div>
    </div>
  );
};

export default FontConverterTools;
