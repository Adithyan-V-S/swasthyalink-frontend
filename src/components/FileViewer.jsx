import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserFiles, 
  deleteFile, 
  updateFileMetadata, 
  getFileCategories, 
  formatFileSize, 
  getFileTypeIcon 
} from '../services/fileStorageService';
import { processDocumentForAI, getDocumentType } from '../services/documentAIService';
import AISummaryModal from './AISummaryModal';
import Button from './common/Button';

const FileViewer = ({ category = null, onFileSelect }) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const categories = getFileCategories();

  useEffect(() => {
    loadFiles();
  }, [selectedCategory]);

  const loadFiles = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const categoryFilter = selectedCategory === 'all' ? null : selectedCategory;
      const userFiles = await getUserFiles(currentUser.uid, categoryFilter);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId, storagePath, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFile(fileId, storagePath);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.downloadURL;
    link.download = file.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAISummarize = async (file) => {
    try {
      setAiLoading(true);
      setAiError(null);
      setShowAISummary(true);
      
      // Create a file object from the stored file data
      let fileToProcess;
      
      if (file.fileData) {
        // If file data is stored as base64, convert it back to a File object
        const response = await fetch(file.downloadURL);
        const blob = await response.blob();
        fileToProcess = new File([blob], file.fileName, { type: file.fileType });
      } else {
        // If it's a regular file URL, fetch it
        const response = await fetch(file.downloadURL);
        const blob = await response.blob();
        fileToProcess = new File([blob], file.fileName, { type: file.fileType });
      }
      
      // Determine document type
      const documentType = getDocumentType(file.fileName, file.category);
      
      // Process the document
      const result = await processDocumentForAI(fileToProcess, documentType);
      
      if (result.success) {
        setAiSummary({
          summary: result.summary,
          documentInfo: {
            fileName: result.fileName,
            documentType: result.documentType,
            extractedText: result.extractedText
          }
        });
      } else {
        setAiError(result.error);
      }
    } catch (error) {
      console.error('Error processing AI summary:', error);
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const closeAISummary = () => {
    setShowAISummary(false);
    setAiSummary(null);
    setAiError(null);
    setAiLoading(false);
  };

  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      file.fileName.toLowerCase().includes(query) ||
      file.description?.toLowerCase().includes(query) ||
      file.category.toLowerCase().includes(query)
    );
  });

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.icon || 'description';
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.label || 'General';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <span className="material-icons text-red-600 mr-3 mt-1">error</span>
          <div className="flex-1">
            <h3 className="font-medium text-red-800 mb-2">Error Loading Files</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <Button onClick={loadFiles} variant="danger" size="small">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">My Files</h3>
          <p className="text-gray-600 mt-1">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} 
            {selectedCategory !== 'all' && ` in ${getCategoryLabel(selectedCategory)}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-icons text-sm">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-icons text-sm">list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="material-icons text-6xl">folder_open</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Files Found</h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'No files match your search criteria.'
              : selectedCategory !== 'all'
                ? `No files in ${getCategoryLabel(selectedCategory)} category.`
                : 'Upload your first file to get started.'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow ${
                viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-indigo-600">
                          {getFileTypeIcon(file.fileType)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-900 text-sm truncate max-w-32">
                          {file.fileName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {getCategoryLabel(file.category)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {file.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {file.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handlePreview(file)}
                      leftIcon={<span className="material-icons text-sm">visibility</span>}
                      className="flex-1 min-w-0"
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => handleAISummarize(file)}
                      leftIcon={<span className="material-icons text-sm">psychology</span>}
                      className="flex-1 min-w-0"
                    >
                      AI Summarize
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleDownload(file)}
                      leftIcon={<span className="material-icons text-sm">download</span>}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDeleteFile(file.id, file.storagePath, file.fileName)}
                      leftIcon={<span className="material-icons text-sm">delete</span>}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="material-icons text-indigo-600">
                        {getFileTypeIcon(file.fileType)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {file.fileName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{getCategoryLabel(file.category)}</span>
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handlePreview(file)}
                      leftIcon={<span className="material-icons text-sm">visibility</span>}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => handleAISummarize(file)}
                      leftIcon={<span className="material-icons text-sm">psychology</span>}
                    >
                      AI Summarize
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleDownload(file)}
                      leftIcon={<span className="material-icons text-sm">download</span>}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDeleteFile(file.id, file.storagePath, file.fileName)}
                      leftIcon={<span className="material-icons text-sm">delete</span>}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{selectedFile.fileName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="p-6">
              {selectedFile.fileType.startsWith('image/') ? (
                <img
                  src={selectedFile.downloadURL}
                  alt={selectedFile.fileName}
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <span className="material-icons text-6xl">
                      {getFileTypeIcon(selectedFile.fileType)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <Button onClick={() => handleDownload(selectedFile)}>
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      <AISummaryModal
        isOpen={showAISummary}
        onClose={closeAISummary}
        summary={aiSummary?.summary}
        loading={aiLoading}
        error={aiError}
        documentInfo={aiSummary?.documentInfo}
      />
    </div>
  );
};

export default FileViewer;

