import React, { useState } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileSpreadsheet, Download, Loader2, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';
import '../../../utils/pdf-worker';

const PdfToExcelTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);

    const convertToExcel = async () => {
        if (!file) return;
        setIsConverting(true);
        setProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const fullData: string[][] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                setProgress(Math.round((i / pdf.numPages) * 100));
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Very basic extraction: grouping by Y coordinate (row)
                // This is an approximation. Real PDF tables are hard.
                const rowMap: Record<number, { str: string, x: number }[]> = {};

                textContent.items.forEach((item: any) => {
                    const y = Math.round(item.transform[5]); // Y coordinate
                    if (!rowMap[y]) rowMap[y] = [];
                    rowMap[y].push({ str: item.str, x: item.transform[4] });
                });

                // Sort rows by Y (PDF Y is bottom-to-top usually, so sort descending)
                const sortedY = Object.keys(rowMap).map(Number).sort((a, b) => b - a);

                sortedY.forEach(y => {
                    // Sort items in row by X
                    const rowItems = rowMap[y].sort((a, b) => a.x - b.x);
                    fullData.push(rowItems.map(item => item.str));
                });

                fullData.push([]); // Empty row between pages
            }

            const ws = XLSX.utils.aoa_to_sheet(fullData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "PDF Data");
            XLSX.writeFile(wb, `${file.name.replace('.pdf', '')}.xlsx`);

        } catch (err) {
            console.error("Conversion failed", err);
            alert("Failed to convert PDF to Excel");
        } finally {
            setIsConverting(false);
            setProgress(0);
        }
    };

    return (
        <ToolLayout
            title="PDF to Excel"
            description="Extract data from PDF documents into editable Excel spreadsheets."
            icon={<FileSpreadsheet className="w-10 h-10 text-emerald-600" />}
        >
            <div className="space-y-8">
                {!file ? (
                    <div className="max-w-3xl mx-auto">
                        <FileDropzone
                            isDragging={false}
                            isConverting={false}
                            progress={null}
                            onDragOver={(e) => e.preventDefault()}
                            onDragLeave={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                            }}
                            onFileInput={(e) => {
                                if (e.target.files?.[0]) setFile(e.target.files[0]);
                            }}
                            mode="pdf"
                            accept=".pdf"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="p-4 bg-red-50 rounded-full">
                            <FileText className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900">{file.name}</h3>
                            <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setFile(null)}
                                disabled={isConverting}
                            >
                                Change File
                            </Button>
                            <Button
                                onClick={convertToExcel}
                                disabled={isConverting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Converting {progress}%...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Excel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default PdfToExcelTools;
