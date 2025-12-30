import forge from 'node-forge';
import { PDFDocument, PDFName, PDFString, PDFHexString, PDFArray } from 'pdf-lib';

/**
 * Generates a self-signed certificate and private key.
 */
export const generateSelfSignedCert = () => {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    const attrs = [{
        name: 'commonName',
        value: 'ConverterTool Auto-ID'
    }, {
        name: 'countryName',
        value: 'US'
    }, {
        shortName: 'ST',
        value: 'Virginia'
    }, {
        name: 'localityName',
        value: 'Blacksburg'
    }, {
        name: 'organizationName',
        value: 'Converter Tools'
    }, {
        shortName: 'OU',
        value: 'Digital Signatures'
    }];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    return {
        privateKey: keys.privateKey,
        certChain: [cert]
    };
};

/**
 * Parses a PKCS#12 (P12/PFX) file and extracts the private key and certificate chain.
 */
export const parseP12 = (p12Buffer: ArrayBuffer, password: string) => {
    try {
        // Convert ArrayBuffer to binary string for forge
        const p12Bytes = new Uint8Array(p12Buffer);
        let p12Binary = "";
        for (let i = 0; i < p12Bytes.length; i++) {
            p12Binary += String.fromCharCode(p12Bytes[i]);
        }

        const p12Der = forge.util.createBuffer(p12Binary, 'raw');
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

        // Get Private Key
        let keyData: any = null;
        let certChain: forge.pki.Certificate[] = [];

        // Search for bags with key and certs
        const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const shadedKeyBags = bags[forge.pki.oids.pkcs8ShroudedKeyBag];

        if (shadedKeyBags && shadedKeyBags.length > 0) {
            keyData = shadedKeyBags[0];
        }

        // If not found, try generic key bag
        if (!keyData) {
            const keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
            const kb = keyBags[forge.pki.oids.keyBag];
            if (kb && kb.length > 0) {
                keyData = kb[0];
            }
        }

        if (!keyData) {
            throw new Error("No private key found in P12 file.");
        }

        const privateKey = keyData.key;
        const certBagsMap = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBags = certBagsMap[forge.pki.oids.certBag];
        const localCertId = keyData.attributes?.localKeyId;

        if (certBags && certBags.length > 0) {
            if (localCertId) {
                // Find matching cert
                const matchingCert = certBags.find((bag: any) => {
                    return bag.attributes?.localKeyId &&
                        bag.attributes.localKeyId[0] === localCertId[0];
                });
                if (matchingCert) {
                    certChain.push(matchingCert.cert as forge.pki.Certificate);
                }
            }

            // Add others to chain
            certBags.forEach((bag: any) => {
                const cert = bag.cert as forge.pki.Certificate;
                // Simple exclusion of dupes
                const exists = certChain.find(c => c.serialNumber === cert.serialNumber && c.issuer.hash === cert.issuer.hash);
                if (!exists) {
                    certChain.push(cert);
                }
            });
        }

        if (certChain.length === 0) {
            throw new Error("No certificates found in P12 file.");
        }

        return { privateKey, certChain };
    } catch (error) {
        console.error("P12 Parse Error:", error);
        throw new Error("Failed to parse Certificate. Verify the password and file format.");
    }
};

/**
 * Creates a PKCS#7 (CMS) detached signature for the given data.
 */
export const createSignature = (dataToSign: Uint8Array, privateKey: forge.pki.PrivateKey, certChain: forge.pki.Certificate[]) => {
    const p7 = forge.pkcs7.createSignedData();
    // forge.util.createBuffer accepts binary string or buffer. 
    let binaryString = '';
    for (let i = 0; i < dataToSign.length; i++) {
        binaryString += String.fromCharCode(dataToSign[i]);
    }
    p7.content = forge.util.createBuffer(binaryString, 'raw');

    // Add all certs to p7
    certChain.forEach(cert => p7.addCertificate(cert));

    p7.addSigner({
        key: privateKey,
        certificate: certChain[0], // The leaf cert
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
            {
                type: forge.pki.oids.contentType,
                value: forge.pki.oids.data,
            },
            {
                type: forge.pki.oids.messageDigest,
                // value will be auto-populated
            },
            {
                type: forge.pki.oids.signingTime,
                // value will be auto-populated
            },
        ],
    });

    p7.sign({ detached: true });

    const raw = forge.asn1.toDer(p7.toAsn1()).getBytes();
    return raw; // binary string
};

