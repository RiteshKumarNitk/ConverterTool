import fitz  # PyMuPDF
import pikepdf
import io
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from typing import List, Union

class PDFEditor:
    
    def merge_pdfs(self, file_paths: List[str], output_path: str):
        """Merges multiple PDFs into one."""
        doc = fitz.open()
        for path in file_paths:
            with fitz.open(path) as sub_doc:
                doc.insert_pdf(sub_doc)
        doc.save(output_path)
        doc.close()

    def split_pdf(self, file_path: str, output_dir: str, mode: str = "all", ranges: str = None):
        """
        Splits PDF.
        mode='all': Explode into individual pages.
        mode='range': Extract specific pages (e.g., "1-3,5").
        """
        doc = fitz.open(file_path)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        result_paths = []

        if mode == "all":
            for i in range(len(doc)):
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=i, to_page=i)
                out_path = os.path.join(output_dir, f"{base_name}_page_{i+1}.pdf")
                new_doc.save(out_path)
                result_paths.append(out_path)
        
        elif mode == "range" and ranges:
            # Simple range parser: "1-3,5" -> [0, 1, 2, 4]
            page_nums = set()
            parts = ranges.split(',')
            for part in parts:
                if '-' in part:
                    start, end = map(int, part.split('-'))
                    page_nums.update(range(start-1, end))
                else:
                    page_nums.add(int(part) - 1)
            
            new_doc = fitz.open()
            for i in sorted(page_nums):
                if 0 <= i < len(doc):
                    new_doc.insert_pdf(doc, from_page=i, to_page=i)
            
            out_path = os.path.join(output_dir, f"{base_name}_extracted.pdf")
            new_doc.save(out_path)
            result_paths.append(out_path)

        doc.close()
        return result_paths

    def rotate_pdf(self, file_path: str, output_path: str, rotation: int, page_indices: List[int] = None):
        """Rotates pages by 90, 180, 270 degrees."""
        doc = fitz.open(file_path)
        for i in range(len(doc)):
            if page_indices is None or i in page_indices:
                doc[i].set_rotation(rotation)
        doc.save(output_path)
        doc.close()

    def compress_pdf(self, file_path: str, output_path: str):
        """Compresses PDF by garbage collection and deflating streams."""
        doc = fitz.open(file_path)
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()

    def protect_pdf(self, file_path: str, output_path: str, password: str):
        """Encrypts PDF with a password using pikepdf."""
        with pikepdf.Pdf.open(file_path) as pdf:
            pdf.save(
                output_path,
                encryption=pikepdf.Encryption(
                    user=password, owner=password, R=6
                )
            )

    def unlock_pdf(self, file_path: str, output_path: str, password: str):
        """Removes password from a PDF."""
        try:
            with pikepdf.Pdf.open(file_path, password=password) as pdf:
                pdf.save(output_path)
            return True
        except pikepdf.PasswordError:
            return False

    def add_watermark(self, file_path: str, output_path: str, text: str):
        """Adds a simple text watermark to all pages."""
        # Create watermark canvas
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=letter)
        can.setFont("Helvetica", 50)
        can.setFillColorRGB(0.5, 0.5, 0.5, 0.3) # Grey, semi-transparent
        can.rotate(45)
        can.drawString(100, 100, text)
        can.save()
        packet.seek(0)
        
        # Merge using PyMuPDF overlay
        watermark_pdf = fitz.open("pdf", packet.read())
        doc = fitz.open(file_path)
        
        for page in doc:
            page.show_pdf_page(page.rect, watermark_pdf, 0)
            
        doc.save(output_path)
        doc.close()

    def convert_to_images(self, file_path: str, output_dir: str) -> List[str]:
        """Converts PDF pages to images (PNG)."""
        doc = fitz.open(file_path)
        image_paths = []
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        
        for i in range(len(doc)):
            page = doc.load_page(i)
            # High resolution (zoom=2)
            mat = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=mat)
            out_name = f"{base_name}_page_{i+1}.png"
            out_path = os.path.join(output_dir, out_name)
            pix.save(out_path)
            image_paths.append(out_name)
            
        doc.close()
        return image_paths

pdf_editor = PDFEditor()
