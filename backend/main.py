import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from processor import process_document
from signature_service import apply_signature_to_pdf
from image_enhancer import enhance_image
from tts_service import generate_speech
from notification_service import notification_service, JOBS_STORE

app = FastAPI(title="Document Intelligence API")

# Allow CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Document Intelligence API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Create unique filename
        file_ext = Path(file.filename).suffix
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}{file_ext}"
        file_path = UPLOAD_DIR / safe_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "file_id": file_id,
            "filename": file.filename,
            "saved_name": safe_filename,
            "status": "uploaded"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process/{file_id}")
async def process_file(file_id: str, background_tasks: BackgroundTasks):
    # Find the file
    found_files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
    if not found_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = found_files[0]
    
    try:
        # Run processing
        result = process_document(str(file_path), str(OUTPUT_DIR), file_id)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.get("/download/{file_id}/{format}")
async def download_output(file_id: str, format: str):
    # format: json, xlsx, docx
    allowed_formats = ["json", "xlsx", "docx"]
    if format not in allowed_formats:
        raise HTTPException(status_code=400, detail="Invalid format")
    
    filename = f"{file_id}_result.{format}"
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
         raise HTTPException(status_code=404, detail="Output file not found. Process might have failed or is in progress.")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

@app.post("/signature")
async def sign_pdf(
    pdf_file: UploadFile = File(...),
    signature_image: UploadFile = File(...),
    p12_file: Optional[UploadFile] = File(None),
    password: Optional[str] = Form(None),
    page_number: int = 1,
    x: float = 100.0,
    y: float = 100.0,
    width: float = 200.0,
    height: float = 100.0
):
    try:
        # Read files into memory
        pdf_bytes = await pdf_file.read()
        sig_bytes = await signature_image.read()
        
        p12_bytes = None
        if p12_file:
            p12_bytes = await p12_file.read()

        # Apply signature
        signed_pdf_bytes = apply_signature_to_pdf(
            pdf_bytes=pdf_bytes,
            signature_bytes=sig_bytes,
            page_number=page_number,
            x=x,
            y=y,
            width=width,
            height=height,
            p12_bytes=p12_bytes,
            p12_password=password
        )
        
        # Create a temporary file to serve the response
        # Using a proper temp file or in-memory response is cleaner, but to match existing pattern:
        output_filename = f"signed_{uuid.uuid4()}.pdf"
        output_path = OUTPUT_DIR / output_filename
        
        with open(output_path, "wb") as f:
            f.write(signed_pdf_bytes)
            
        return FileResponse(
            path=output_path,
            filename=f"signed_{pdf_file.filename}",
            media_type='application/pdf'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image-enhancer")
async def enhance_image_endpoint(
    image_file: UploadFile = File(...),
    enhancement_type: str = Form("auto"),
    upscale_factor: int = Form(1)
):
    try:
        # Validate input
        if upscale_factor not in [1, 2, 4]:
            raise HTTPException(status_code=400, detail="Upscale factor must be 1, 2, or 4")
            
        # Read file
        img_bytes = await image_file.read()
        
        # Process
        enhanced_bytes = enhance_image(
            image_bytes=img_bytes,
            enhancement_type=enhancement_type,
            upscale_factor=upscale_factor
        )
        
        # Save to temp file
        output_filename = f"enhanced_{uuid.uuid4()}.png"
        output_path = OUTPUT_DIR / output_filename
        
        with open(output_path, "wb") as f:
            f.write(enhanced_bytes)
            
        return FileResponse(
            path=output_path,
            filename=f"enhanced_{image_file.filename}.png",
            media_type='image/png'
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    voice: Optional[str] = None
    speed: float = 1.0
    pitch: float = 1.0

@app.post("/text-to-speech")
async def text_to_speech_endpoint(
    request: TTSRequest,
    background_tasks: BackgroundTasks
):
    try:
        # Generate Audio
        output_file = await generate_speech(
            text=request.text,
            language=request.language,
            voice=request.voice,
            speed=request.speed,
            pitch=request.pitch
        )
        
        # Ensure path is absolute for FileResponse if needed, or relative is fine
        file_path = Path(output_file)
        
        # Schedule cleanup
        background_tasks.add_task(os.remove, file_path)
        
        return FileResponse(
            path=file_path,
            filename="speech.mp3",
            media_type="audio/mpeg"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- Bulk Notification Endpoints ---

@app.post("/bulk/upload")
async def bulk_upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(400, "Invalid format. Use CSV or Excel.")
    
    content = await file.read()
    try:
        data = await notification_service.parse_csv(content)
        # Return a preview (first 5) and total count
        return {
            "total": len(data),
            "preview": data[:5],
            "file_id": str(uuid.uuid4()), # Placeholder
            "recipients": data 
        }
    except ValueError as Ve:
        raise HTTPException(400, str(Ve))

class BulkSendRequest(BaseModel):
    recipients: List[dict]
    channel: str # "email", "whatsapp", "both"
    template: str
    subject: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

@app.post("/bulk/send")
async def bulk_send_notifications(req: BulkSendRequest):
    credentials = {
        'smtp_host': req.smtp_host,
        'smtp_port': req.smtp_port,
        'smtp_user': req.smtp_user,
        'smtp_pass': req.smtp_pass
    }
    
    job_id = await notification_service.start_job(
        recipients=req.recipients,
        channel=req.channel,
        template=req.template,
        subject=req.subject,
        credentials=credentials
    )
    return {"job_id": job_id, "status": "processing"}

@app.get("/bulk/status/{job_id}")
async def get_bulk_status(job_id: str):
    job = JOBS_STORE.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job
