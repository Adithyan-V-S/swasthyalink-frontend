import React, { useState } from 'react';
import Button from './common/Button';

const AISummaryModal = ({ isOpen, onClose, summary, loading, error, documentInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="material-icons text-blue-600">psychology</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">AI Document Summary</h3>
              <p className="text-sm text-gray-600">
                {documentInfo?.fileName && `File: ${documentInfo.fileName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Analyzing Document</h3>
              <p className="text-gray-600 text-center">
                Our AI is reading and analyzing your document. This may take a few moments...
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="material-icons text-sm">description</span>
                  <span>Extracting text content</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="material-icons text-sm">psychology</span>
                  <span>Generating AI summary</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <span className="material-icons text-red-600 mr-3 mt-1">error</span>
                <div className="flex-1">
                  <h3 className="font-medium text-red-800 mb-2">Error Generating Summary</h3>
                  <p className="text-sm text-red-700 mb-4">{error}</p>
                  <Button onClick={onClose} variant="danger" size="small">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {summary && !loading && (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="material-icons text-blue-600">summarize</span>
                  <h4 className="font-semibold text-blue-800">Document Summary</h4>
                </div>
                <p className="text-sm text-blue-700">
                  AI-powered analysis of your {documentInfo?.documentType || 'document'}
                </p>
              </div>

              {/* Summary Content */}
              <div className="prose prose-sm max-w-none">
                <div 
                  className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: summary.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              </div>

              {/* Document Info */}
              {documentInfo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">Document Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File Name:</span>
                      <span className="ml-2 font-medium">{documentInfo.fileName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Document Type:</span>
                      <span className="ml-2 font-medium capitalize">{documentInfo.documentType}</span>
                    </div>
                    {documentInfo.extractedText && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Text Preview:</span>
                        <div className="mt-2 text-gray-700 bg-white p-4 rounded border text-sm max-h-48 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                            {documentInfo.extractedText}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    // Copy summary to clipboard
                    navigator.clipboard.writeText(summary);
                    alert('Summary copied to clipboard!');
                  }}
                  variant="secondary"
                  leftIcon={<span className="material-icons text-sm">content_copy</span>}
                >
                  Copy Summary
                </Button>
                <Button
                  onClick={onClose}
                  variant="primary"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;
