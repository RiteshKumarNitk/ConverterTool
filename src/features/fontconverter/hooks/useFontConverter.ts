import { useState, useEffect } from 'react';

// Minimal Devlys ↔ Unicode mapping (extend with full mapping for real use)
const devlysToUnicodeMap: Record<string, string> = {
    // Vowels
  'Å': 'अ', 'Á': 'आ', 'Ê': 'इ', 'È': 'ई',
  'É': 'उ', 'Ë': 'ऊ', 'Í': 'ए', 'Î': 'ऐ',
  'Ï': 'ओ', 'Ð': 'औ', 'Ñ': 'ऋ', 'Ò': 'ॠ',
  'Õ': 'ऌ', 'Ö': 'ॡ', '×': 'अं', 'Ø': 'अः',

  // Consonants
  'k': 'क', 'K': 'ख', 'g': 'ग', 'G': 'घ',
  'f': 'ङ', 'c': 'च', 'C': 'छ', 'j': 'ज',
  'J': 'झ', 'F': 'ञ', 't': 'ट', 'T': 'ठ',
  'd': 'ड', 'D': 'ढ', 'N': 'ण', 'n': 'न',
  'p': 'प', 'P': 'फ', 'b': 'ब', 'B': 'भ',
  'm': 'म', 'y': 'य', 'r': 'र', 'R': 'ऱ',
  'l': 'ल', 'L': 'ळ', 'v': 'व', 'S': 'श',
  's': 'स', 'h': 'ह', 'x': 'क्ष', 'X': 'त्र',
  'q': 'ज्ञ',

  // Matras
  'ª': 'ा', 'º': 'ि', '«': 'ी', '¬': 'ु',
  '®': 'े', '¯': 'ै', '°': 'ो', '±': 'ौ',
  '²': 'ं', '³': 'ः',

  // Miscellaneous symbols
  '‘': 'ऽ', '’': '।', '“': '०', '”': '१',
  '†': '२', '‡': '३', '•': '४', '…': '५',
  '‰': '६', '‹': '७', '›': '८', '€': '९',

  // Nukta consonants (use different keys to avoid duplicates)
  'q1': 'क़', 'w1': 'ख़', 'e1': 'ग़', 'r1': 'ज़',
  't1': 'ड़', 'y1': 'ढ़', 'u1': 'फ़', 'i1': 'य़',
};

// Reverse mapping
const unicodeToDevlysMap: Record<string, string> = Object.fromEntries(
  Object.entries(devlysToUnicodeMap).map(([k, v]) => [v, k])
);

export const useFontConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<'DEVLYS_TO_UNICODE' | 'UNICODE_TO_DEVLYS'>('DEVLYS_TO_UNICODE');

  // Automatic conversion on inputText or direction change
  useEffect(() => {
    const map = direction === 'DEVLYS_TO_UNICODE' ? devlysToUnicodeMap : unicodeToDevlysMap;
    let converted = '';
    for (const char of inputText) {
      converted += map[char] ?? char;
    }
    setOutputText(converted);
  }, [inputText, direction]);

  return { inputText, setInputText, outputText, direction, setDirection };
};
