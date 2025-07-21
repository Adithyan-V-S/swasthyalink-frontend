import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { auth } from "../firebaseConfig";
import SnakeGame from "./SnakeGame";

const records = [
  {
    date: "2024-05-01",
    doctor: "Dr. A. Sharma",
    diagnosis: "Hypertension",
    prescription: "Amlodipine 5mg",
    notes: "Monitor BP daily. Next visit in 1 month."
  },
  {
    date: "2024-03-15",
    doctor: "Dr. R. Singh",
    diagnosis: "Type 2 Diabetes",
    prescription: "Metformin 500mg",
    notes: "Maintain diet. Exercise regularly."
  },
  {
    date: "2023-12-10",
    doctor: "Dr. P. Verma",
    diagnosis: "Seasonal Flu",
    prescription: "Rest, Paracetamol",
    notes: "Recovered. No complications."
  },
];

const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff&size=64"
};

// Mock family members data
const mockFamilyMembers = [
  {
    id: 1,
    name: "Sarah Doe",
    relationship: "Spouse",
    email: "sarah.doe@example.com",
    phone: "+91 98765 43210",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Doe&background=10b981&color=fff&size=64",
    accessLevel: "full",
    isEmergencyContact: true,
    lastAccess: "2024-01-15 14:30"
  },
  {
    id: 2,
    name: "Michael Doe",
    relationship: "Son",
    email: "michael.doe@example.com",
    phone: "+91 98765 43211",
    avatar: "https://ui-avatars.com/api/?name=Michael+Doe&background=3b82f6&color=fff&size=64",
    accessLevel: "limited",
    isEmergencyContact: false,
    lastAccess: "2024-01-10 09:15"
  },
  {
    id: 3,
    name: "Emma Doe",
    relationship: "Daughter",
    email: "emma.doe@example.com",
    phone: "+91 98765 43212",
    avatar: "https://ui-avatars.com/api/?name=Emma+Doe&background=f59e0b&color=fff&size=64",
    accessLevel: "emergency",
    isEmergencyContact: true,
    lastAccess: "2024-01-12 16:45"
  }
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: "access_granted",
    message: "Sarah Doe was granted full access to your health records",
    timestamp: "2024-01-15 14:30",
    read: false
  },
  {
    id: 2,
    type: "record_updated",
    message: "New medical record added - Dr. Sharma consultation",
    timestamp: "2024-01-14 10:15",
    read: true
  },
  {
    id: 3,
    type: "emergency_access",
    message: "Emergency access activated by Emma Doe",
    timestamp: "2024-01-12 16:45",
    read: false
  }
];

const sidebarLinks = [
  { label: "Dashboard", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
    ) },
  { label: "My Records", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ) },
  { label: "Family", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ), badge: mockNotifications.filter(n => !n.read).length },
  { label: "Appointments", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ), badge: 2 },
  { label: "Prescriptions", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-6a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
    ) },
  { label: "Doctors", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7m0 0l-9-5m9 5l9-5" /></svg>
    ) },
  { label: "Settings", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
    ) },
  // { label: "Logout", icon: (
  //     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
  //   ) },
  { label: "Game", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6h13M9 6l-7 7 7 7" /></svg>
    ) },
];

const helpSupportLink = { label: "Help & Support", icon: (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10a4 4 0 11-8 0 4 4 0 018 0zm0 0v4m0 4h.01" /></svg>
)};

