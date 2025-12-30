import forge from 'node-forge';

const testSigning = () => {
    console.log("Starting test...");
    try {
        // 1. Generate Cert
        console.log("Generating keys...");
        const keys = forge.pki.rsa.generateKeyPair(1024); // smaller for speed
        const cert = forge.pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

        const attrs = [{ name: 'commonName', value: 'Test' }];
        cert.setSubject(attrs);
        cert.setIssuer(attrs);

        // SUSPECTED ISSUE: passing OID string instead of md object
        console.log("Signing cert...");
        // cert.sign(keys.privateKey, forge.pki.oids.sha256); // OLD
        cert.sign(keys.privateKey, forge.md.sha256.create()); // NEW

        console.log("Cert signed.");

        // 2. CMS Sign
        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer('Hello World');
        p7.addCertificate(cert);

        p7.addSigner({
            key: keys.privateKey,
            certificate: cert,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [{
                type: forge.pki.oids.contentType,
                value: forge.pki.oids.data,
            }, {
                type: forge.pki.oids.messageDigest,
            }, {
                type: forge.pki.oids.signingTime,
            }]
        });

        console.log("Signing CMS...");
        p7.sign({ detached: true });
        console.log("CMS signed successfully.");

    } catch (e: any) {
        console.error("ERROR CAUGHT:", e.message);
    }
};

testSigning();
