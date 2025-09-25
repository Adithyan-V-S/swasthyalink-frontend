import React, { useState } from 'react';

const HealthMetricsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');

  // Mock data for demonstration - in real app, this would come from user's health records
  const mockData = {
    bloodPressure: [
      { date: '2024-01-01', systolic: 140, diastolic: 90 },
      { date: '2024-01-15', systolic: 135, diastolic: 85 },
      { date: '2024-02-01', systolic: 142, diastolic: 92 },
      { date: '2024-02-15', systolic: 138, diastolic: 88 },
      { date: '2024-03-01', systolic: 134, diastolic: 84 },
    ],
    cholesterol: [
      { date: '2024-01-01', value: 220 },
      { date: '2024-01-15', value: 215 },
      { date: '2024-02-01', value: 210 },
      { date: '2024-02-15', value: 205 },
      { date: '2024-03-01', value: 200 },
    ],
    glucose: [
      { date: '2024-01-01', value: 110 },
      { date: '2024-01-15', value: 105 },
      { date: '2024-02-01', value: 108 },
      { date: '2024-02-15', value: 102 },
      { date: '2024-03-01', value: 98 },
    ],
    bmi: [
      { date: '2024-01-01', value: 28.5 },
      { date: '2024-01-15', value: 28.2 },
      { date: '2024-02-01', value: 27.8 },
      { date: '2024-02-15', value: 27.5 },
      { date: '2024-03-01', value: 27.2 },
    ]
  };

  const metrics = [
    { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
    { key: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL' },
    { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
    { key: 'bmi', label: 'BMI', unit: '' }
  ];

  const getTrend = (data, key) => {
    if (data.length < 2) return 'stable';

    const first = key === 'bloodPressure' ? data[0].systolic : data[0].value;
    const last = key === 'bloodPressure' ? data[data.length - 1].systolic : data[data.length - 1].value;

    const change = ((last - first) / first) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const currentData = mockData[selectedMetric];
  const trend = getTrend(currentData, selectedMetric);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Health Trends Over Time</h3>

        {/* Metric Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Health Metric
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metrics.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>

        {/* Trend Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                {metrics.find(m => m.key === selectedMetric)?.label} Trend
              </h4>
              <p className="text-sm text-gray-600">
                Based on your last {currentData.length} measurements
              </p>
            </div>
            <div className={`flex items-center ${getTrendColor(trend)}`}>
              <span className="text-2xl mr-2">{getTrendIcon(trend)}</span>
              <span className="font-medium capitalize">{trend}</span>
            </div>
          </div>
        </div>

        {/* Simple Chart Visualization */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-end justify-between h-64 space-x-2">
            {currentData.map((point, index) => {
              const value = selectedMetric === 'bloodPressure' ? point.systolic : point.value;
              const maxValue = selectedMetric === 'bloodPressure' ? 200 :
                              selectedMetric === 'cholesterol' ? 300 :
                              selectedMetric === 'glucose' ? 200 : 40;
              const height = (value / maxValue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <span>0</span>
            <span>{selectedMetric === 'bloodPressure' ? '200' :
                   selectedMetric === 'cholesterol' ? '300' :
                   selectedMetric === 'glucose' ? '200' : '40'}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Recent Measurements</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.slice().reverse().map((point, index) => {
                  const value = selectedMetric === 'bloodPressure' ? `${point.systolic}/${point.diastolic}` : point.value;
                  const status = selectedMetric === 'bloodPressure' ?
                    (point.systolic < 120 ? 'Normal' : point.systolic < 140 ? 'Elevated' : 'High') :
                    selectedMetric === 'cholesterol' ?
                    (point.value < 200 ? 'Desirable' : point.value < 240 ? 'Borderline' : 'High') :
                    selectedMetric === 'glucose' ?
                    (point.value < 100 ? 'Normal' : point.value < 126 ? 'Prediabetic' : 'Diabetic') :
                    (point.value < 25 ? 'Normal' : point.value < 30 ? 'Overweight' : 'Obese');

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(point.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {value} {metrics.find(m => m.key === selectedMetric)?.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status === 'Normal' || status === 'Desirable' ? 'bg-green-100 text-green-800' :
                          status === 'Elevated' || status === 'Borderline' || status === 'Prediabetic' || status === 'Overweight' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Advanced Analytics Coming Soon</h4>
            <p className="mt-1 text-sm text-blue-700">
              We're working on advanced trend analysis, predictive modeling, and personalized insights.
              Connect your health devices for real-time monitoring and more detailed analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetricsChart;
