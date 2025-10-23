import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import FileViewer from '../components/FileViewer';
import Button from '../components/common/Button';

const FileManager = () => {
  const { currentUser } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (uploadedFiles) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    // Refresh the file viewer
    setRefreshKey(prev => prev + 1);
    setShowUpload(false);
  };

  const handleFileSelect = (file) => {
    console.log('File selected:', file);
    // Handle file selection (e.g., open in new tab, show details, etc.)
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your files.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">File Manager</h1>
              <p className="text-gray-600 mt-2">
                Store and manage your medical documents, prescriptions, and health records
              </p>
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              leftIcon={<span className="material-icons">cloud_upload</span>}
            >
              Upload Files
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="material-icons text-blue-600">description</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="material-icons text-green-600">medical_services</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medical Records</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="material-icons text-yellow-600">receipt</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="material-icons text-purple-600">science</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lab Reports</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* File Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">File Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { value: 'medical', label: 'Medical Records', icon: 'medical_services', color: 'blue' },
              { value: 'prescription', label: 'Prescriptions', icon: 'receipt', color: 'green' },
              { value: 'lab', label: 'Lab Reports', icon: 'science', color: 'purple' },
              { value: 'imaging', label: 'Scans & X-rays', icon: 'photo_camera', color: 'indigo' },
              { value: 'insurance', label: 'Insurance', icon: 'account_balance', color: 'yellow' },
              { value: 'general', label: 'General', icon: 'description', color: 'gray' }
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category.value
                    ? `border-${category.color}-500 bg-${category.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <span className={`material-icons text-2xl mb-2 ${
                    selectedCategory === category.value ? `text-${category.color}-600` : 'text-gray-400'
                  }`}>
                    {category.icon}
                  </span>
                  <p className={`text-sm font-medium ${
                    selectedCategory === category.value ? `text-${category.color}-700` : 'text-gray-600'
                  }`}>
                    {category.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* File Viewer */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <FileViewer
            key={refreshKey}
            category={selectedCategory === 'all' ? null : selectedCategory}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Upload Modal */}
        <FileUpload
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUpload={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default FileManager;


