import { useState, useEffect } from 'react';
import { convertToUnicode, convertToDevlys } from '../../../utils/fontConversionLogic';

export const useFontConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<'DEVLYS_TO_UNICODE' | 'UNICODE_TO_DEVLYS'>('DEVLYS_TO_UNICODE');

  // Automatic conversion on inputText or direction change
  useEffect(() => {
    let converted = '';
    if (direction === 'DEVLYS_TO_UNICODE') {
      converted = convertToUnicode(inputText);
    } else {
      converted = convertToDevlys(inputText);
    }
    setOutputText(converted);
  }, [inputText, direction]);

  return { inputText, setInputText, outputText, direction, setDirection };
};
