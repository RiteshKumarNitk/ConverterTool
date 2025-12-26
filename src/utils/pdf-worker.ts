import { pdfjs } from 'react-pdf';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker using Vite's URL import
// This ensures the worker is correctly bundled, hashed, and served by Vite
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
