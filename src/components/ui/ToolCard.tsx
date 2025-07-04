import React from 'react';
import { cn } from '../../utils/cn';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  active?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  icon,
  title,
  description,
  onClick,
  active = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-xl shadow-md border cursor-pointer transition-all duration-300 select-none',
        active ? 'border-blue-500 bg-blue-50 scale-105' : 'bg-white hover:shadow-lg'
      )}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 text-center mt-2">{description}</p>
    </div>
  );
};
