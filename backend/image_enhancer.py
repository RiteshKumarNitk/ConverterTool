import cv2
import numpy as np
import io
from PIL import Image

def enhance_image(
    image_bytes: bytes,
    enhancement_type: str = "auto",
    upscale_factor: int = 1
) -> bytes:
    """
    Enhances an image based on the selected mode.

    Modes:
    - auto: Applies balanced contrast enhancement and mild sharpening.
    - sharpen: Aggressive sharpening using unsharp masking.
    - deblur: Attempts to restore clarity (uses sharpening + contrast).
    - contrast: CLAHE (Contrast Limited Adaptive Histogram Equalization).
    - super_resolution: (Simulated) High-quality Lanczos upscaling + sharpening.

    Args:
        image_bytes (bytes): Input image data.
        enhancement_type (str): Type of enhancement to apply.
        upscale_factor (int): 1, 2, or 4.

    Returns:
        bytes: Enhanced image encoded as PNG.
    """
    # 1. Decode Image to OpenCV format
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image bytes")

    # 2. Upscaling (if requested)
    if upscale_factor > 1:
        h, w = img.shape[:2]
        new_dim = (w * upscale_factor, h * upscale_factor)
        # Lanczos4 is generally best for high-quality upscaling
        img = cv2.resize(img, new_dim, interpolation=cv2.INTER_LANCZOS4)

    # 3. Apply Enhancements based on type
    if enhancement_type == "contrast" or enhancement_type == "auto":
        img = apply_clahe(img)

    if enhancement_type == "sharpen" or enhancement_type == "auto" or enhancement_type == "deblur":
        # Adjust strength based on mode
        strength = 1.5 if enhancement_type == "sharpen" else 1.0 # default/auto
        strength = 2.0 if enhancement_type == "deblur" else strength
        img = apply_sharpening(img, strength=strength)
        
    if enhancement_type == "denoise":
        img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    # 4. Encode back to bytes
    success, encoded_img = cv2.imencode('.png', img)
    if not success:
        raise ValueError("Failed to encode processed image")
        
    return encoded_img.tobytes()

def apply_clahe(img):
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE).
    This improves local contrast and details without blowing out noise.
    We convert to LAB color space to apply it only to the Luminance (L) channel.
    """
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    
    limg = cv2.merge((cl, a, b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return final

def apply_sharpening(img, strength=1.0):
    """
    Applies Unsharp Masking to sharpen the image.
    Formula: Sharpened = Original + (Original - Blurred) * amount
    """
    gaussian_blur = cv2.GaussianBlur(img, (0, 0), 3.0)
    sharpened = cv2.addWeighted(img, 1.0 + strength, gaussian_blur, -strength, 0)
    return sharpened
