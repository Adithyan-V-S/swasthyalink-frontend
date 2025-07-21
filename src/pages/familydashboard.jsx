import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

// Mock shared patient data
const mockSharedPatient = {
  name: "John Doe",
  age: 45,
  bloodGroup: "O+",
  emergencyContacts: ["Sarah Doe", "Emma Doe"],
  lastUpdated: "2024-01-15 14:30"
};

// Mock shared health records (filtered based on access level)
const mockSharedRecords = [
  {
    id: 1,
    date: "2024-05-01",
    doctor: "Dr. A. Sharma",
    diagnosis: "Hypertension",
    prescription: "Amlodipine 5mg",
    notes: "Monitor BP daily. Next visit in 1 month.",
    accessLevel: "full",
    isEmergency: false
  },
  {
    id: 2,
    date: "2024-03-15",
    doctor: "Dr. R. Singh",
    diagnosis: "Type 2 Diabetes",
    prescription: "Metformin 500mg",
    notes: "Maintain diet. Exercise regularly.",
    accessLevel: "limited",
    isEmergency: false
  },
  {
    id: 3,
    date: "2023-12-10",
    doctor: "Dr. P. Verma",
    diagnosis: "Seasonal Flu",
    prescription: "Rest, Paracetamol",
    notes: "Recovered. No complications.",
    accessLevel: "emergency",
    isEmergency: true
  },
];

// Mock family member info
const mockFamilyMember = {
  name: "Sarah Doe",
  relationship: "Spouse",
  accessLevel: "full",
  avatar: "https://ui-avatars.com/api/?name=Sarah+Doe&background=10b981&color=fff&size=64"
};

