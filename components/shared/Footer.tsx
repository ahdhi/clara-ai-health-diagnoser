
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-surface border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-6 text-center">
                {/* Main Title */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-on-surface">Clara AI - Health Diagnostics</h3>
                    <p className="text-sm text-subtle mt-1">Clinical Learning and Diagnostic Assessment</p>
                </div>

                {/* Product Information */}
                <div className="mb-4">
                    <p className="text-sm text-subtle">
                        A Product of <span className="font-semibold text-primary">Luminatus AI</span> | 
                        Developed by <span className="font-semibold text-on-surface">Adhi</span>
                    </p>
                </div>

                {/* Medical Disclaimer */}
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 max-w-2xl mx-auto">
                        This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                </div>

                {/* Copyright */}
                <div className="mt-4 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} Luminatus AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};