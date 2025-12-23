
const convertToUnicode = (text) => {
    let s = text;
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // 1. Common Ligatures
    const ligatures = [
        ["iz'uxr", "प्रश्नगत"],
        ["izdj.k", "प्रकरण"],
        ["izHkkoh", "प्रभावी"],
        ["izHkoh", "प्रभावी"],
        ["izhfe;j", "प्रीमियर"],
        ["fopkjk/khu", "विचाराधीन"],
        ["ifj\"kn", "परिषद"],
        ["{ks=Qy", "क्षेत्रफल"],

        ["izd", "प्रक"],
        ["izHk", "प्रभ"],
        ["izH", "प्रभ"],
        ["izp", "प्रच"],
        ["izt", "प्रज"],
        ["izk", "प्रा"],
        ["izio", "प्रवि"],

        ["iz", "प्र"],     // Generic Pra
        ["Iz", "प्र"],
        ["iZ", "प्र"],

        ["vks", "ओ"], ["vkS", "औ"], ["vk", "आ"], ["ks", "ो"],
        ["Ùk", "त्त"], ["Dk", "क"], ["Xk", "ग"], ["Pk", "च"], ["Tk", "ज"],
        ["Uk", "न"], ["Ik", "प"], ["Ck", "ब"], ["Yk", "ल"], ["Hk", "भ"],
        ["Fk", "थ"], ["Ek", "म"], ["Ok", "व"],
        ["\"k", "ष"], ["'k", "श"], [".k", "ण"],
        ["bZ", "ई"], ["{k", "क्ष"],
        ["/k", "ध"], ["?k", "घ"], ["Ù", "त्त"]
    ];

    for (const [k, v] of ligatures) {
        s = s.split(k).join(v);
    }

    // 3. Short i placeholder
    s = s.replace(/f/g, "ç");

    // Explicit fix for Pri
    s = s.replace(/ç\u092A\u094D\u0930/g, "\u092A\u094D\u0930\u093F");

    // 4. Character Mapping
    const charMap = {
        'v': 'अ', 'b': 'इ', 'B': 'ठ', 'm': 'उ', 'e': 'म', ',': 'ए',
        'k': 'ा', 'h': 'ी', 'q': 'ु', 'w': 'ू', '`': 'ृ',
        's': 'े', 'S': 'ै', 'a': 'ं', 'A': '।',
        'd': 'क', '[': 'ख', 'x': 'ग', '?': 'घ्', '/': 'ध्',
        'p': 'च', 'N': 'छ', 't': 'ज', '>': 'झ', '¥': 'ञ',
        'V': 'ट', 'M': 'ड', '<': 'ढ', 'r': 'त', 'R': 'त्',
        'n': 'द', 'u': 'न', 'i': 'प', 'Q': 'फ', 'c': 'ब',
        ';': 'य', 'j': 'र', 'y': 'ल', 'o': 'व', 'l': 'स', 'g': 'ह',
        'K': 'ज्ञ', '}': 'द्व', 'J': 'श्र',
        'D': 'क्', 'X': 'ग्', 'P': 'च्', 'T': 'ज्', 'U': 'न्', 'I': 'प्', 'C': 'ब्',
        'E': 'म्', 'Y': 'ल्', 'O': 'व्', 'L': 'स्', 'H': 'भ्', 'F': 'थ्',
        '"': 'ष्', "'": 'श्', '.': 'ण्', '{': 'क्ष्',
        'Z': 'Z',
        'z': '\u094D\u0930', // Halant + Ra
        '~': '्', '+': '़', '=': 'त्र',
        'W': 'ँ', 'G': 'ळ',
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
    };

    let mapped = "";
    for (const char of s) {
        mapped += charMap[char] ?? (char === "ç" ? "ç" : char);
    }
    s = mapped;

    // 5. Fix short-i position
    const cons = "[\\u0915-\\u0939\\u0958-\\u095F]";
    const halant = "\\u094D";
    const nukta = "\\u093C";

    const clusterRegex = new RegExp(`ç((?:${cons}${nukta}?${halant})*${cons}${nukta}?)`, 'g');
    s = s.replace(clusterRegex, "$1\u093F");
    s = s.replace(/ç/g, "ि");

    // 6. Reph handling
    const matras = "[\\u093E-\\u094C\\u0902\\u0903\\u093F]*";
    const rephRegex = new RegExp(`((?:${cons}${nukta}?${halant})*${cons}${nukta}?${matras})Z`, 'g');

    s = s.replace(rephRegex, "\u0930\u094D$1");
    s = s.split('Z').join('र्');

    return s;
};

const cases = [
    "iz", "fiz", "izdj.k", "iz'uxr", "fd"
];

cases.forEach(c => {
    console.log(`Input: "${c}"`);
    const res = convertToUnicode(c);
    console.log(`Output: "${res}"`);
    console.log(`Codes: ${res.split('').map(x => '\\u' + x.charCodeAt(0).toString(16).padStart(4, '0')).join('')}`);
    console.log('---');
});
