
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
    return (
        <button
            {...props}
            className={`
                flex items-center justify-center px-6 py-3 border border-transparent 
                text-base font-semibold rounded-lg text-white shadow-sm
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50
                transition-all duration-200 ease-in-out
                hover:shadow-md hover:transform hover:scale-[1.02]
                ${className}
            `}
        >
            {children}
        </button>
    );
};