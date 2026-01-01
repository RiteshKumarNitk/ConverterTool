import React from 'react';

interface ResultsTableProps {
    data: any[][]; // 2D array
    label?: string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, label }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            {label && (
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-semibold text-gray-700">
                    {label}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {data[0].map((cell, index) => (
                                <th key={index} className="px-6 py-3 border-b">
                                    Col {index + 1}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
