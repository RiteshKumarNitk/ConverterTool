import React, { useState } from 'react';
import { FileJson, FileSpreadsheet, FileText, Table as TableIcon, Type } from 'lucide-react';
import { getDownloadUrl } from './apiService';

interface PreviewPanelProps {
    data: any;
    fileId: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ data, fileId }) => {
    const [activeTab, setActiveTab] = useState<'text' | 'tables' | 'json'>('text');

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mt-8">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'text' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <Type className="w-4 h-4" /> Extracted Text
                </button>
                <button
                    onClick={() => setActiveTab('tables')}
                    className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'tables' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <TableIcon className="w-4 h-4" /> Extracted Tables
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {data.preview?.tables_count || 0}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('json')}
                    className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'json' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <FileJson className="w-4 h-4" /> Raw JSON
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 min-h-[400px]">
                {activeTab === 'text' && (
                    <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            {data.preview?.text_snippet || "No text extracted..."}
                            {data.preview?.text_snippet?.length > 499 && "..."}
                        </pre>
                    </div>
                )}

                {activeTab === 'tables' && (
                    <div>
                        {data.preview?.tables_count === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                No tables detected in this document.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-500 italic">
                                    * Note: Complex tables might require manual verification in Excel.
                                </p>
                                {/* We just show a placeholder here because the full table data is heavy to send for preview 
                    unless we updated the backend to send it all. 
                    Ideally, we'd fetch the JSON fully. For this demo, let's assume we rely on Excel download.
                */}
                                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100 flex items-center gap-2">
                                    <TableIcon className="w-5 h-5" />
                                    <span>
                                        {data.preview?.tables_count} table(s) detected. Please download the Excel file to view/edit them.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'json' && (
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-auto max-h-[500px] text-xs">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-wrap gap-4 justify-end">
                <a
                    href={getDownloadUrl(fileId, 'json')}
                    target="_blank"
                    download
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                >
                    <FileJson className="w-4 h-4" /> JSON
                </a>
                <a
                    href={getDownloadUrl(fileId, 'docx')}
                    target="_blank"
                    download
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium"
                >
                    <FileText className="w-4 h-4" /> Word
                </a>
                <a
                    href={getDownloadUrl(fileId, 'xlsx')}
                    target="_blank"
                    download
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-medium"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                </a>
            </div>
        </div>
    );
};
