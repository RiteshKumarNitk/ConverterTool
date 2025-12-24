import React, { useRef } from 'react';
import { usePDFMerge } from '../../features/merge-pdf/hooks/usePDFMerge';
import { Button } from '../ui/Button';
import { Trash2, Plus, ArrowUpDown, Layers, FileDown, Upload } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ToolLayout } from '../layout/ToolLayout';
import { FileDropzone } from '../common/FileDropzone';

export const MergeTools: React.FC = () => {
  const {
    files,
    mergedUrl,
    isMerging,
    handleFiles,
    reorderFiles,
    mergePDFs,
    reset,
  } = usePDFMerge();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newFiles = Array.from(files);
    const [movedFile] = newFiles.splice(result.source.index, 1);
    newFiles.splice(result.destination.index, 0, movedFile);
    reorderFiles(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const uploaded = Array.from(e.dataTransfer.files);
    handleFiles(uploaded);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    handleFiles(uploaded);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };


  return (
    <ToolLayout
      title="Merge PDF Files"
      description="Combine multiple PDF files into one single document. Drag and drop to reorder files exactly how you want them."
      icon={<Layers className="w-10 h-10 text-cyan-600" />}
    >
      <div className="space-y-8">

        {/* Initial Upload State */}
        {files.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <FileDropzone
              isDragging={isDragging}
              isConverting={isMerging}
              progress={null}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInput={handleFileInput}
              mode="merge"
            />
          </div>
        ) : (
          /* File Management State */
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-2 text-blue-800">
                <ArrowUpDown className="w-5 h-5" />
                <span className="font-medium">Drag items to change order</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileInput}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={openFileDialog}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reset
                </Button>
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pdf-list" direction="horizontal">
                {(provided) => (
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {files.map((file, index) => (
                      <Draggable key={`${file.name}-${index}`} draggableId={`${file.name}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              relative bg-white border-2 rounded-xl p-4 flex flex-col items-center text-center shadow-sm transition-all
                              ${snapshot.isDragging ? 'border-blue-500 shadow-xl rotate-2 z-50' : 'border-gray-100 hover:border-blue-200'}
                            `}
                          >
                            <div className="w-16 h-20 bg-gray-50 border border-gray-200 rounded mb-3 flex items-center justify-center relative">
                              <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
                              <div className="absolute -top-2 -right-2 bg-red-100 p-1 rounded-full text-red-600 no-drag cursor-pointer hover:bg-red-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderFiles(files.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-700 truncate w-full px-2" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Merge Action */}
            <div className="flex justify-center pt-8">
              <Button
                onClick={mergePDFs}
                disabled={isMerging || files.length < 2}
                className={`
                    px-8 py-4 text-lg font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-1
                    ${isMerging || files.length < 2
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
                  }
                 `}
              >
                {isMerging ? (
                  <span className="flex items-center">Merging PDFs...</span>
                ) : (
                  <span className="flex items-center">
                    Merge {files.length} Files <Layers className="ml-2 w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>

            {/* Result Section */}
            {mergedUrl && (
              <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileDown className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Success!</h3>
                <p className="text-green-600 mb-6">Your files have been merged into a single PDF.</p>
                <a
                  href={mergedUrl}
                  download="merged_document.pdf"
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  Download Merged PDF
                </a>
              </div>
            )}

          </div>
        )}
      </div>
    </ToolLayout>
  );
};
