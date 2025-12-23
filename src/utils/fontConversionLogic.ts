
// Logic for converting Devlys 010 (Kruti Dev) <-> Unicode (Mangal/Devanagari)

// Logic for converting Devlys 010 (Kruti Dev) <-> Unicode (Mangal/Devanagari)

export const convertToUnicode = (text: string): string => {
    let s = text;
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Remove invisible chars

    // 1. Common Ligatures (Ordered by length Descending)
    const ligatures: [string, string][] = [
        // 🔴 HIGH PRIORITY: Generic Pra (iz)
        // Replaces 'iz' immediately to 'Pra', allowing subsequent chars to be mapped normally.
        ["iz", "प्र"],
        ["Iz", "प्र"],
        ["iZ", "प्र"],
        ["IZ", "प्र"],

        // Special ambiguity fixes
        ["ifj\"kn", "परिषद"], // " is ambiguous (Full Sha vs Half Sha)
        ["{ks=Qy", "क्षेत्रफल"], // { is ambiguous (Half Ksha vs Full Ksha)

        // Explicit Pri (fz -> Pra + Short I)
        ["fiz", "प्रि"],
        ["fiZ", "प्रि"],
        ["fIz", "प्रि"],
        ["fIZ", "प्रि"],

        // Partial pra forms
        ["izd", "प्रक"],
        ["izHk", "प्रभ"],
        ["izH", "प्रभ"],
        ["izp", "प्रच"],
        ["izt", "प्रज"],
        ["izk", "प्रा"],
        ["izio", "प्रवि"],

        // Vowels
        ["vks", "ओ"],
        ["vkS", "औ"],
        ["vk", "आ"],
        ["ks", "ो"],

        // Other fixes
        ["Ùk", "त्त"],
        ["Dk", "क"], ["Xk", "ग"], ["Pk", "च"], ["Tk", "ज"],
        ["Uk", "न"], ["Ik", "प"], ["Ck", "ब"], ["Yk", "ल"],
        ["Hk", "भ"], ["Fk", "थ"], ["Ek", "म"], ["Ok", "व"],
        ["\"k", "ष"], ["'k", "श"], [".k", "ण"],
        ["bZ", "ई"], ["{k", "क्ष"],
        ["/k", "ध"], ["?k", "घ"],
        ["Ù", "त्त"]
    ];

    for (const [k, v] of ligatures) {
        s = s.split(k).join(v);
    }

    // 3. Short i placeholder
    s = s.replace(/f/g, "ç");

    // 4. Character Mapping (Standard Devlys 010)
    const charMap: Record<string, string> = {
        'v': 'अ', 'b': 'इ', 'B': 'ठ', 'm': 'उ', 'e': 'म', ',': 'ए',
        'k': 'ा', 'h': 'ी', 'q': 'ु', 'w': 'ू', '`': 'ृ',
        's': 'े', 'S': 'ै', 'a': 'ं', 'A': '।',

        'd': 'क', '[': 'ख', 'x': 'ग',
        '?': 'घ्', '/': 'ध्',
        'p': 'च', 'N': 'छ', 't': 'ज', '>': 'झ', '¥': 'ञ',
        'V': 'ट', 'M': 'ड', '<': 'ढ',
        'r': 'त', 'R': 'त्',
        'n': 'द', 'u': 'न', 'i': 'प',
        'Q': 'फ', 'c': 'ब',
        ';': 'य', 'j': 'र', 'y': 'ल', 'o': 'व',
        'l': 'स', 'g': 'ह',

        'K': 'ज्ञ', '}': 'द्व', 'J': 'श्र',

        'D': 'क्', 'X': 'ग्', 'P': 'च्', 'T': 'ज्',
        'U': 'न्', 'I': 'प्', 'C': 'ब्',
        'E': 'म्', 'Y': 'ल्', 'O': 'व्',
        'L': 'स्', 'H': 'भ्', 'F': 'थ्',

        '"': 'ष्', "'": 'श्', '.': 'ण्', '{': 'क्ष्',

        'Z': 'Z',

        // ✅ FIXED LINE (CRITICAL)
        'z': '\u094D\u0930',   // ✔ Halant + Ra (Ra Padra). Fixed from Ra+Halant.

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


export const convertToDevlys = (text: string): string => {
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
    const uniToDevlys: Record<string, string> = {
        'अ': 'v', 'इ': 'b', 'ई': 'B', 'उ': 'm', 'ए': ',', // Corrected from 'e'
        'ओ': 'vks', 'औ': 'vkS', // Special reverse
        'आ': 'vk', // Special reverse

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
    const replacements: [string, string][] = [
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
