import React from "react";
import {
  FileImage,
  FileText,
  PenTool,
  Layers,
  FilePen,
  Image,
  FilePieChart,
  QrCode,
} from "lucide-react";
import { ToolType } from "../../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ToolCard } from "./../ui/ToolCard";
import { Link } from "react-router-dom";

interface AllToolsProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const toolsList: {
  title: string;
  description: string;
  toolKey: ToolType;
  icon: React.ReactNode;
}[] = [
  {
    title: "Image to PDF",
    description: "Convert JPG, PNG images into a single PDF document.",
    toolKey: "pdf",
    icon: <FileImage className="w-5 h-5 text-blue-600" />,
  },
  {
    title: "PDF to Image",
    description: "Extract images from PDF pages in PNG/JPG format.",
    toolKey: "image",
    icon: <FileText className="w-5 h-5 text-green-600" />,
  },
  {
    title: "E-Signatures",
    description: "Sign your PDFs or request others to sign securely.",
    toolKey: "signature",
    icon: <PenTool className="w-5 h-5 text-red-600" />,
  },
  {
    title: "Rename Image Files",
    description: "Remove prefixes or batch rename images automatically.",
    toolKey: "rename-image",
    icon: <FilePen className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: "Split PDF",
    description: "Remove prefixes or batch rename images automatically.",
    toolKey: "split-pdf",
    icon: <FilePieChart className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDFs into a single organized file.",
    toolKey: "merge",
    icon: <Layers className="w-5 h-5 text-yellow-600" />,
  },
  {
    title: "Compress",
    description: "Combine multiple PDFs into a single organized file.",
    toolKey: "Compress",
    icon: <Layers className="w-5 h-5 text-yellow-600" />,
  },
  {
    title: "any-to-image",
    description: "Convert image and PDF Builk Data into PNG or JPG images.",
    toolKey: "any-to-image",
    icon: <Image className="w-5 h-5 text-purple-600" />,
  },
  {
    title: "QR Code Generator",
    description: "Convert image and PDF Builk Data into PNG or JPG images.",
    toolKey: "QRCodeGenerator",
    icon: <QrCode className="w-5 h-5 text-purple-600" />,
  },
    {
    title: "Filter bulk Image Name with input",
    description: "Filter bulk Image Name with input",
    toolKey: "FilterImageName",
    icon: <QrCode className="w-5 h-5 text-purple-600" />,
  },
];

export const AllTools: React.FC<AllToolsProps> = ({
  activeTool,
  setActiveTool,
}) => {
  const [tools, setTools] = React.useState(toolsList);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(tools);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setTools(reordered);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">
        All File Converter Tools
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="toolGrid" direction="horizontal">
          {(provided) => (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tools.map((tool, index) => (
                <Draggable
                  key={tool.toolKey}
                  draggableId={tool.toolKey}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Link to={`/${tool.toolKey}`}>
                        <ToolCard
                          icon={tool.icon}
                          title={tool.title}
                          description={tool.description}
                          toolKey={tool.toolKey}
                          active={false} // or keep this dynamic if needed
                        />
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
  );
};
