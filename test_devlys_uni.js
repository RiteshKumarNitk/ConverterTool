
const { convertToUnicode } = require('./src/utils/fontConversionLogic.ts');

const cases = [
    "iz",       // Pra
    "fiz",      // Pri
    "izdj.k",   // Prakaran
    "iz'uxr",   // Prashnagat
    "iZ",       // Pra (Upper Z typo?)
    "pZ",       // Cha + Reph?
    "df",       // Ka + f (Invalid order, just to see)
    "fd",       // f + Ka -> Ki
];

cases.forEach(c => {
    console.log(`Input: "${c}"`);
    const res = convertToUnicode(c);
    console.log(`Output: "${res}"`);
    console.log(`Codes: ${res.split('').map(x => '\\u' + x.charCodeAt(0).toString(16).padStart(4, '0')).join('')}`);
    console.log('---');
});
