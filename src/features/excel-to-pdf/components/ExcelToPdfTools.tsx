import React, { useState, useRef } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileSpreadsheet, FileDown, Loader2, Table as TableIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ExcelToPdfTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [previewData, setPreviewData] = useState<string[][]>([]);
    const [sheetName, setSheetName] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    const processFile = async (f: File) => {
        setFile(f);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (data) {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                setSheetName(firstSheetName);
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
                setPreviewData(json.slice(0, 50)); // Preview first 50 rows
            }
        };
        reader.readAsArrayBuffer(f);
    };

    const handleDownload = async () => {
        if (!contentRef.current) return;
        setIsConverting(true);

        try {
            await new Promise(r => setTimeout(r, 100)); // Yield
            const canvas = await html2canvas(contentRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${file?.name.replace(/\.[^/.]+$/, "")}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Failed to generate PDF");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <ToolLayout
            title="Excel to PDF"
            description="Convert your Excel spreadsheets to PDF documents with ease."
            icon={<FileSpreadsheet className="w-10 h-10 text-green-600" />}
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
                                if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                            }}
                            onFileInput={(e) => {
                                if (e.target.files?.[0]) processFile(e.target.files[0]);
                            }}
                            accept=".xlsx, .xls, .csv"
                            mode="pdf-to-image" // Reusing style
                        />
                        <p className="text-center text-gray-500 mt-4 text-sm">Supports .xlsx, .xls, .csv</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                                    <p className="text-sm text-gray-400">Sheet: {sheetName} • {previewData.length} preview rows</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setFile(null)}
                                    className="text-gray-500"
                                >
                                    Change File
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    disabled={isConverting}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isConverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
                                    Convert to PDF
                                </Button>
                            </div>
                        </div>

                        {/* Preview Area (Rendered as HTML Table) */}
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm overflow-auto max-h-[600px]">
                            <div ref={contentRef} className="bg-white p-4 min-w-[600px]">
                                <h1 className="text-2xl font-bold mb-4 text-gray-800">{sheetName}</h1>
                                <table className="w-full border-collapse text-sm">
                                    <tbody>
                                        {previewData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                                                {row.map((cell, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="p-2 border border-gray-200 text-gray-700 whitespace-nowrap"
                                                        style={{ fontWeight: rowIndex === 0 ? 'bold' : 'normal', backgroundColor: rowIndex === 0 ? '#f9fafb' : 'transparent' }}
                                                    >
                                                        {cell || ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p className="text-center text-gray-400 text-sm">Note: Only the first sheet is previewed and converted currently.</p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default ExcelToPdfTools;
