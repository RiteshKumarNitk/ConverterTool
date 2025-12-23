
const { convertToDevlys } = require('./src/utils/fontConversionLogic.ts');

const testString = "प्र";
console.log("Input:", testString);
console.log("Input Codes:", testString.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''));

const result = convertToDevlys(testString);
console.log("Output:", result);
console.log("Output Codes:", result.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''));

const testString2 = "प्रि";
console.log("Input2:", testString2);
const result2 = convertToDevlys(testString2);
console.log("Output2:", result2);

const testString3 = "प" + "\u094D" + "\u0930"; // Explicit Pa+Halant+Ra
console.log("Input3 (Explicit):", testString3);
console.log("Output3:", convertToDevlys(testString3));
