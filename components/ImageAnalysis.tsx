
import React, { useCallback, useState } from 'react';
import { ImageData } from '../types';
import { UploadIcon, XCircleIcon } from './shared/icons';

interface ImageAnalysisProps {
    imageData: ImageData | null;
    setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove the data URL prefix
        };
        reader.onerror = error => reject(error);
    });
};

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ imageData, setImageData }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback(async (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini inline data
                alert("File size exceeds 4MB. Please choose a smaller file.");
                return;
            }
            try {
                const base64 = await fileToBase64(file);
                setImageData({ base64, mimeType: file.type, fileName: file.name });
            } catch (error) {
                console.error("Error converting file to base64", error);
                alert("Error processing file. Please try again.");
            }
        }
    }, [setImageData]);

    const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e.target.files);
    };

    const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setImageData(null);
    }
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-on-surface border-b border-gray-200 pb-2 mb-4">Medical Image Analysis</h3>
            {!imageData ? (
                <div className="mt-1">
                    <label 
                        htmlFor="file-upload" 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`flex justify-center w-full px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-primary' : 'border-gray-300'} border-dashed rounded-lg cursor-pointer transition-colors duration-200 bg-surface hover:border-primary-dark`}
                    >
                        <div className="space-y-1 text-center">
                           <UploadIcon className="mx-auto h-12 w-12 text-subtle" />
                            <div className="flex text-sm text-subtle">
                                <p className="pl-1">
                                    <span className="font-semibold text-primary">Upload a file</span> or drag and drop
                                </p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 4MB</p>
                        </div>
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={onFileInputChange} />
                </div>
            ) : (
                <div className="relative group animate-fade-in">
                    <p className="text-sm font-medium text-subtle mb-2">Image for Analysis: <span className="font-normal text-on-surface">{imageData.fileName}</span></p>
                    <div className="relative overflow-hidden rounded-lg aspect-w-16 aspect-h-9 bg-gray-200">
                        <img 
                            src={`data:${imageData.mimeType};base64,${imageData.base64}`} 
                            alt="Medical scan" 
                            className="object-contain w-full h-full max-h-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center animate-subtle-pulse">
                            <div className="w-1/3 h-1/3 bg-red-500 opacity-20 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                     <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        aria-label="Remove image"
                    >
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
            )}
        </div>
    );
};