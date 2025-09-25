import React, { useState, useEffect } from 'react';
import { fixStoredDoctors } from '../utils/credentialTest';

const DebugCredentials = () => {
  const [mockDoctors, setMockDoctors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadMockDoctors = () => {
      const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
      setMockDoctors(doctors);
    };

    loadMockDoctors();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadMockDoctors();
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mockDoctorsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mockDoctorsUpdated', handleStorageChange);
    };
  }, [refreshKey]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleFixCredentials = () => {
    const result = fixStoredDoctors();
    alert(`Fixed ${result.fixedCount} out of ${result.totalDoctors} doctor credentials.`);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const generateCorrectPassword = (email) => {
    // Extract timestamp from email
    const match = email.match(/doctor(\d+)@/);
    if (match) {
      const timestamp = match[1];
      return `Doc${timestamp.slice(-6)}!`;
    }
    return 'N/A (Manual email)';
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Debug: Available Doctor Credentials</h3>
      
      {mockDoctors.length === 0 ? (
        <p className="text-yellow-700">No doctors found in localStorage. Create some doctors in the admin dashboard first.</p>
      ) : (
        <div className="space-y-3">
          {mockDoctors.map((doctor, index) => {
            const correctPassword = generateCorrectPassword(doctor.email);
            const passwordMismatch = doctor.password !== correctPassword;
            
            return (
              <div key={index} className={`p-3 rounded border ${passwordMismatch ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Email:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{doctor.email}</code>
                        <button 
                          onClick={() => copyToClipboard(doctor.email)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Stored Password:</span>
                        <code className={`px-2 py-1 rounded text-sm ${passwordMismatch ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                          {doctor.password}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(doctor.password)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      {passwordMismatch && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-700">Expected Password:</span>
                          <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{correctPassword}</code>
                          <button 
                            onClick={() => copyToClipboard(correctPassword)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {passwordMismatch && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    ⚠️ Password mismatch detected! The stored password doesn't match the expected pattern.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">🔍 How Doctor Passwords Are Generated:</h4>
        <p className="text-sm text-blue-700">
          For email <code>doctor{'{timestamp}'}@swasthyalink.com</code>,
          password is <code>Doc{'{last6digits}'}!</code>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Example: doctor175880755605@swasthyalink.com → Doc755605!
        </p>
        <div className="mt-3">
          <button
            onClick={handleFixCredentials}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            🔧 Fix All Stored Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugCredentials;
