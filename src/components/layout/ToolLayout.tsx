import React from 'react';

interface ToolLayoutProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
    title,
    description,
    icon,
    children
}) => {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            {icon}
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-4 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
                    {children}
                </div>
            </div>
        </div>
    );
};
