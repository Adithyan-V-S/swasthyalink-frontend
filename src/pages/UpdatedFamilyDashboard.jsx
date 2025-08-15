import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFamilyNetwork } from "../services/firebaseFamilyService";
import UpdatedAddFamilyMember from "../components/UpdatedAddFamilyMember";
import FamilyRequestManager from "../components/FamilyRequestManager";
import FamilyNetworkManager from "../components/FamilyNetworkManager";
import FamilyChat from "../components/FamilyChat";

const UpdatedFamilyDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMember, setShowAddMember] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyAccessExpiry, setEmergencyAccessExpiry] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadFamilyNetwork();
    }
  }, [currentUser]);

  const loadFamilyNetwork = async () => {
    setLoading(true);
    setError("");
    
    try {
      const network = await getFamilyNetwork(currentUser.uid);
      setFamilyMembers(network);
    } catch (error) {
      console.error("Error loading family network:", error);
      setError("Failed to load family network. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = (newMember) => {
    // This will be called when a request is sent, not when actually added to network
    console.log("Family request sent:", newMember);
  };

  const handleNetworkUpdate = () => {
    loadFamilyNetwork();
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full max-w-3xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="material-icons text-red-600 mr-2">error</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={loadFamilyNetwork}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            {/* Header stats */}
            <section className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-xl px-4 py-3">
                <div className="text-xs opacity-80">Unread Chats</div>
                <div className="text-2xl font-bold">3</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl px-4 py-3">
                <div className="text-xs opacity-80">Members</div>
                <div className="text-2xl font-bold">{familyMembers.length}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl px-4 py-3">
                <div className="text-xs opacity-80">Emergency</div>
                <div className="text-2xl font-bold">{isEmergencyMode ? 'ON' : 'OFF'}</div>
              </div>
            </section>

            {/* Two rows layout */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Patient overview */}
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-indigo-700">Shared Patient Overview</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Basic Info</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-gray-600">Name</span><span className="font-medium">John Doe</span></li>
                      <li className="flex justify-between"><span className="text-gray-600">Age</span><span className="font-medium">45 years</span></li>
                      <li className="flex justify-between"><span className="text-gray-600">Blood Group</span><span className="font-medium">O+</span></li>
                      <li className="flex justify-between"><span className="text-gray-600">Last Updated</span><span className="font-medium">2024-01-15 14:30</span></li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Emergency Contacts</h4>
                    <div className="space-y-2">
                      {["Sarah Doe", "Emma Doe"].map((c) => (
                        <div key={c} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="font-medium">{c}</span>
                          <span className="text-xs text-gray-500">Emergency</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency control */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-red-700 mb-2">Emergency Access</h3>
                  <p className="text-sm text-gray-600">
                    {isEmergencyMode ? 'Emergency access is active.' : 'Activate emergency access to view critical records.'}
                  </p>
                  {isEmergencyMode && emergencyAccessExpiry && (
                    <p className="text-xs text-red-600 mt-2">Expires: {emergencyAccessExpiry.toLocaleString()}</p>
                  )}
                  <button
                    onClick={() => {
                      if (isEmergencyMode) { setIsEmergencyMode(false); setEmergencyAccessExpiry(null); }
                      else { const t = new Date(); t.setHours(t.getHours()+24); setEmergencyAccessExpiry(t); setIsEmergencyMode(true); }
                    }}
                    className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold transition-colors ${isEmergencyMode ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  >
                    {isEmergencyMode ? 'Deactivate' : 'Activate'}
                  </button>
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowAddMember(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 text-sm">Add Member</button>
                    <button onClick={() => setActiveTab('chat')} className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-3 text-sm">Open Chat</button>
                    <button onClick={() => setActiveTab('network')} className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-3 text-sm">View Network</button>
                    <button onClick={() => setActiveTab('requests')} className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-3 text-sm">Requests</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case "network":
        return (
          <div className="w-full max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Family Network</h2>
              <button
                onClick={() => setShowAddMember(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <span className="material-icons mr-1">person_add</span>
                Add Member
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <FamilyNetworkManager onUpdate={handleNetworkUpdate} />
              </div>
            </div>
          </div>
        );

      case "requests":
        return (
          <div className="w-full max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Family Requests</h2>
              <button
                onClick={() => setShowAddMember(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <span className="material-icons mr-1">person_add</span>
                Add Member
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <FamilyRequestManager onUpdate={handleNetworkUpdate} />
              </div>
            </div>
          </div>
        );

      case "chat":
        return (
          <div className="w-full max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Family Chat</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {familyMembers.length > 0 ? (
                  <FamilyChat members={familyMembers} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-3">
                      <span className="material-icons text-4xl">chat</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Family Members Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Add family members to start chatting with them.
                    </p>
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add Family Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full max-w-3xl mx-auto p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Select an option from the sidebar</p>
            </div>
          </div>
        );
    }
  };

  const navLinks = [
    {
      label: "Overview",
      value: "overview",
      icon: <span className="material-icons">dashboard</span>
    },
    {
      label: "Family Network",
      value: "network",
      icon: <span className="material-icons">people</span>
    },
    {
      label: "Requests",
      value: "requests",
      icon: <span className="material-icons">person_add</span>
    },
    {
      label: "Family Chat",
      value: "chat",
      icon: <span className="material-icons">chat</span>
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Family Dashboard</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <span className="material-icons">
            {sidebarOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar (mirrored to the right) */}
        <aside
          className={`bg-white border-l border-gray-200 w-64 fixed inset-y-0 right-0 transform ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out z-30 md:z-0 md:static h-full`}
        >
          <div className="p-6 border-b border-gray-200 hidden md:block">
            <h1 className="text-2xl font-bold text-gray-800">Family Dashboard</h1>
          </div>
          
          <div className="p-4">
            {navLinks.map((link) => (
              <button
                key={link.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors relative w-full mb-2 ${
                  activeTab === link.value 
                    ? "bg-indigo-100 text-indigo-900 font-bold shadow-sm" 
                    : "hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900"
                }`}
                onClick={() => {
                  setActiveTab(link.value);
                  setSidebarOpen(false); // Close mobile sidebar when option is selected
                }}
              >
                {link.icon}
                <span className="text-sm">{link.label}</span>
              </button>
            ))}
          </div>
        </aside>
        
        {/* Main content */}
        <div className="flex-1 md:mr-64 mr-0">
          {renderMainContent()}
        </div>
      </div>

      {/* Add Family Member Modal */}
      <UpdatedAddFamilyMember
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={handleAddFamilyMember}
      />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </main>
  );
};

export default UpdatedFamilyDashboard;