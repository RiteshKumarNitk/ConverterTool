
const convertToDevlys = (text) => {
    let s = text;

    // 1. Move Reph (र्) : र् + [Cluster] -> [Cluster] + Z
    const cons = "[\\u0915-\\u0939\\u0958-\\u095F]";
    const halant = "\\u094D";
    const nukta = "\\u093C";
    const matras = "[\\u093E-\\u094C\\u0962\\u0963\\u0902\\u0903\\u0951\\u0952\\u093F]?";

    const rephRegex = new RegExp(`\\u0930\\u094D((?:${cons}${nukta}?${halant})*${cons}${nukta}?${matras})`, 'g');
    s = s.replace(rephRegex, "$1Z");

    // 2. Move Short I (ि) : [Cluster] + ि -> f + [Cluster]
    const shortIRegex = new RegExp(`((?:${cons}${nukta}?${halant})*${cons}${nukta}?)\\u093F`, 'g');
    s = s.replace(shortIRegex, "f$1");

    // 3. Mapping (Unicode -> Devlys)
    const uniToDevlys = {
        'अ': 'v', 'इ': 'b', 'ई': 'B', 'उ': 'm', 'ए': ',',
        'ओ': 'vks', 'औ': 'vkS',
        'आ': 'vk',

        'क': 'd', 'ख': '[', 'ग': 'x', 'घ': '?', 'ङ': '?',
        'च': 'p', 'छ': 'N', 'ज': 't', 'झ': '>', 'ञ': '¥',
        'ट': 'V', 'ठ': 'B', 'ड': 'M', 'ढ': '<', 'ण': '.',
        'त': 'r', 'थ': 'F', 'द': 'n', 'ध': '/', 'न': 'u',
        'प': 'i', 'फ': 'Q', 'ब': 'c', 'भ': 'H', 'म': 'e',
        'य': ';', 'र': 'j', 'ल': 'y', 'व': 'o',
        'श': "'", 'ष': '"', 'स': 'l', 'ह': 'g',
        'क्ष': '{', 'त्र': 'R', 'ज्ञ': 'K', 'श्र': 'J',

        'ा': 'k', 'ी': 'h', 'ु': 'q', 'ू': 'w', 'ृ': '`', 'े': 's', 'ै': 'S',
        'ं': 'a', '।': 'A', '्': '~', '़': '+', '.': '=',
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',

        // Reverse Half Letters map to explicit chars if possible
        'क्': 'D', 'ख्': '[', 'ग्': 'X', 'घ्': '?',
        'च्': 'P', 'ज्': 'T', 'न्': 'U', 'प्': 'I', 'फ्': 'Q', 'ब्': 'C', 'भ्': 'H', 'म्': 'E', 'ल्': 'Y', 'स्': 'L', 'व्': 'O',

        // Special
        'ँ': 'W', 'ळ': 'G',
    };

    // Explicit long replacements
    const replacements = [
        ["क़", "d+"], ["ख़", "[+"], ["ग़", "x+"], ["ज़", "t+"], ["ड़", "M+"], ["ढ़", "<+"], ["फ़", "Q+"],
        ["द्व", "}"], ["क्", "d~"],

        // Compound Replacements for Unicode -> Devlys
        ["\u0924\u094D\u0930", "R"], // Tra
        ["\u0915\u094D\u0937", "{"], // Ksha
        ["\u091c\u094d\u091e", "K"], // Gya
        ["\u0936\u094d\u0930", "J"], // Shra

        // Explicit Rakar (Padra) forms to guarantee correctness
        ["\u092A\u094D\u0930", "iz"], // Pra
        ["\u0915\u094D\u0930", "dz"], // Kra
        ["\u0917\u094D\u0930", "xz"], // Gra
        ["\u0926\u094D\u0930", "nz"], // Dra
        ["\u092B\u094D\u0930", "Qz"], // Phra
        ["\u092C\u094D\u0930", "cz"], // Bra
        ["\u092D\u094D\u0930", "Hz"], // Bhra
        ["\u092E\u094D\u0930", "ez"], // Mra

        // Generic Pra (MUST COME AFTER SPECIFIC WORDS)
        ["iz", "प्र"],

        // Standard Ra-Padra (Halant + Ra) -> z
        ["\u094D\u0930", "z"],

        // Short I Fix for robustness if not caught by regex (unlikely but safe)
        ["\u093F", "f"],
    ];

    for (const [k, v] of replacements) {
        s = s.split(k).join(v);
    }

    let mapped = "";
    for (const char of s) {
        if (uniToDevlys[char]) {
            mapped += uniToDevlys[char];
        } else {
            mapped += char;
        }
    }

    return mapped;
}

const testString = "प्र";
console.log("Input:", testString);
console.log("Input Codes:", testString.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''));

const result = convertToDevlys(testString);
console.log("Output:", result);

const testString2 = "प्रि";
console.log("Input2:", testString2);
const result2 = convertToDevlys(testString2);
console.log("Output2:", result2);
