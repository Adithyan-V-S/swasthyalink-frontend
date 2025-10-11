import React, { useState, useEffect } from 'react';

const PatientProfileModal = ({ patient, isOpen, onClose }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && patient) {
      loadPatientData();
    }
  }, [isOpen, patient]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      // Load patient prescriptions
      // Removed prescriptionService usage as it does not exist
      setPrescriptions([]);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {(patient.patientName || patient.name || 'P').split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.patientName || patient.name}</h2>
                <p className="text-gray-600">{patient.patientEmail || patient.email}</p>
                <div className="flex items-center space-x-4 mt-1">
                  {patient.patientAge && <span className="text-sm text-gray-500">Age: {patient.patientAge}</span>}
                  {patient.patientGender && <span className="text-sm text-gray-500">Gender: {patient.patientGender}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'prescriptions', 'medical-history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{patient.patientEmail || patient.email}</p>
                  </div>
                  {patient.patientPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{patient.patientPhone}</p>
                    </div>
                  )}
                  {patient.emergencyContact && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                      <p className="text-gray-900">{patient.emergencyContact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.bloodType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                      <p className="text-gray-900">{patient.bloodType}</p>
                    </div>
                  )}
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Connection Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.connectionDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Connected Since</label>
                      <p className="text-gray-900">{new Date(patient.connectionDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {patient.lastInteraction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Interaction</label>
                      <p className="text-gray-900">{new Date(patient.lastInteraction).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Prescription History</h3>
                <span className="text-sm text-gray-500">{prescriptions.length} prescriptions</span>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{prescription.diagnosis || 'General Prescription'}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prescription.status === 'sent' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-700">Medications:</h5>
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="bg-gray-50 rounded p-2">
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-600">
                              {med.dosage} - {med.frequency}
                              {med.duration && ` for ${med.duration}`}
                            </p>
                            {med.instructions && (
                              <p className="text-sm text-gray-500 italic">{med.instructions}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {prescription.instructions && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Instructions:</strong> {prescription.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No prescriptions found for this patient</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medical-history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {patient.medicalHistory.map((entry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{entry.condition || entry.title}</h4>
                          <p className="text-sm text-gray-600">{entry.date}</p>
                        </div>
                        <span className="text-sm text-gray-500">{entry.type || 'Medical Record'}</span>
                      </div>
                      {entry.description && (
                        <p className="mt-2 text-gray-700">{entry.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No medical history available</p>
                  <p className="text-sm text-gray-400 mt-1">Medical history will appear here as it's added</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileModal;
