import React, { useRef } from 'react';
import { usePDFMerge } from '../../features/merge-pdf/hooks/usePDFMerge';
import { Button } from '../ui/Button';
import { Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newFiles = Array.from(files);
    const [movedFile] = newFiles.splice(result.source.index, 1);
    newFiles.splice(result.destination.index, 0, movedFile);
    reorderFiles(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    handleFiles(uploaded);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-20 flex flex-col items-center justify-between py-6 bg-white shadow">
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={openFileDialog}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3"
            >
              <Plus className="w-5 h-5" />
            </button>
            {files.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-black text-white rounded-full px-1">
                {files.length}
              </span>
            )}
          </div>

          <button
            className="bg-gray-200 hover:bg-gray-300 text-black rounded-full p-3"
            title="Sort"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileInput}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Merge PDF</h2>

        <div className="text-sm text-blue-800 bg-blue-100 border border-blue-300 px-4 py-2 rounded mb-6 w-full max-w-md">
          To change the order of your PDFs, drag and drop the files as you want.
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="pdf-list" direction="horizontal">
            {(provided) => (
              <div
                className="flex gap-4 overflow-x-auto pb-2"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {files.map((file, index) => (
                  <Draggable key={file.name} draggableId={file.name} index={index}>
                    {(provided) => (
                      <div
                        className="w-40 flex-shrink-0 border rounded-xl shadow bg-white p-3 text-center"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="h-48 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
                          PDF Preview
                        </div>
                        <p className="text-xs truncate">{file.name}</p>
                        <button
                          onClick={() =>
                            reorderFiles(files.filter((_, i) => i !== index))
                          }
                          className="mt-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {files.length > 1 && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={mergePDFs}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 text-white text-sm rounded-xl shadow-lg"
              disabled={isMerging}
            >
              {isMerging ? 'Merging...' : (
                <span className="flex items-center gap-2">
                  Merge PDF <Plus className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        )}

        {mergedUrl && (
          <div className="mt-8 text-center">
            <a
              href={mergedUrl}
              download="merged.pdf"
              className="text-emerald-600 underline text-sm"
            >
              Download Merged PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
