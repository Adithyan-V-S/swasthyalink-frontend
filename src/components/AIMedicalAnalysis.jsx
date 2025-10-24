import React, { useState, useRef } from 'react';
import { processDocumentForAI } from '../services/documentAIService';
import geminiService from '../services/geminiService';

const AIMedicalAnalysis = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('document');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [drugs, setDrugs] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleDocumentAnalysis = async () => {
    if (!uploadedFile) {
      setError('Please upload a document first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await processDocumentForAI(uploadedFile);
      setAnalysisResult(result);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSymptomAnalysis = async () => {
    if (!symptoms.trim()) {
      setError('Please enter symptoms for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `As a medical AI assistant, analyze the following symptoms and provide a comprehensive assessment:

Patient Information:
- Age: ${patientAge || 'Not specified'}
- Gender: ${patientGender || 'Not specified'}
- Medical History: ${medicalHistory || 'Not provided'}

Symptoms: ${symptoms}

Please provide:
1. Potential differential diagnoses (most likely to least likely)
2. Recommended diagnostic tests
3. Red flag symptoms to watch for
4. Immediate actions if any
5. Follow-up recommendations

Format your response in a clear, professional manner suitable for medical professionals.`;

      const result = await geminiService.sendMessage(prompt);
      setAnalysisResult({
        summary: result,
        type: 'symptom_analysis',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrugInteractionCheck = async () => {
    if (!drugs.trim()) {
      setError('Please enter drug names for interaction check');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `As a medical AI assistant, analyze the following medications for potential drug interactions:

Medications: ${drugs}
Patient Age: ${patientAge || 'Not specified'}
Patient Gender: ${patientGender || 'Not specified'}
Medical History: ${medicalHistory || 'Not provided'}

Please provide:
1. Potential drug interactions (severe, moderate, minor)
2. Contraindications
3. Dosage considerations
4. Alternative medications if needed
5. Monitoring recommendations

Format your response in a clear, professional manner suitable for medical professionals.`;

      const result = await geminiService.sendMessage(prompt);
      setAnalysisResult({
        summary: result,
        type: 'drug_interaction',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTreatmentPlanGeneration = async () => {
    if (!symptoms.trim() && !clinicalNotes.trim()) {
      setError('Please provide symptoms or clinical notes for treatment plan generation');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `As a medical AI assistant, generate a comprehensive treatment plan based on the following information:

Patient Information:
- Age: ${patientAge || 'Not specified'}
- Gender: ${patientGender || 'Not specified'}
- Medical History: ${medicalHistory || 'Not provided'}

Clinical Information:
- Symptoms: ${symptoms || 'Not provided'}
- Clinical Notes: ${clinicalNotes || 'Not provided'}

Please provide:
1. Primary diagnosis and differential diagnoses
2. Treatment goals and objectives
3. Pharmacological interventions (if applicable)
4. Non-pharmacological interventions
5. Monitoring and follow-up schedule
6. Patient education points
7. Warning signs to watch for

Format your response in a clear, professional manner suitable for medical professionals.`;

      const result = await geminiService.sendMessage(prompt);
      setAnalysisResult({
        summary: result,
        type: 'treatment_plan',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNotesAnalysis = async () => {
    if (!clinicalNotes.trim()) {
      setError('Please enter clinical notes for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `As a medical AI assistant, analyze the following clinical notes and extract key insights:

Clinical Notes: ${clinicalNotes}
Patient Age: ${patientAge || 'Not specified'}
Patient Gender: ${patientGender || 'Not specified'}
Medical History: ${medicalHistory || 'Not provided'}

Please provide:
1. Key findings and observations
2. Potential concerns or red flags
3. Recommended next steps
4. Areas requiring follow-up
5. Documentation suggestions

Format your response in a clear, professional manner suitable for medical professionals.`;

      const result = await geminiService.sendMessage(prompt);
      setAnalysisResult({
        summary: result,
        type: 'notes_analysis',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    setSymptoms('');
    setPatientAge('');
    setPatientGender('');
    setMedicalHistory('');
    setDrugs('');
    setClinicalNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Medical Analysis</h2>
                <p className="text-purple-100">Advanced AI-powered medical analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: 'document', name: 'Document Analysis', icon: '📄' },
                { id: 'symptom', name: 'Symptom Analysis', icon: '🔍' },
                { id: 'drug', name: 'Drug Interactions', icon: '💊' },
                { id: 'treatment', name: 'Treatment Plans', icon: '💡' },
                { id: 'notes', name: 'Notes Analysis', icon: '📝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Patient Information Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter medical history"
                  />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'document' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mb-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {uploadedFile ? 'Change File' : 'Upload Document'}
                    </button>
                  </div>
                  {uploadedFile && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {uploadedFile.name}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleDocumentAnalysis}
                    disabled={!uploadedFile || isAnalyzing}
                    className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'symptom' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="4"
                    placeholder="Describe the patient's symptoms in detail..."
                  />
                </div>
                <button
                  onClick={handleSymptomAnalysis}
                  disabled={!symptoms.trim() || isAnalyzing}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
                </button>
              </div>
            )}

            {activeTab === 'drug' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                  <textarea
                    value={drugs}
                    onChange={(e) => setDrugs(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter drug names (one per line or separated by commas)..."
                  />
                </div>
                <button
                  onClick={handleDrugInteractionCheck}
                  disabled={!drugs.trim() || isAnalyzing}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Checking...' : 'Check Drug Interactions'}
                </button>
              </div>
            )}

            {activeTab === 'treatment' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe the patient's symptoms..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter clinical notes and observations..."
                  />
                </div>
                <button
                  onClick={handleTreatmentPlanGeneration}
                  disabled={(!symptoms.trim() && !clinicalNotes.trim()) || isAnalyzing}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Generating...' : 'Generate Treatment Plan'}
                </button>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="6"
                    placeholder="Enter clinical notes for analysis..."
                  />
                </div>
                <button
                  onClick={handleNotesAnalysis}
                  disabled={!clinicalNotes.trim() || isAnalyzing}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Notes'}
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Analysis Result */}
            {analysisResult && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">AI Analysis Result</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(analysisResult.summary)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Copy
                    </button>
                    <button
                      onClick={resetForm}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      New Analysis
                    </button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {analysisResult.summary}
                  </pre>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Analysis completed at: {new Date(analysisResult.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMedicalAnalysis;
