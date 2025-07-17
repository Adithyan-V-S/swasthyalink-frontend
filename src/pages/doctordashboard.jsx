import React from "react";

const DoctorDashboard = () => {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-lg">
            {/* Doctor/health icon */}
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm0 0c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0 0v8m-4-4h8" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-blue-700">Welcome, Doctor!</h2>
          <p className="text-gray-600 text-center mt-2">This is your dashboard. Here you can manage your patients, appointments, and more.</p>
        </div>
        <div className="w-full mt-8">
          <div className="bg-blue-50 rounded-xl p-6 mb-4 shadow flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0v8m-4-4h8" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-1">Profile Summary</h3>
              <p className="text-gray-700">Doctor's name, specialization, and contact info will appear here. (Connect to your profile data!)</p>
            </div>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow text-center text-gray-500">
            <p>🚧 <span className="font-semibold text-blue-600">Doctor-specific features</span> coming soon: patient management, appointments, analytics, and more!</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DoctorDashboard; 