import React from 'react';

const HealthRiskSummary = ({ assessment }) => {
  if (!assessment || !assessment.success) {
    return null;
  }

  const { overallRisk, factorBreakdown, diseaseRisks, recommendations } = assessment;

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'very-high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return '🟢';
      case 'moderate': return '🟡';
      case 'high': return '🟠';
      case 'very-high': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Health Risk Assessment</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(overallRisk.level)}`}>
            {getRiskIcon(overallRisk.level)} {overallRisk.category.description}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {(overallRisk.score * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {overallRisk.level.replace('-', ' ')}
            </div>
            <div className="text-sm text-gray-600">Risk Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {assessment.dataCompleteness}%
            </div>
            <div className="text-sm text-gray-600">Data Completeness</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
          <p className="text-gray-700">{overallRisk.category.action}</p>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Factor Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(factorBreakdown).map(([factor, data]) => (
            <div key={factor} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {factor.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  data.score < 0.3 ? 'bg-green-100 text-green-800' :
                  data.score < 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {(data.score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    data.score < 0.3 ? 'bg-green-500' :
                    data.score < 0.6 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${data.score * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disease-Specific Risks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Disease Risk Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(diseaseRisks).map(([disease, risk]) => (
            <div key={disease} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {disease} Risk
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  risk < 0.2 ? 'bg-green-100 text-green-800' :
                  risk < 0.4 ? 'bg-yellow-100 text-yellow-800' :
                  risk < 0.7 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {(risk * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    risk < 0.2 ? 'bg-green-500' :
                    risk < 0.4 ? 'bg-yellow-500' :
                    risk < 0.7 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${risk * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Recommendations</h3>

        {/* Immediate Actions */}
        {recommendations.immediate && recommendations.immediate.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
              <span className="mr-2">🚨</span>
              Immediate Actions Required
            </h4>
            <ul className="space-y-2">
              {recommendations.immediate.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Short-term Recommendations */}
        {recommendations.shortTerm && recommendations.shortTerm.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-orange-600 mb-3 flex items-center">
              <span className="mr-2">📅</span>
              Short-term Goals (1-3 months)
            </h4>
            <ul className="space-y-2">
              {recommendations.shortTerm.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Long-term Recommendations */}
        {recommendations.longTerm && recommendations.longTerm.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Long-term Health Goals
            </h4>
            <ul className="space-y-2">
              {recommendations.longTerm.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lifestyle Recommendations */}
        {recommendations.lifestyle && recommendations.lifestyle.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
              <span className="mr-2">🌱</span>
              Daily Lifestyle Habits
            </h4>
            <ul className="space-y-2">
              {recommendations.lifestyle.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Medical Disclaimer</h4>
            <p className="mt-1 text-sm text-yellow-700">
              This AI-powered health assessment is for informational purposes only and should not replace professional medical advice,
              diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns and before making
              significant health decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskSummary;
