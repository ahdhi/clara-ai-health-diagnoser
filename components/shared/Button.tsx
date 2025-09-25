
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            {...props}
            className={`
                flex items-center justify-center px-5 py-2.5 border border-transparent 
                text-sm font-medium rounded-md text-white 
                bg-primary hover:bg-primary-dark 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors duration-200
                ${className}
            `}
        >
            {children}
        </button>
    );
};