const PatientDashboard = () => {
  const [uid, setUid] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [familyMembers, setFamilyMembers] = useState(mockFamilyMembers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showEmergencyAccess, setShowEmergencyAccess] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: "",
    relationship: "",
    email: "",
    phone: "",
    accessLevel: "limited",
    isEmergencyContact: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const qrValue = uid ? `https://yourapp.com/patient/${uid}` : "";

  const handleAddFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.email) {
      const member = {
        id: Date.now(),
        ...newFamilyMember,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newFamilyMember.name)}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff&size=64`,
        lastAccess: "Never"
      };
      setFamilyMembers([...familyMembers, member]);
      setNewFamilyMember({
        name: "",
        relationship: "",
        email: "",
        phone: "",
        accessLevel: "limited",
        isEmergencyContact: false
      });
      setShowAddFamily(false);
      
      // Add notification
      const notification = {
        id: Date.now(),
        type: "family_added",
        message: `${member.name} was added to your family members`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        read: false
      };
      setNotifications([notification, ...notifications]);
    }
  };

  const handleRemoveFamilyMember = (id) => {
    const member = familyMembers.find(m => m.id === id);
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
    
    // Add notification
    const notification = {
      id: Date.now(),
      type: "family_removed",
      message: `${member.name} was removed from your family members`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      read: false
    };
    setNotifications([notification, ...notifications]);
  };

  const handleUpdateAccessLevel = (id, newLevel) => {
    setFamilyMembers(familyMembers.map(m => 
      m.id === id ? { ...m, accessLevel: newLevel } : m
    ));
    
    const member = familyMembers.find(m => m.id === id);
    const notification = {
      id: Date.now(),
      type: "access_updated",
      message: `${member.name}'s access level was updated to ${newLevel}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      read: false
    };
    setNotifications([notification, ...notifications]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const renderFamilySection = () => (
    <div className="w-full max-w-6xl space-y-8">
      {/* Family Overview */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Family Members</h2>
          <button
            onClick={() => setShowAddFamily(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Family Member
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.relationship}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">{member.email}</p>
                <p className="text-sm text-gray-600">{member.phone}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.accessLevel === 'full' ? 'bg-green-100 text-green-800' :
                    member.accessLevel === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.accessLevel} access
                  </span>
                  {member.isEmergencyContact && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Emergency Contact
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={member.accessLevel}
                  onChange={(e) => handleUpdateAccessLevel(member.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="limited">Limited</option>
                  <option value="full">Full</option>
                  <option value="emergency">Emergency Only</option>
                </select>
                <button
                  onClick={() => handleRemoveFamilyMember(member.id)}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Access */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Emergency Access</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Emergency Contacts</h3>
          <div className="space-y-3">
            {familyMembers.filter(m => m.isEmergencyContact).map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full mr-3" />
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmergencyAccess(true)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Grant Emergency Access
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shared Records */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Shared Health Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-indigo-100">
                <th className="px-4 py-2 text-left text-indigo-700">Family Member</th>
                <th className="px-4 py-2 text-left text-indigo-700">Access Level</th>
                <th className="px-4 py-2 text-left text-indigo-700">Last Access</th>
                <th className="px-4 py-2 text-left text-indigo-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map((member) => (
                <tr key={member.id} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-2 border-b">
                    <div className="flex items-center">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full mr-2" />
                      {member.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.accessLevel === 'full' ? 'bg-green-100 text-green-800' :
                      member.accessLevel === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.accessLevel}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b text-sm text-gray-600">{member.lastAccess}</td>
                  <td className="px-4 py-2 border-b">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-l-4 ${
              notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-400'
            }`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                  {notification.message}
                </p>
                <p className="text-sm text-gray-500 mt-1">{notification.timestamp}</p>
              </div>
              {!notification.read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeIdx) {
      case 0: // Dashboard
        return (
          <>
            <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">My Patient QR Code</h2>
              {uid && (
                <>
                  <QRCode value={qrValue} size={140} className="mb-2" />
                  <div className="text-xs text-gray-500 break-all mt-2">UID: {uid}</div>
                  <div className="text-xs text-gray-400 break-all">{qrValue}</div>
                </>
              )}
              {!uid && <div className="text-gray-400">Loading QR code...</div>}
            </section>
            <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">My Medical Records</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="px-4 py-2 text-left text-indigo-700">Date</th>
                      <th className="px-4 py-2 text-left text-indigo-700">Doctor</th>
                      <th className="px-4 py-2 text-left text-indigo-700">Diagnosis</th>
                      <th className="px-4 py-2 text-left text-indigo-700">Prescription</th>
                      <th className="px-4 py-2 text-left text-indigo-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-4 py-2 border-b">{rec.date}</td>
                        <td className="px-4 py-2 border-b">{rec.doctor}</td>
                        <td className="px-4 py-2 border-b">{rec.diagnosis}</td>
                        <td className="px-4 py-2 border-b">{rec.prescription}</td>
                        <td className="px-4 py-2 border-b">{rec.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        );
      case 1: // My Records
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">My Medical Records</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="px-4 py-2 text-left text-indigo-700">Date</th>
                    <th className="px-4 py-2 text-left text-indigo-700">Doctor</th>
                    <th className="px-4 py-2 text-left text-indigo-700">Diagnosis</th>
                    <th className="px-4 py-2 text-left text-indigo-700">Prescription</th>
                    <th className="px-4 py-2 text-left text-indigo-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-2 border-b">{rec.date}</td>
                      <td className="px-4 py-2 border-b">{rec.doctor}</td>
                      <td className="px-4 py-2 border-b">{rec.diagnosis}</td>
                      <td className="px-4 py-2 border-b">{rec.prescription}</td>
                      <td className="px-4 py-2 border-b">{rec.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      case 2: // Family
        return renderFamilySection();
      case 3: // Appointments
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Appointments</h2>
            <div className="text-center text-gray-500">
              <p>Appointment management coming soon...</p>
            </div>
          </section>
        );
      case 4: // Prescriptions
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Prescriptions</h2>
            <div className="text-center text-gray-500">
              <p>Prescription management coming soon...</p>
            </div>
          </section>
        );
      case 5: // Doctors
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Doctors</h2>
            <div className="text-center text-gray-500">
              <p>Doctor directory coming soon...</p>
            </div>
          </section>
        );
      case 6: // Settings
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Settings</h2>
            <div className="text-center text-gray-500">
              <p>Settings management coming soon...</p>
            </div>
          </section>
        );
      case 7: // Game
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Play Snake Game</h2>
            <SnakeGame />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 flex flex-row items-start">
      {/* Sidebar */}
      <aside className="flex flex-col h-full bg-black rounded-2xl shadow-xl mr-8 p-2 sticky top-10 z-10 justify-between w-56">
        <div>
          {/* User Profile Section */}
          <div className="flex flex-col items-center mb-8">
            <img src={mockUser.avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-indigo-500 mb-2" />
            <div className="font-semibold text-indigo-700 whitespace-nowrap">{mockUser.name}</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{mockUser.email}</div>
          </div>
          <div className="text-2xl font-bold text-indigo-700 mb-6 text-center">Menu</div>
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors relative w-full ${activeIdx === idx ? 'bg-indigo-100 text-indigo-900 font-bold' : 'hover:bg-indigo-100 text-indigo-700'}`}
              onClick={() => setActiveIdx(idx)}
              title={link.label}
            >
              {link.icon}
              <span className="ml-2 whitespace-nowrap">{link.label}</span>
              {link.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold animate-pulse">{link.badge}</span>
              )}
            </button>
          ))}
        </div>
        {/* Help & Support at the bottom */}
        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-50 text-indigo-600 font-medium transition-colors mt-8 w-full"
          title={helpSupportLink.label}
        >
          {helpSupportLink.icon}
          <span className="ml-2 whitespace-nowrap">{helpSupportLink.label}</span>
        </button>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        {renderMainContent()}
      </div>

      {/* Add Family Member Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-indigo-700 mb-6">Add Family Member</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newFamilyMember.name}
                onChange={(e) => setNewFamilyMember({...newFamilyMember, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newFamilyMember.relationship}
                onChange={(e) => setNewFamilyMember({...newFamilyMember, relationship: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newFamilyMember.email}
                onChange={(e) => setNewFamilyMember({...newFamilyMember, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newFamilyMember.phone}
                onChange={(e) => setNewFamilyMember({...newFamilyMember, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <select
                value={newFamilyMember.accessLevel}
                onChange={(e) => setNewFamilyMember({...newFamilyMember, accessLevel: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="limited">Limited Access</option>
                <option value="full">Full Access</option>
                <option value="emergency">Emergency Only</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newFamilyMember.isEmergencyContact}
                  onChange={(e) => setNewFamilyMember({...newFamilyMember, isEmergencyContact: e.target.checked})}
                  className="mr-2"
                />
                Emergency Contact
              </label>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddFamilyMember}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddFamily(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Access Modal */}
      {showEmergencyAccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-700 mb-6">Emergency Access Granted</h3>
            <p className="text-gray-600 mb-6">
              Emergency access has been activated. Your emergency contacts can now view your critical health information for the next 24 hours.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> This access will automatically expire in 24 hours for security reasons.
              </p>
            </div>
            <button
              onClick={() => setShowEmergencyAccess(false)}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default PatientDashboard; 