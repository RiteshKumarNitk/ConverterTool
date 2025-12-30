import { pdfjs } from 'react-pdf';

// Use local worker import to match the installed package version exactly.
// This is the most robust way when versions are aligned.
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
