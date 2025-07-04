import React from 'react';
import { FileImage, FileText, PenTool, Layers } from 'lucide-react';
import { ToolType } from '../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ToolCard } from './../ui/ToolCard';

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
    title: 'Image to PDF',
    description: 'Convert images like JPG, PNG to PDF easily.',
    toolKey: 'pdf',
    icon: <FileImage className="w-5 h-5" />,
  },
  {
    title: 'PDF to Image',
    description: 'Convert each page of a PDF to PNG or JPG.',
    toolKey: 'image',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: 'E-Signatures',
    description: 'Sign your PDF or request others to sign.',
    toolKey: 'signature',
    icon: <PenTool className="w-5 h-5" />,
  },
  {
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one.',
    toolKey: 'merge',
    icon: <Layers className="w-5 h-5" />,
  }
];

export const AllTools: React.FC<AllToolsProps> = ({ activeTool, setActiveTool }) => {
  const [tools, setTools] = React.useState(toolsList);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(tools);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setTools(reordered);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Choose a Tool</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="toolGrid" direction="horizontal">
          {(provided) => (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tools.map((tool, index) => (
                <Draggable key={tool.toolKey} draggableId={tool.toolKey} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <ToolCard
                        icon={tool.icon}
                        title={tool.title}
                        description={tool.description}
                        onClick={() => setActiveTool(tool.toolKey)}
                        toolKey={tool.toolKey}
                        active={activeTool === tool.toolKey}
                      />
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
