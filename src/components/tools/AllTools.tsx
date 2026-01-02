import React, { useState } from "react";
import {
  FileImage,
  FileText,
  PenTool,
  Layers,
  FilePen,
  Image,
  FilePieChart,
  QrCode,
  ImageDown,
  Minimize2,
  Filter,
  Wand2, // For 'Image to any'
  Sparkles,
  FileSpreadsheet, // Excel
  Crop, // Crop
  ShieldAlert, // Redact

  Languages, // Font Converter
  ScanText, // OCR
  BrainCircuit, // Doc Intelligence
  Mic, // TTS
  Mail, // Bulk Sender
  FileAudio // Audio to Text
} from "lucide-react";
import { ToolType } from "../../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Link } from "react-router-dom";

interface AllToolsProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

interface ToolItem {
  title: string;
  description: string;
  toolKey: ToolType | string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const initialTools: ToolItem[] = [
  {
    title: "Image to PDF",
    description: "Convert JPG, PNG images into a single professional PDF document.",
    toolKey: "pdf",
    icon: <FileImage className="w-8 h-8 text-white" />,
    color: "bg-blue-600",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    title: "PDF to Image",
    description: "Extract high-quality images from PDF pages in PNG or JPG format.",
    toolKey: "image",
    icon: <FileText className="w-8 h-8 text-white" />,
    color: "bg-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "E-Signatures",
    description: "Sign your PDFs securely or request digital signatures from others.",
    toolKey: "signature",
    icon: <PenTool className="w-8 h-8 text-white" />,
    color: "bg-rose-600",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    title: "Rename Images",
    description: "Batch rename image files and remove unwanted prefixes automatically.",
    toolKey: "rename-image",
    icon: <FilePen className="w-8 h-8 text-white" />,
    color: "bg-violet-600",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Split PDF",
    description: "Separate a single PDF file into multiple distinct PDF documents.",
    toolKey: "split-pdf",
    icon: <FilePieChart className="w-8 h-8 text-white" />,
    color: "bg-orange-600",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files into one single, organized document.",
    toolKey: "merge",
    icon: <Layers className="w-8 h-8 text-white" />,
    color: "bg-cyan-600",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while maintaining document quality.",
    toolKey: "compress",
    icon: <Minimize2 className="w-8 h-8 text-white" />,
    color: "bg-red-600",
    gradient: "from-red-500 to-orange-600",
  },
  {
    title: "Any to Image",
    description: "Convert bulk PDFs and various files into image formats.",
    toolKey: "any-to-image",
    icon: <Image className="w-8 h-8 text-white" />,
    color: "bg-fuchsia-600",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    title: "QR Generator",
    description: "Generate standard and custom QR codes instantly.",
    toolKey: "QRCodeGenerator",
    icon: <QrCode className="w-8 h-8 text-white" />,
    color: "bg-slate-700",
    gradient: "from-slate-700 to-slate-900",
  },
  {
    title: "Filter by Name",
    description: "Filter bulk image collections using smart keyword matching.",
    toolKey: "FilterImageName",
    icon: <Filter className="w-8 h-8 text-white" />,
    color: "bg-lime-600",
    gradient: "from-lime-500 to-green-600",
  },
  {
    title: "Image Converter",
    description: "Transform images between various formats (JPG, PNG, WEBP).",
    toolKey: "ImageConverter",
    icon: <Wand2 className="w-8 h-8 text-white" />,
    color: "bg-indigo-600",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    title: "PDF Editor Live",
    description: "Edit, annotate, and modify PDF documents in real-time.",
    toolKey: "PDFEdit",
    icon: <ImageDown className="w-8 h-8 text-white" />,
    color: "bg-sky-600",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    title: "Font Converter",
    description: "Convert Hindi fonts (Devlys 010 <=> Mangal/Unicode).",
    toolKey: "fontconverter",
    icon: <Languages className="w-8 h-8 text-white" />,
    color: "bg-amber-600",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    title: "Image Enhancer",
    description: "Upscale, denoise, and sharpen images with pro-level adjustments.",
    toolKey: "image-enhancer",
    icon: <Sparkles className="w-8 h-8 text-white" />,
    color: "bg-purple-600",
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets (.xlsx) to PDF documents.",
    toolKey: "excel-to-pdf",
    icon: <FileSpreadsheet className="w-8 h-8 text-white" />,
    color: "bg-green-600",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    title: "PDF to Excel",
    description: "Convert PDF tables into editable Excel spreadsheets.",
    toolKey: "pdf-to-excel",
    icon: <FileSpreadsheet className="w-8 h-8 text-white" />,
    color: "bg-emerald-600",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents (.docx) to PDF format.",
    toolKey: "word-to-pdf",
    icon: <FileText className="w-8 h-8 text-white" />,
    color: "bg-blue-700",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF documents to editable Word files.",
    toolKey: "pdf-to-word",
    icon: <FileText className="w-8 h-8 text-white" />,
    color: "bg-indigo-600",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    title: "Crop PDF",
    description: "Trim margins and crop PDF pages visually.",
    toolKey: "crop-pdf",
    icon: <Crop className="w-8 h-8 text-white" />,
    color: "bg-amber-600",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Redact PDF",
    description: "Permanently hide sensitive info with black bars.",
    toolKey: "redact-pdf",
    icon: <ShieldAlert className="w-8 h-8 text-white" />,
    color: "bg-red-700",
    gradient: "from-red-600 to-rose-700",
  },
  {
    title: "OCR PDF",
    description: "Extract text from scanned PDFs (English, Hindi, etc).",
    toolKey: "ocr-pdf",
    icon: <ScanText className="w-8 h-8 text-white" />,
    color: "bg-orange-600",
    gradient: "from-orange-500 to-yellow-600",
  },
  {
    title: "Doc Intelligence",
    description: "Extract text and tables from documents using AI.",
    toolKey: "document-intelligence",
    icon: <BrainCircuit className="w-8 h-8 text-white" />,
    color: "bg-blue-600",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "Text to Speech",
    description: "Convert text into natural sounding speech using advanced AI voices.",
    toolKey: "text-to-speech",
    icon: <Mic className="w-8 h-8 text-white" />,
    color: "bg-pink-600",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    title: "Bulk Sender",
    description: "Send mass Emails and WhatsApp messages using a CSV list.",
    toolKey: "bulk-sender",
    icon: <Mail className="w-8 h-8 text-white" />,
    color: "bg-cyan-600",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Audio to Text",
    description: "Transcribe speech to text using AI (Whisper).",
    toolKey: "audio-to-text",
    icon: <FileAudio className="w-8 h-8 text-white" />,
    color: "bg-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Pro PDF Editor",
    description: "Multi-tool: Merge, Split, Rotate, Compress, Secure.",
    toolKey: "pdf-editor",
    icon: <Layers className="w-8 h-8 text-white" />,
    color: "bg-indigo-600",
    gradient: "from-indigo-500 to-purple-600",
  },
];

export const AllTools: React.FC<AllToolsProps> = () => {
  const [tools, setTools] = useState(initialTools);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(tools);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setTools(reordered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
            Converter Tools Suite
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            A comprehensive collection of powerful tools to manage, convert, and edit your documents and images with ease.
          </p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="toolGrid" direction="horizontal">
            {(provided) => (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tools.map((tool, index) => (
                  <Draggable
                    key={tool.toolKey}
                    draggableId={tool.toolKey}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transform transition-all duration-300 ${snapshot.isDragging ? 'scale-105 z-50' : 'hover:-translate-y-2'
                          }`}
                      >
                        <Link to={`/${tool.toolKey}`} className="block h-full">
                          <div className="group relative h-full bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                            {/* Header Gradient */}
                            <div className={`h-24 bg-gradient-to-r ${tool.gradient} flex items-center justify-center relative overflow-hidden`}>
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

                              {/* Decorative circles */}
                              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-black/5 rounded-full blur-xl" />

                              <div className="relative transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                                {tool.icon}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                {tool.title}
                              </h3>
                              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                                {tool.description}
                              </p>

                              <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-blue-600 transition-colors mt-auto">
                                <span>Open Tool</span>
                                <svg
                                  className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
