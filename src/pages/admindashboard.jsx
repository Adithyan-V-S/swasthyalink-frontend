import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    license: "",
    phone: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Mock data for analytics
  const analyticsData = {
    totalPatients: 1247,
    totalDoctors: doctors.length,
    totalRevenue: 45678,
    appointments: 89,
    growthRate: 12.5,
    patientGrowth: 8.2,
    revenueGrowth: 15.3
  };

  useEffect(() => {
    // Check for preset admin first
    const isPresetAdmin = localStorage.getItem('presetAdmin') === 'true';
    if (isPresetAdmin) {
      setCurrentUser({ email: 'admin@gmail.com', displayName: 'Admin User' });
      fetchData();
      return;
    }
    
    // Only check Firebase Auth if not preset admin
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if user is admin
        const userDoc = await getDocs(collection(db, "users"));
        const userData = userDoc.docs.find(doc => doc.data().uid === user.uid);
        if (userData && userData.data().role === "admin") {
          setCurrentUser(user);
          fetchData();
        } else {
          // Not admin, redirect to login
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    // For preset admin, skip Firestore fetching initially
    const isPresetAdmin = localStorage.getItem('presetAdmin') === 'true';
    if (isPresetAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch doctors
      const doctorsSnapshot = await getDocs(collection(db, "users"));
      const doctorsData = doctorsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === "doctor");
      setDoctors(doctorsData);

      // Fetch staff (you can create a separate collection for staff)
      const staffSnapshot = await getDocs(collection(db, "staff"));
      const staffData = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffData);

      // Fetch pharmacy items
      const pharmacySnapshot = await getDocs(collection(db, "pharmacy"));
      const pharmacyData = pharmacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPharmacy(pharmacyData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear preset admin flag
      localStorage.removeItem('presetAdmin');
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const newDoctor = {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization,
        license: formData.license,
        phone: formData.phone,
        role: "doctor",
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "users"), newDoctor);
      setFormData({
        name: "",
        email: "",
        password: "",
        specialization: "",
        license: "",
        phone: ""
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await deleteDoc(doc(db, "users", doctorId));
        fetchData();
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const newStaff = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.specialization, // Using specialization field for staff role
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "staff"), newStaff);
      setFormData({
        name: "",
        email: "",
        password: "",
        specialization: "",
        license: "",
        phone: ""
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const handleAddPharmacyItem = async (e) => {
    e.preventDefault();
    try {
      const newItem = {
        name: formData.name,
        quantity: parseInt(formData.specialization), // Using specialization field for quantity
        price: parseFloat(formData.license), // Using license field for price
        category: formData.phone, // Using phone field for category
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "pharmacy"), newItem);
      setFormData({
        name: "",
        email: "",
        password: "",
        specialization: "",
        license: "",
        phone: ""
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error("Error adding pharmacy item:", error);
    }
  };

  const handleFormSubmit = (e) => {
    if (activeTab === "doctors") {
      handleAddDoctor(e);
    } else if (activeTab === "staff") {
      handleAddStaff(e);
    } else if (activeTab === "pharmacy") {
      handleAddPharmacyItem(e);
    }
  };

  if (loading) {
    // For preset admin, show dashboard even if loading
    const isPresetAdmin = localStorage.getItem('presetAdmin') === 'true';
    if (isPresetAdmin && currentUser) {
      // Show dashboard even if loading for preset admin
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading admin dashboard...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Swasthyalink Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">A</span>
                </div>
                <span className="text-gray-300">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <nav className="mt-8">
            {[
              { id: "overview", name: "Overview", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" },
              { id: "doctors", name: "Doctors", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { id: "staff", name: "Staff", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
              { id: "pharmacy", name: "Pharmacy", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Total Patients</p>
                      <p className="text-3xl font-bold text-white">{analyticsData.totalPatients}</p>
                      <p className="text-blue-200 text-sm">+{analyticsData.patientGrowth}% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm font-medium">Total Doctors</p>
                      <p className="text-3xl font-bold text-white">{analyticsData.totalDoctors}</p>
                      <p className="text-green-200 text-sm">Active medical staff</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold text-white">${analyticsData.totalRevenue.toLocaleString()}</p>
                      <p className="text-purple-200 text-sm">+{analyticsData.revenueGrowth}% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Appointments</p>
                      <p className="text-3xl font-bold text-white">{analyticsData.appointments}</p>
                      <p className="text-orange-200 text-sm">Today's appointments</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: "New patient registered", time: "2 minutes ago", type: "patient" },
                    { action: "Doctor appointment scheduled", time: "15 minutes ago", type: "appointment" },
                    { action: "Pharmacy inventory updated", time: "1 hour ago", type: "pharmacy" },
                    { action: "Staff member added", time: "2 hours ago", type: "staff" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'patient' ? 'bg-blue-500' :
                        activity.type === 'appointment' ? 'bg-green-500' :
                        activity.type === 'pharmacy' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.action}</p>
                        <p className="text-gray-400 text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs Content */}
          {activeTab !== "overview" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white capitalize">
                  {activeTab === "doctors" && "Manage Doctors"}
                  {activeTab === "staff" && "Manage Staff"}
                  {activeTab === "pharmacy" && "Manage Pharmacy"}
                </h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add {activeTab.slice(0, -1)}</span>
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        {activeTab === "doctors" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">License</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                        {activeTab === "staff" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                        {activeTab === "pharmacy" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {activeTab === "doctors" && doctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doctor.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doctor.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doctor.specialization}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doctor.license}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doctor.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteDoctor(doctor.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === "staff" && staff.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{member.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteDoctor(member.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === "pharmacy" && pharmacy.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${item.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteDoctor(item.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-96 shadow-2xl rounded-xl bg-gray-800 border-gray-700">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-white mb-6">
                Add {activeTab.slice(0, -1)}
              </h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {activeTab === "doctors" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">License</label>
                      <input
                        type="text"
                        value={formData.license}
                        onChange={(e) => setFormData({...formData, license: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                )}
                {activeTab === "staff" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Nurse, Receptionist"
                      required
                    />
                  </div>
                )}
                {activeTab === "pharmacy" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                      <input
                        type="number"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.license}
                        onChange={(e) => setFormData({...formData, license: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Antibiotics, Painkillers"
                        required
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
