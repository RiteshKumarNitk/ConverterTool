# Document Intelligence System - Setup Guide

You have successfully created the **Document Intelligence System** as a standalone module within your project. 
To use it, you need to run the Python backend and manually integrate the frontend component when you are ready.

## 1. Backend Setup (Python)

The backend handles OCR, text extraction, and file conversion.

### Prerequisites
- **Python 3.8+** installed.
- **Tesseract OCR** installed on your system.
    - Windows: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki)
    - Add `Tesseract-OCR` to your System PATH, or update `backend/processor.py` line 20 with the path.
- **Poppler** (Optional but recommended for strict PDF-to-Image OCR).
    - Windows: [Download Binary](https://github.com/oschwartz10612/poppler-windows/releases/) and add `bin` to PATH.

### Installation
Open a terminal in the `backend/` directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Server
```powershell
uvicorn main:app --reload
```
The API will be available at: `http://localhost:8000`
Docs: `http://localhost:8000/docs`

---

## 2. Frontend Integration (React)

The frontend components are located in `src/components/tools/DocumentIntelligence`.
They are **NOT** yet connected to your main `App.tsx` router to avoid breaking your existing app.

### How to Enable It
When you are ready to test the UI:

1.  Open `src/App.tsx`.
2.  Import the component:
    ```typescript
    import DocumentIntelligence from './components/tools/DocumentIntelligence/DocumentIntelligence';
    ```
3.  Add a route:
    ```typescript
    <Route path="/document-intelligence" element={<DocumentIntelligence />} />
    ```
4.  (Optional) Add a card to `src/components/tools/AllTools.tsx`.

### API Connection
The frontend expects the backend to be running at `http://localhost:8000`. 
If you change the port, update `src/components/tools/DocumentIntelligence/apiService.ts`.

## 3. Limitations & Notes
- **Local Processing**: This tool runs on your machine. Large PDFs (100+ pages) might take time to OCR.
- **Table Accuracy**: Extracting complex tables from *images* (scanned PDFs) is difficult. The tool uses `pdfplumber` for text-PDFs (high accuracy) and basic layout analysis for images (medium accuracy).
- **Security**: Uploaded files are stored in `backend/uploads` and `backend/outputs`. Use the "Clear" button or manually delete them if they contain sensitive data.