const FamilyDashboard = () => {
  const [uid, setUid] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyAccessExpiry, setEmergencyAccessExpiry] = useState(null);
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Filter records based on access level
    let accessibleRecords = [];
    
    if (isEmergencyMode) {
      // In emergency mode, show all emergency records
      accessibleRecords = mockSharedRecords.filter(record => record.isEmergency);
    } else {
      // Filter based on family member's access level
      switch (mockFamilyMember.accessLevel) {
        case "full":
          accessibleRecords = mockSharedRecords;
          break;
        case "limited":
          accessibleRecords = mockSharedRecords.filter(record => 
            record.accessLevel === "limited" || record.accessLevel === "emergency"
          );
          break;
        case "emergency":
          accessibleRecords = mockSharedRecords.filter(record => 
            record.accessLevel === "emergency"
          );
          break;
        default:
          accessibleRecords = [];
      }
    }
    
    setFilteredRecords(accessibleRecords);
  }, [isEmergencyMode]);

  const activateEmergencyAccess = () => {
    setIsEmergencyMode(true);
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24); // 24 hours from now
    setEmergencyAccessExpiry(expiryTime);
    
    // In a real app, this would trigger notifications to the patient
    console.log("Emergency access activated for 24 hours");
  };

  const deactivateEmergencyAccess = () => {
    setIsEmergencyMode(false);
    setEmergencyAccessExpiry(null);
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case "full": return "bg-green-100 text-green-800";
      case "limited": return "bg-yellow-100 text-yellow-800";
      case "emergency": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderOverview = () => (
    <div className="w-full max-w-6xl space-y-8">
      {/* Patient Overview */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Patient Overview</h2>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccessLevelColor(mockFamilyMember.accessLevel)}`}>
              {mockFamilyMember.accessLevel} Access
            </span>
            {isEmergencyMode && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
                Emergency Mode Active
              </span>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{mockSharedPatient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{mockSharedPatient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Group:</span>
                <span className="font-medium">{mockSharedPatient.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{mockSharedPatient.lastUpdated}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contacts</h3>
            <div className="space-y-2">
              {mockSharedPatient.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{contact}</span>
                  <span className="text-sm text-gray-500">Emergency Contact</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Access Control */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Emergency Access</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Mode</h3>
              <p className="text-red-700">
                {isEmergencyMode 
                  ? "Emergency access is currently active. You can view all emergency health records."
                  : "Activate emergency access to view critical health information in case of emergency."
                }
              </p>
              {isEmergencyMode && emergencyAccessExpiry && (
                <p className="text-sm text-red-600 mt-2">
                  Access expires: {emergencyAccessExpiry.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={isEmergencyMode ? deactivateEmergencyAccess : activateEmergencyAccess}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isEmergencyMode 
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isEmergencyMode ? "Deactivate Emergency Access" : "Activate Emergency Access"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderHealthRecords = () => (
    <div className="w-full max-w-6xl">
      <section className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Shared Health Records</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {filteredRecords.length} of {mockSharedRecords.length} records
            </span>
            {isEmergencyMode && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Emergency Mode
              </span>
            )}
          </div>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600">
              {isEmergencyMode 
                ? "No emergency records available."
                : "No health records are currently shared with your access level."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="px-4 py-2 text-left text-indigo-700">Date</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Doctor</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Diagnosis</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Prescription</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Notes</th>
                  <th className="px-4 py-2 text-left text-indigo-700">Access Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-4 py-2 border-b">{record.date}</td>
                    <td className="px-4 py-2 border-b">{record.doctor}</td>
                    <td className="px-4 py-2 border-b">{record.diagnosis}</td>
                    <td className="px-4 py-2 border-b">{record.prescription}</td>
                    <td className="px-4 py-2 border-b">{record.notes}</td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${getAccessLevelColor(record.accessLevel)}`}>
                        {record.accessLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );

  const renderMainContent = () => {
    switch (activeIdx) {
      case 0: // Overview
        return renderOverview();
      case 1: // Health Records
        return renderHealthRecords();
      case 2: // Emergency
        return (
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Emergency Information</h2>
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  {mockSharedPatient.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="font-medium">{contact}</span>
                      <span className="text-sm text-gray-600">Emergency Contact</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Allergies & Conditions</h3>
                <p className="text-gray-600">No known allergies or critical conditions recorded.</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Current Medications</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Amlodipine 5mg - Daily
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Metformin 500mg - Twice daily
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const sidebarLinks = [
    { 
      label: "Overview", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" />
        </svg>
      ) 
    },
    { 
      label: "Health Records", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) 
    },
    { 
      label: "Emergency", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ) 
    },
  ];

  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 flex flex-row items-start">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-full bg-black rounded-2xl shadow-xl mr-8 p-2 sticky top-10 z-10 justify-between transition-all duration-300 group hover:w-56 w-16">
        <div>
          {/* Family Member Profile Section */}
          <div className="flex flex-col items-center transition-all duration-300 overflow-hidden group-hover:max-h-40 max-h-0 group-hover:mb-8 mb-0 group-hover:scale-100 scale-0 group-hover:opacity-100 opacity-0 group-hover:max-w-full max-w-0">
            <img src={mockFamilyMember.avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-indigo-500 mb-2" />
            <div className="font-semibold text-indigo-700 whitespace-nowrap">{mockFamilyMember.name}</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{mockFamilyMember.relationship}</div>
          </div>
          <div className="text-2xl font-bold text-indigo-700 mb-6 text-center transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:mb-6 mb-0 group-hover:scale-100 scale-0 group-hover:max-w-full max-w-0">Family Access</div>
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors relative group/sidebar w-full ${activeIdx === idx ? 'bg-indigo-100 text-indigo-900 font-bold' : 'hover:bg-indigo-100 text-indigo-700'}`}
              onClick={() => setActiveIdx(idx)}
              title={link.label}
            >
              {link.icon}
              <span className="transition-all duration-300 group-hover/sidebar:opacity-100 opacity-0 group-hover/sidebar:ml-2 ml-[-8px] whitespace-nowrap group-hover/sidebar:scale-100 scale-0 group-hover/sidebar:max-w-full max-w-0">{link.label}</span>
            </button>
          ))}
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        {renderMainContent()}
      </div>
    </main>
  );
};

export default FamilyDashboard; 