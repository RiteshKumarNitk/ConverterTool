import os
import io
import fitz  # PyMuPDF
from PIL import Image
from datetime import datetime

# PyHanko imports for digital signing
from pyhanko.sign import signers, fields
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign.fields import SigSeedValueSpec
from pyhanko.sign.signers import PdfSignatureMetadata

# Cryptography for self-signing
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes

def generate_self_signed_cert():
    """Generates a self-signed certificate and private key."""
    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"State"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, u"City"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"ConverterTool"),
        x509.NameAttribute(NameOID.COMMON_NAME, u"ConverterTool Auto-ID"),
    ])
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.utcnow()
    ).not_valid_after(
        # Valid for 1 year
        datetime.utcnow().replace(year=datetime.utcnow().year + 1)
    ).add_extension(
        x509.BasicConstraints(ca=True, path_length=None), critical=True,
    ).sign(key, hashes.SHA256())

    return key, cert

def apply_signature_to_pdf(
    pdf_bytes: bytes,
    signature_bytes: bytes,
    page_number: int,
    x: float,
    y: float,
    width: float,
    height: float,
    p12_bytes: bytes = None,
    p12_password: str = None
) -> bytes:
    """
    Applies both a visual signature image AND a cryptographic digital signature.
    """
    try:
        # 1. Overlay Visual Image using PyMuPDF (Incremental update to preserve validity usually requires care, 
        # but here we modify first, then sign the result)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        if page_number < 1: page_number = 1
        if page_number > len(doc): page_number = len(doc)
        page_idx = page_number - 1
        page = doc[page_idx]
        
        # Process Image
        img_stream = io.BytesIO(signature_bytes)
        img = Image.open(img_stream)
        
        # Determine image placement
        rect = fitz.Rect(x, y, x + width, y + height)
        
        # Insert image
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format=img.format or 'PNG')
        page.insert_image(rect, stream=img_byte_arr.getvalue())
        
        # Save modified PDF with visual signature
        visual_pdf_buffer = io.BytesIO()
        # Aggressive cleaning: garbage=4 (deduplicate), deflate=True (compress)
        # This forces a complete rebuild of the XREF table and streams
        doc.save(visual_pdf_buffer, clean=True, garbage=4, deflate=True)
        doc.close()
        visual_pdf_bytes = visual_pdf_buffer.getvalue()

        # 2. Apply Digital Signature using PyHanko
        # We need a signer.
        if p12_bytes and p12_password:
             signer = signers.P12Signer(
                pfx_pkcs12=io.BytesIO(p12_bytes),
                passphrase=p12_password.encode('utf-8')
            )
        else:
            # Generate temporary self-signed identity
            key, cert = generate_self_signed_cert()
            signer = signers.SimpleSigner(
                signing_cert=cert,
                signing_key=key,
                cert_registry=None
            )

        # Prepare for signing
        w = IncrementalPdfFileWriter(io.BytesIO(visual_pdf_bytes))
        
        # Create a signature field invisible over the visual one results in better compatibility
        # Or we can just do an invisible signature. 
        # For "Green Check", we technically just need the cryptographic element.
        # But adding a Widget lets appropriate viewers click it.
        
        fields.append_signature_field(
            w, SigSeedValueSpec(flags=0), field_name='Signature1',
            # We can put the widget over the image location so clicking the image shows cert details
            # PyHanko coords are bottom-left origin usually, PyMuPDF is top-left default but rects depend.
            # For simplicity, we'll make it invisible or generic placement for now to avoid coord hell.
            # page_index=page_idx, rect=(x, y, x+width, y+height) 
        )

        meta = PdfSignatureMetadata(field_name='Signature1')
        out = io.BytesIO()
        
        signers.sign_pdf(
            w, signers.PdfSignatureMetadata(
                field_name='Signature1',
                reason='Digital Signature by ConverterTool',
                location='Web',
                contact_info='support@convertertool.com'
            ),
            signer=signer,
            output=out,
        )
        
        return out.getvalue()
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to sign PDF: {str(e)}")