const DEFAULT_SIGNATURE_LENGTH = 8192; // 8KB placeholder

/**
 * Core signing function taking parsed keys.
 */
export const signPdfWithKeys = async (pdfBuffer: ArrayBuffer, privateKey: forge.pki.PrivateKey, certChain: forge.pki.Certificate[]): Promise<Uint8Array> => {
    // 2. Prepare PDF with placeholder
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Create AcroForm if not exists
    let acroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'));
    if (!acroForm) {
        acroForm = pdfDoc.context.obj({
            Fields: [],
            SigFlags: 3, // SignaturesExist | AppendOnly
        });
        pdfDoc.catalog.set(PDFName.of('AcroForm'), acroForm);
    }

    const signatureFieldRef = pdfDoc.context.register(
        pdfDoc.context.obj({
            Type: 'Annot',
            Subtype: 'Widget',
            FT: 'Sig',
            Rect: [0, 0, 0, 0], // Invisible signature for now (or visual placeholder)
            V: null, // Value will be set later
            T: PDFString.of('Signature1'), // Name of the signature field
            F: 4, // Printable
            P: pdfDoc.getPages()[0].ref, // Link to first page
        })
    );


    // Let's use simpler approach: Pre-allocating the signature dict
    const signatureDictRef = pdfDoc.context.register(
        pdfDoc.context.obj({
            Type: 'Sig',
            Filter: 'Adobe.PPKLite',
            SubFilter: 'adbe.pkcs7.detached',
            ByteRange: [0, 9999999999, 9999999999, 9999999999], // Placeholder with sufficient space
            Contents: PDFHexString.of('0'.repeat(DEFAULT_SIGNATURE_LENGTH)), // Placeholder
            Reason: PDFString.of('Digitally Signed by ConverterTool'),
            M: PDFString.fromDate(new Date()),
        })
    );

    // Update the Widget to point to this dictionary
    const widget = pdfDoc.context.lookup(signatureFieldRef) as any; // Map
    widget.set(PDFName.of('V'), signatureDictRef);

    // Add annotation to first page
    const page = pdfDoc.getPages()[0];
    page.node.addAnnot(signatureFieldRef);

    // Add field to AcroForm.Fields
    const acroFormDict = acroForm as any;
    let acroFormFields = acroFormDict.get(PDFName.of('Fields'));

    // If it's a reference, look it up
    if (acroFormFields && typeof acroFormFields.lookup === 'function') {
        // It might be a reference to an array, so lookup gives the array
        const lookedUp = pdfDoc.context.lookup(acroFormFields);
        if (lookedUp) acroFormFields = lookedUp;
    }

    if (acroFormFields instanceof PDFArray) {
        acroFormFields.push(signatureFieldRef);
    } else {
        // Create fields array if needed
        acroFormDict.set(PDFName.of('Fields'), pdfDoc.context.obj([signatureFieldRef]));
    }


    const savedPdfBytes = await pdfDoc.save({ useObjectStreams: false });

    // 4. Find Placeholder by converting to binary string
    const pdfBytes = new Uint8Array(savedPdfBytes);
    let pdfString = "";
    // Optimization: we don't need to convert the whole file if it is huge, but for search we might.
    // For safety, let's chunk it or just do it. JS strings can handle ~500MB.
    const len = pdfBytes.length;
    for (let i = 0; i < len; i++) {
        pdfString += String.fromCharCode(pdfBytes[i]);
    }

    const placeholderPattern = /\/Contents\s*<([0-9A-Fa-f]+)>/;
    const match = pdfString.match(placeholderPattern);

    if (!match) {
        throw new Error("Could not find signature content placeholder in saved PDF");
    }

    const contentsTagPos = match.index! + match[0].indexOf('<'); // Start of <
    const contentsEndPos = match.index! + match[0].indexOf('>'); // End of >
    const placeholderLength = contentsEndPos - contentsTagPos - 1; // Length of HEX string

    if (placeholderLength < DEFAULT_SIGNATURE_LENGTH) {
        // This might happen if pdf-lib optimized it away
    }

    // Match the larger placeholder pattern - allow flexible spacing and numbers
    const byteRangePlaceholderPattern = /\/ByteRange\s*\[\s*0\s+\d+\s+\d+\s+\d+\s*\]/;
    const byteRangeMatch = pdfString.match(byteRangePlaceholderPattern);
    if (!byteRangeMatch) {
        throw new Error("Could not find ByteRange placeholder.");
    }

    const byteRangePlaceholder = byteRangeMatch[0];
    const byteRangePos = byteRangeMatch.index!;

    const contentsStart = contentsTagPos + 1; // Inside <
    const contentsEnd = contentsEndPos; // At >

    const range1Start = 0;
    const range1Length = contentsTagPos; // Stops right at <
    const range2Start = contentsEndPos;  // Starts right after >
    const range2Length = pdfBytes.length - range2Start;

    const byteRangeStr = `/ByteRange [${range1Start} ${range1Length} ${range2Start} ${range2Length}]`;
    const paddedByteRange = byteRangeStr.padEnd(byteRangePlaceholder.length, ' ');

    if (paddedByteRange.length > byteRangePlaceholder.length) {
        throw new Error(`ByteRange placeholder too small. Found: '${byteRangePlaceholder}' (${byteRangePlaceholder.length}), Needed: '${paddedByteRange}' (${paddedByteRange.length}).`);
    }

    // Update ByteRange in buffer
    for (let i = 0; i < paddedByteRange.length; i++) {
        pdfBytes[byteRangePos + i] = paddedByteRange.charCodeAt(i);
    }

    // 6. Hash
    // Create new buffer for signing
    const bufferToSignLength = range1Length + range2Length;
    const bufferToSign = new Uint8Array(bufferToSignLength);
    bufferToSign.set(pdfBytes.subarray(range1Start, range1Start + range1Length), 0);
    bufferToSign.set(pdfBytes.subarray(range2Start, range2Start + range2Length), range1Length);

    // 7. Sign
    const signature = createSignature(bufferToSign, privateKey, certChain);

    // 8. Hex encode and inject
    const signatureHex = forge.util.binary.hex.encode(signature);

    // Check length
    if (signatureHex.length > (contentsEnd - contentsStart)) {
        throw new Error(`Signature produced is too large (${signatureHex.length}) for placeholder (${contentsEnd - contentsStart}).`);
    }

    // Pad with 0s
    const paddedSignature = signatureHex.padEnd(contentsEnd - contentsStart, '0');

    // Write signature hex to buffer
    for (let i = 0; i < paddedSignature.length; i++) {
        pdfBytes[contentsStart + i] = paddedSignature.charCodeAt(i);
    }

    return pdfBytes;
};

/**
 * Signs a PDF document using the provided P12 certificate and password.
 */
export const signPdfDocument = async (pdfBuffer: ArrayBuffer, p12Buffer: ArrayBuffer, password: string): Promise<Uint8Array> => {
    // 1. Parse P12
    const { privateKey, certChain } = parseP12(p12Buffer, password);
    return signPdfWithKeys(pdfBuffer, privateKey, certChain);
};

/**
 * Signs a PDF document using a generated self-signed certificate.
 */
export const signPdfWithGeneratedCert = async (pdfBuffer: ArrayBuffer): Promise<Uint8Array> => {
    const { privateKey, certChain } = generateSelfSignedCert();
    return signPdfWithKeys(pdfBuffer, privateKey, certChain);
};
