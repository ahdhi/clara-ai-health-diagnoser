import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ICD10Code, ICD10Service, ICD10Category } from '../../services/icd10Service';
import { Spinner } from './Spinner';

// Simple SVG Icons
const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292M12 6.042A8.967 8.967 0 0018 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292M12 6.042v11.5" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853L14.25 12M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

interface ICD10ModalProps {
  isOpen: boolean;
  onClose: () => void;
  icdCode: string | null;
}

export const ICD10Modal: React.FC<ICD10ModalProps> = ({ isOpen, onClose, icdCode }) => {
  const [codeData, setCodeData] = useState<ICD10Code | null>(null);
  const [relatedCodes, setRelatedCodes] = useState<ICD10Code[]>([]);
  const [category, setCategory] = useState<ICD10Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!icdCode || !isOpen) {
      setCodeData(null);
      setRelatedCodes([]);
      setCategory(null);
      setError(null);
      return;
    }

    const loadCodeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [code, related, cat] = await Promise.all([
          ICD10Service.getByCode(icdCode),
          ICD10Service.getRelatedCodes(icdCode),
          ICD10Service.getCategoryForCode(icdCode)
        ]);

        setCodeData(code || null);
        setRelatedCodes(related);
        setCategory(cat || null);
        
        if (!code) {
          setError(`The ICD-10 code "${icdCode}" was not found in our database.`);
        }
      } catch (err) {
        console.error('Failed to load ICD-10 code data:', err);
        setError('Failed to load code information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCodeData();
  }, [icdCode, isOpen]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-center space-x-3">
              <Spinner size="sm" />
              <span className="text-gray-600">Loading ICD-10 code information...</span>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }

  if (error || !codeData) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                ICD-10 Code Not Found
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600">
              {error || `The ICD-10 code "${icdCode}" was not found in our database.`}
            </p>
            <div className="mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-2xl w-full rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  ICD-10 Code: {codeData.code}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {category?.title || 'Medical Code Reference'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Main Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {codeData.description}
              </p>
            </div>

            {/* Category Information */}
            {category && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <TagIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Category</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      {category.title} ({category.range})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Synonyms */}
            {codeData.synonyms && codeData.synonyms.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Also Known As</h4>
                <div className="flex flex-wrap gap-2">
                  {codeData.synonyms.map((synonym, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {synonym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Codes */}
            {relatedCodes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Related ICD-10 Codes</h4>
                <div className="space-y-2">
                  {relatedCodes.map((relatedCode) => (
                    <div
                      key={relatedCode.code}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            {relatedCode.code}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-900">
                            {relatedCode.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification)
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ICD10Modal;