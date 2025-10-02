
import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    allowOverflow?: boolean; // New prop to handle dropdowns
}

export const Card: React.FC<CardProps> = ({ title, children, icon, allowOverflow = false }) => {
    return (
        <div className={`bg-surface rounded-lg shadow-sm border border-gray-200 ${allowOverflow ? '' : 'overflow-hidden'}`}>
            <div className="px-4 py-4 sm:px-6 bg-gray-50/50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    {icon}
                    <h2 className="text-lg font-semibold text-on-surface leading-6">{title}</h2>
                </div>
            </div>
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};