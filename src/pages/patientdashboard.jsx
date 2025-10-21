import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { auth } from "../firebaseConfig";
import SnakeGame from "./SnakeGame";
import heroImage from "../assets/images/hero-healthcare.jpg";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToNotifications } from "../services/notificationService";
import { db } from "../firebaseConfig";
import { onSnapshot, doc, getDoc } from "firebase/firestore";
import { getPendingRequests, acceptRequest, getConnectedDoctors, resendRequest } from "../services/patientDoctorService";
import { subscribeToPatientPrescriptions, formatDate, isTestUser } from "../utils/firebaseUtils";

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

// Safely format various date representations (Firestore Timestamp, Date, ISO string, ms number)
const formatDateSafe = (value) => {
  if (!value) return 'N/A';
  try {
    const dateObj = value?.toDate?.() ?? value;
    const asDate = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
    if (typeof asDate?.toLocaleDateString === 'function' && !isNaN(asDate)) {
      return asDate.toLocaleDateString();
    }
  } catch (_) {}
  return 'N/A';
};

// Derive a user object from Firebase auth when available; fall back to demo values
const useCurrentUser = () => {
  const { currentUser } = useAuth();
  const displayName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "John Doe";
  const email = currentUser?.email || "john.doe@example.com";
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=64`;
  return { name: displayName, email, avatar };
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

const PatientDashboard = () => {
  const [uid, setUid] = useState("");
  const { currentUser } = useAuth();
  const currentUserInfo = useCurrentUser();
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showEmergencyAccess, setShowEmergencyAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: "",
    relationship: "",
    email: "",
    phone: "",
    accessLevel: "limited",
    isEmergencyContact: false
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connectedDoctors, setConnectedDoctors] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [otp, setOtp] = useState("");
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [showTestNotification, setShowTestNotification] = useState(false);
  const [realOTP, setRealOTP] = useState(null);

  // Move getSidebarLinks inside component to access notifications state
  const getSidebarLinks = () => [
    { label: "Dashboard", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
      ) },
    { label: "My Records", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) },
    { label: "Family", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      ) },
    { label: "Appointments", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      ), badge: (notifications || []).filter(n => !n.read && n.type === 'appointment').length },
    { label: "Prescriptions", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-6a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
      ), badge: (notifications || []).filter(n => !n.read && n.type === 'health_record').length },
    { label: "Doctors", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7m0 0l-9-5m9 5l9-5" /></svg>
      ), badge: (pendingRequests || []).length },
    { label: "Settings", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
      ) },
    { label: "Profile", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      ) },
    { label: "Game", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6h13M9 6l-7 7 7 7" /></svg>
      ) },
  ];

  const helpSupportLink = { label: "Help & Support", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10a4 4 0 11-8 0 4 4 0 018 0zm0 0v4m0 4h.01" /></svg>
  )};

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check for notification redirect tab
  useEffect(() => {
    const checkNotificationRedirect = () => {
      const redirectTab = localStorage.getItem('patientDashboardTab');
      if (redirectTab) {
        console.log('🔔 Notification redirect detected:', redirectTab);
        
        // Map tab names to indices
        const tabMap = {
          'doctors': 5,
          'prescriptions': 4,
          'dashboard': 0,
          'family': 2,
          'appointments': 3,
          'settings': 6,
          'profile': 7,
          'game': 8
        };
        
        const tabIndex = tabMap[redirectTab];
        if (tabIndex !== undefined) {
          console.log('📍 Redirecting to tab index:', tabIndex);
          setActiveIdx(tabIndex);
        }
        
        // Clear the redirect flag
        localStorage.removeItem('patientDashboardTab');
      }
    };

    // Check immediately and after a short delay to ensure component is mounted
    checkNotificationRedirect();
    const timeoutId = setTimeout(checkNotificationRedirect, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // EMERGENCY MODE: Use mock notifications to prevent Firestore quota usage
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    console.log('🚨 EMERGENCY MODE: Using mock notifications to prevent Firestore quota usage');
    
    // Use mock notifications instead of Firestore
    const mockNotifications = [
      {
        id: 'mock-notification-1',
        type: 'doctor_connection_request',
        title: 'New Doctor Request',
        message: 'Dr. Sarah Johnson wants to connect with you',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'mock-notification-2',
        type: 'prescription_received',
        title: 'New Prescription',
        message: 'You have received a new prescription from Dr. Michael Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false
      },
      {
        id: 'mock-notification-3',
        type: 'appointment_reminder',
        title: 'Appointment Reminder',
        message: 'You have an appointment tomorrow at 2:00 PM',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    console.log('📬 Mock notifications loaded:', mockNotifications);
  }, [currentUser]);

  // Load family members from real API
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!currentUser?.uid) {
        setFamilyMembers([]);
        return;
      }
      
      console.log('👥 Loading family members from Firestore for user:', currentUser.uid);
      console.log('👥 Current user object:', currentUser);
      console.log('👥 Current user UID type:', typeof currentUser.uid);
      console.log('👥 Current user UID value:', currentUser.uid);
      
      try {
        const token = await currentUser.getIdToken();
        console.log('🔑 Got Firebase token for family members:', token.substring(0, 20) + '...');
        
        console.log('🔍 About to make API call for family members...');
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://swasthyalink-backend-v2.onrender.com';
        console.log('🌐 Making API call to:', `${API_BASE}/api/family/network?uid=${currentUser.uid}`);
        
        // Add timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE}/api/family/network?uid=${currentUser.uid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 API response status:', response.status);
        console.log('📡 API response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Family members fetched from API:', data);
        
        if (data.success && data.network) {
          console.log('👥 Real family members loaded:', data.network);
          setFamilyMembers(data.network);
        } else {
          console.log('⚠️ No family members found in API response');
          setFamilyMembers([]);
        }
      } catch (error) {
        console.error('❌ Failed to load family members:', error);
        setFamilyMembers([]);
      }
    };
    
    loadFamilyMembers();
  }, [currentUser]);

  // Fetch pending requests and connected doctors
  useEffect(() => {
    const fetchRequestsAndDoctors = async () => {
      if (!currentUser?.uid) {
        console.log('PatientDashboard: No currentUser, skipping requests fetch');
        return;
      }

      // Only use mock data in explicit test mode
      const isTestUserMode = localStorage.getItem('testUser') !== null;
      if (isTestUserMode) {
        console.log('🧪 Test mode: showing demo doctor requests');
        const mockRequests = [
          {
            id: 'mock-request-1',
            doctor: {
              name: 'Dr. John Smith',
              specialization: 'Cardiology',
              email: 'dr.john@example.com'
            },
            connectionMethod: 'email',
            message: 'Dr. John Smith wants to connect with you to provide medical care.',
            createdAt: new Date().toISOString(),
            status: 'pending'
          },
          {
            id: 'mock-request-2',
            doctor: {
              name: 'Dr. Sarah Johnson',
              specialization: 'Dermatology',
              email: 'dr.sarah@example.com'
            },
            connectionMethod: 'email',
            message: 'Dr. Sarah Johnson wants to connect with you for skin care consultation.',
            createdAt: new Date().toISOString(),
            status: 'pending'
          }
        ];
        setPendingRequests(mockRequests);
        setConnectedDoctors([]);
        setRealOTP('123456');
        return;
      }

      try {
        console.log('PatientDashboard: Fetching requests for user:', currentUser.uid);
        setIsLoadingRequests(true);
        const [pendingReqs, connectedDocs] = await Promise.all([
          getPendingRequests(currentUser.uid),
          getConnectedDoctors(currentUser.uid)
        ]);
        
        console.log('PatientDashboard: Pending requests:', pendingReqs);
        console.log('PatientDashboard: Connected doctors:', connectedDocs);
        setPendingRequests(pendingReqs || []);
        // Handle both array and object responses
        if (Array.isArray(connectedDocs)) {
          console.log('PatientDashboard: connectedDocs is array, setting directly');
          setConnectedDoctors(connectedDocs);
        } else if (connectedDocs && connectedDocs.doctors) {
          console.log('PatientDashboard: connectedDocs is object, extracting doctors array');
          setConnectedDoctors(connectedDocs.doctors);
        } else {
          console.log('PatientDashboard: connectedDocs is invalid, setting empty array');
          setConnectedDoctors([]);
        }
        
        // Log success message
        console.log('PatientDashboard: Successfully loaded requests and doctors data');
        
        // Show notification if there are pending requests
        if (pendingReqs && pendingReqs.length > 0) {
          console.log('PatientDashboard: Found pending requests, showing notification');
          // You can add a notification here if needed
        }
      } catch (error) {
        console.error('Error fetching requests and doctors:', error);
        // Do not inject mock data on API failure in live mode; just show empty state
        setPendingRequests([]);
        setConnectedDoctors([]);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchRequestsAndDoctors();
  }, [currentUser]);

  // EMERGENCY MODE: Use comprehensive mock prescriptions in chat message format
  useEffect(() => {
    if (!currentUser?.uid) {
      setPrescriptions([]);
      return;
    }
    
    console.log('🚨 EMERGENCY MODE: Loading mock prescriptions in chat message format');
    
    // Comprehensive mock prescriptions data in chat message format
    const mockPrescriptions = [
      {
        id: 'prescription-1',
        doctorName: "Dr. Sarah Johnson",
        doctorSpecialization: "Cardiologist",
        doctorAvatar: "https://ui-avatars.com/api/?name=Dr+Sarah+Johnson&background=4f46e5&color=fff&size=48",
        medication: "Amlodipine 5mg",
        dosage: "1 tablet daily",
        frequency: "Once daily",
        instructions: "Take with water in the morning",
        notes: "Monitor blood pressure regularly. Next follow-up in 2 weeks.",
        prescribedDate: "2024-01-15",
        prescribedTime: "10:30 AM",
        createdAt: new Date('2024-01-15T10:30:00'),
        status: "Active",
        duration: "30 days",
        refills: 2
      },
      {
        id: 'prescription-2',
        doctorName: "Dr. Michael Chen",
        doctorSpecialization: "Endocrinologist",
        doctorAvatar: "https://ui-avatars.com/api/?name=Dr+Michael+Chen&background=10b981&color=fff&size=48",
        medication: "Metformin 500mg",
        dosage: "2 tablets daily",
        frequency: "Twice daily",
        instructions: "Take with meals to reduce stomach upset",
        notes: "Monitor blood sugar levels. Check HbA1c in 3 months.",
        prescribedDate: "2024-01-12",
        prescribedTime: "2:15 PM",
        createdAt: new Date('2024-01-12T14:15:00'),
        status: "Active",
        duration: "90 days",
        refills: 1
      },
      {
        id: 'prescription-3',
        doctorName: "Dr. Emily Rodriguez",
        doctorSpecialization: "Dermatologist",
        doctorAvatar: "https://ui-avatars.com/api/?name=Dr+Emily+Rodriguez&background=f59e0b&color=fff&size=48",
        medication: "Clobetasol Cream 0.05%",
        dosage: "Apply thin layer",
        frequency: "Twice daily",
        instructions: "Apply to affected areas only. Avoid contact with eyes.",
        notes: "Use for 2 weeks only. If no improvement, contact clinic.",
        prescribedDate: "2024-01-10",
        prescribedTime: "11:45 AM",
        createdAt: new Date('2024-01-10T11:45:00'),
        status: "Completed",
        duration: "14 days",
        refills: 0
      },
      {
        id: 'prescription-4',
        doctorName: "Dr. James Wilson",
        doctorSpecialization: "Orthopedist",
        doctorAvatar: "https://ui-avatars.com/api/?name=Dr+James+Wilson&background=ef4444&color=fff&size=48",
        medication: "Ibuprofen 400mg",
        dosage: "1 tablet",
        frequency: "Every 6-8 hours as needed",
        instructions: "Take with food to prevent stomach irritation",
        notes: "For pain management. Discontinue if side effects occur.",
        prescribedDate: "2024-01-08",
        prescribedTime: "3:20 PM",
        createdAt: new Date('2024-01-08T15:20:00'),
        status: "Active",
        duration: "7 days",
        refills: 0
      },
      {
        id: 'prescription-5',
        doctorName: "Dr. Lisa Park",
        doctorSpecialization: "Psychiatrist",
        doctorAvatar: "https://ui-avatars.com/api/?name=Dr+Lisa+Park&background=8b5cf6&color=fff&size=48",
        medication: "Sertraline 50mg",
        dosage: "1 tablet daily",
        frequency: "Once daily",
        instructions: "Take at the same time each day, preferably in the morning",
        notes: "May take 2-4 weeks to see full effect. Regular follow-ups required.",
        prescribedDate: "2024-01-05",
        prescribedTime: "9:00 AM",
        createdAt: new Date('2024-01-05T09:00:00'),
        status: "Active",
        duration: "60 days",
        refills: 3
      },
      {
        id: 'prescription-6',
        doctorName: "Dr. Robert Kim",
        doctorSpecialization: "Gastroenterologist",
        doctorAvatar: "https://ui-avatars.com/api/?name=Dr+Robert+Kim&background=06b6d4&color=fff&size=48",
        medication: "Omeprazole 20mg",
        dosage: "1 capsule daily",
        frequency: "Once daily",
        instructions: "Take 30 minutes before first meal of the day",
        notes: "For acid reflux management. Follow up in 4 weeks.",
        prescribedDate: "2024-01-03",
        prescribedTime: "1:30 PM",
        createdAt: new Date('2024-01-03T13:30:00'),
        status: "Active",
        duration: "30 days",
        refills: 1
      }
    ];
    
    setPrescriptions(mockPrescriptions);
    setPrescriptionsLoading(false);
    console.log('💊 Mock prescriptions loaded:', mockPrescriptions);
  }, [currentUser]);

  const qrValue = uid ? `https://yourapp.com/patient/${uid}` : "";

  const handleAddFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.email) {
      const member = {
        id: Date.now(),
        ...newFamilyMember,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newFamilyMember.name)}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff&size=64`,
        lastAccess: "Never"
      };
      setFamilyMembers(prev => [...(prev || []), member]);
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
      setNotifications(prev => [notification, ...(prev || [])]);
    }
  };

  const handleRemoveFamilyMember = (id) => {
    const member = (familyMembers || []).find(m => m.id === id);
    setFamilyMembers(prev => (prev || []).filter(m => m.id !== id));
    
    // Add notification
    const notification = {
      id: Date.now(),
      type: "family_removed",
      message: `${member?.name || 'Unknown'} was removed from your family members`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      read: false
    };
    setNotifications(prev => [notification, ...(prev || [])]);
  };

  const handleUpdateAccessLevel = (id, newLevel) => {
    setFamilyMembers(prev => (prev || []).map(m => 
      m.id === id ? { ...m, accessLevel: newLevel } : m
    ));
    
    const member = (familyMembers || []).find(m => m.id === id);
    const notification = {
      id: Date.now(),
      type: "access_updated",
      message: `${member?.name || 'Unknown'}'s access level was updated to ${newLevel}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      read: false
    };
    setNotifications(prev => [notification, ...(prev || [])]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => (prev || []).map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMigrateFamilyConnections = async () => {
    try {
      console.log('🔄 Starting family connections migration...');
      const response = await fetch('/api/family/migrate-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Migration completed successfully!');
        console.log(`📊 ${result.updatesCount} connections updated`);
        alert(`Migration completed! ${result.updatesCount} connections updated.`);
        // Refresh the family members
        window.location.reload();
      } else {
        console.error('❌ Migration failed:', result.error);
        alert(`Migration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('💥 Error running migration:', error);
      alert(`Error running migration: ${error.message}`);
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      console.log('✅ Accepting request from:', request.doctor?.name, 'id:', request.id);

      // If backend requires OTP, use entered OTP; otherwise send empty
      try {
        await acceptRequest(request.id, otp || '');
      } catch (apiError) {
        console.warn('acceptRequest API failed, proceeding with optimistic update:', apiError);
      }

      // Optimistically update UI
      setPendingRequests(prev => (prev || []).filter(req => req.id !== request.id));
      setConnectedDoctors(prev => [...(prev || []), {
        id: request.id,
        name: request.doctor?.name,
        specialization: request.doctor?.specialization,
        email: request.doctor?.email,
        connectionDate: new Date().toISOString(),
        lastInteraction: new Date().toISOString()
      }]);

      // Success toast/notification
      const notification = {
        id: Date.now(),
        type: 'doctor_connected',
        message: `Successfully connected with Dr. ${request.doctor?.name || 'Unknown'}!`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        read: false
      };
      setNotifications(prev => [notification, ...(prev || [])]);

      console.log('✅ Doctor connection accepted successfully');

      // Show SweetAlert-style modal with actions
      try {
        const Swal = (await import('sweetalert2')).default;
        await import('sweetalert2/dist/sweetalert2.min.css');
        const result = await Swal.fire({
          title: 'Connected!',
          text: `Now you can view prescriptions from Dr. ${request.doctor?.name || 'Unknown'}.`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'See Prescriptions',
          cancelButtonText: 'Back'
        });
        if (result.isConfirmed) {
          // Prescriptions tab index is 4
          setActiveIdx(4);
        }
      } catch (modalError) {
        console.warn('SweetAlert not available, using native alert:', modalError);
        const go = window.confirm(`Connected!\n\nSee prescriptions now?`);
        if (go) setActiveIdx(4);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      const notification = {
        id: Date.now(),
        type: 'error',
        message: 'Failed to accept doctor request. Please try again.',
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        read: false
      };
      setNotifications(prev => [notification, ...(prev || [])]);
    }
  };

  const handleDeclineRequest = async (request) => {
    try {
      console.log('❌ Declining request from:', request.doctor?.name);
      
      // Remove from pending requests
      setPendingRequests(prev => (prev || []).filter(req => req.id !== request.id));
      
      // Add decline notification
      const notification = {
        id: Date.now(),
        type: "system_alert",
        message: `You declined the connection request from Dr. ${request.doctor?.name}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        read: false
      };
      setNotifications(prev => [notification, ...(prev || [])]);
      
      console.log('❌ Doctor connection declined');
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const renderFamilySection = () => (
    <div className="w-full max-w-6xl space-y-8">
      {/* Family Cleanup Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Fix Duplicate Family Members
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              If you see duplicate family members, click this button to clean them up.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!window.confirm('This will remove duplicate family members. Continue?')) {
                return;
              }
              try {
                const response = await fetch('/api/family/cleanup-duplicates', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                });
                const result = await response.json();
                if (result.success) {
                  alert('✅ Duplicates cleaned up successfully! Please refresh the page.');
                  window.location.reload();
                } else {
                  alert('❌ Failed to cleanup duplicates: ' + result.error);
                }
              } catch (error) {
                alert('❌ Error: ' + error.message);
              }
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Fix Duplicates
          </button>
        </div>
      </div>

      {/* Family Overview */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Family Members</h2>
          <button
            onClick={handleMigrateFamilyConnections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            🔄 Fix Connections
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(familyMembers || []).map((member) => (
            <div key={member.uid || member.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <img 
                  src={member.photoURL || member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Family')}&background=4f46e5&color=fff&size=48`} 
                  alt={member.name} 
                  className="w-12 h-12 rounded-full mr-3" 
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.relationship}</p>
                </div>
              </div>  
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">{member.email}</p>
                <p className="text-sm text-gray-600">{member.phone || 'Not provided'}</p>
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
                <button
                  onClick={() => {
                    // Navigate to family chat
                    console.log('Opening family chat');
                    // Redirect to family chat page
                    window.location.href = '/familydashboard';
                  }}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                >
                  💬 Chat
                </button>
                <select
                  value={member.accessLevel}
                  onChange={(e) => handleUpdateAccessLevel(member.uid || member.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="limited">Limited</option>
                  <option value="full">Full</option>
                  <option value="emergency">Emergency Only</option>
                </select>
                <button
                  onClick={() => handleRemoveFamilyMember(member.uid || member.id)}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Access (hide when no emergency contacts) */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Emergency Access</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Emergency Contacts</h3>
          <div className="space-y-3">
            {(familyMembers || []).filter(m => m.isEmergencyContact).map((member) => (
              <div key={member.uid || member.id || `emergency-${member.email}`} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center">
                  <img src={member.photoURL || member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Family')}&background=ef4444&color=fff&size=32`} alt={member.name} className="w-8 h-8 rounded-full mr-3" />
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
            {(familyMembers || []).filter(m => m.isEmergencyContact).length === 0 && (
              <p className="text-sm text-red-700">No emergency contacts</p>
            )}
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
              {(familyMembers || []).map((member) => (
                <tr key={member.uid || member.id || `table-${member.email}`} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-2 border-b">
                    <div className="flex items-center">
                      <img src={member.photoURL || member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Family')}&background=4f46e5&color=fff&size=32`} alt={member.name} className="w-8 h-8 rounded-full mr-2" />
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
        {(notifications || []).map((notification) => (
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

  const renderPrescriptionsSection = () => (
    <div className="w-full max-w-6xl space-y-8">
      <section className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">My Prescriptions</h2>
          {isTestUser() && (
            <button
              onClick={() => {
                const mockNotification = {
                  id: 'test-notification-' + Date.now(),
                  type: 'doctor_connection_request',
                  title: 'Test Doctor Request',
                  message: 'Dr. Test Doctor wants to connect with you',
                  timestamp: new Date(),
                  read: false
                };
                setNotifications(prev => [mockNotification, ...prev]);
                console.log('Test notification added:', mockNotification);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Test Notification
            </button>
          )}
        </div>
        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Prescriptions Yet</h3>
            <p className="text-gray-500">Your prescriptions will appear here once your doctor writes them.</p>
            <p className="text-sm text-gray-400 mt-2">
              Connect with doctors first, then they can write prescriptions for you.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {/* Doctor Avatar */}
                <img 
                  src={prescription.doctorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prescription.doctorName)}&background=4f46e5&color=fff&size=48`} 
                  alt={prescription.doctorName} 
                  className="w-10 h-10 rounded-full flex-shrink-0" 
                />
                
                {/* Prescription Content */}
                <div className="flex-1 min-w-0">
                  {/* Header with Doctor Info and Timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{prescription.doctorName}</h3>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {prescription.doctorSpecialization}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {prescription.prescribedDate} at {prescription.prescribedTime}
                    </div>
                  </div>
                  
                  {/* Prescription Message */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-lg">{prescription.medication}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                        prescription.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                    
                    {/* Prescription Details */}
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center space-x-4">
                        <span><strong>Dosage:</strong> {prescription.dosage}</span>
                        <span><strong>Frequency:</strong> {prescription.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span><strong>Duration:</strong> {prescription.duration}</span>
                        <span><strong>Refills:</strong> {prescription.refills}</span>
                      </div>
                      
                      {prescription.instructions && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p><strong>Instructions:</strong> {prescription.instructions}</p>
                        </div>
                      )}
                      
                      {prescription.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                          <p><strong>Notes:</strong> {prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderDoctorsSection = () => (
    <div className="w-full max-w-6xl space-y-8">
      {/* Pending Requests */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Pending Doctor Requests</h2>
        {isLoadingRequests ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : (pendingRequests || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending doctor requests</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(pendingRequests || []).map((request) => (
              <div key={request.id} className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <img
                    src={request.doctor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.doctor?.name || 'Doctor')}&background=4f46e5&color=fff&size=64`}
                    alt={request.doctor?.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Dr. {request.doctor?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">{request.doctor?.specialization || 'Specialist'}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{request.doctor?.email || 'N/A'}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 border">Method: {request.connectionMethod || 'email'}</span>
                    {request.otpExpiry && (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Expires: {request.otpExpiry?.toLocaleTimeString?.() || new Date(request.otpExpiry).toLocaleTimeString()}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Requested: {request.createdAt?.toDate?.().toLocaleDateString?.() || new Date(request.createdAt).toLocaleDateString()}</p>
                  {request.message && <p className="text-sm italic text-gray-500">" {request.message} "</p>}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    ❌ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Connected Doctors */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Connected Doctors</h2>
        {(connectedDoctors || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No connected doctors</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(connectedDoctors || []).map((doctor) => (
              <div key={doctor.id} className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <img
                    src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=10b981&color=fff&size=64`}
                    alt={doctor.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Dr. {doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization || 'Specialist'}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{doctor.email}</p>
                  <p className="text-sm text-gray-600">Connected: {formatDateSafe(doctor.connectedAt || doctor.connectionDate)}</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Prescriptions: {doctor.permissions?.prescriptions ? 'Enabled' : 'Disabled'}</span>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderMainContent = () => {
    switch (activeIdx) {
      case 0: // Dashboard
        return (
          <>
            {/* Top hero + KPI + QR layout */}
            <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Hero card */}
              <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Hey, {currentUserInfo.name.split(' ')[0]}!</h1>
                  <p className="mt-2 text-gray-600">Let's monitor your health.</p>
                  <div className="mt-6 flex gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">HRV 84 ms</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm">Cholesterol 166 mg/dl</span>
                    <button
                      onClick={() => {
                        const mockNotification = {
                          id: 'test-notification-' + Date.now(),
                          type: 'doctor_connection_request',
                          title: 'Test Doctor Request',
                          message: 'Dr. Test Doctor wants to connect with you',
                          timestamp: new Date(),
                          read: false
                        };
                        setNotifications(prev => [mockNotification, ...prev]);
                        console.log('Test notification added:', mockNotification);
                      }}
                      className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm hover:bg-green-100"
                    >
                      Test Notification
                    </button>
                  </div>
                </div>
                <img src={heroImage} alt="health" className="hidden md:block w-48 h-48 object-cover rounded-xl" />
              </div>

              {/* Heart Function Efficiency */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Heart Function Efficiency</h3>
                  <button className="text-gray-400">↗</button>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">86%</span>
                    <span className="text-sm text-gray-500">Moderate</span>
                  </div>
                  <div className="mt-3 h-3 bg-gray-100 rounded-full">
                    <div className="h-3 bg-green-400 rounded-full" style={{ width: '86%' }} />
                  </div>
                </div>
              </div>

               {/* Emergency Notifications - Only for test users */}
               {isTestUser() && (
                 <div className="lg:col-span-3 bg-red-50 rounded-2xl shadow-lg p-6 border border-red-200">
                   <div className="flex items-center justify-between">
                     <h3 className="font-semibold text-red-800">Emergency Alerts</h3>
                     <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                       {notifications.filter(n => n.type === 'emergency_alert').length}
                     </span>
                   </div>
                   <div className="mt-4 space-y-2">
                     {notifications.filter(n => n.type === 'emergency_alert').slice(0, 2).map((notification) => (
                       <div key={notification.id} className="bg-white rounded-lg p-3 border border-red-200">
                         <p className="text-sm font-medium text-red-800">{notification.title}</p>
                         <p className="text-xs text-red-600 mt-1">{notification.message}</p>
                       </div>
                     ))}
                     {notifications.filter(n => n.type === 'emergency_alert').length === 0 && (
                       <p className="text-sm text-red-600">No emergency alerts</p>
                     )}
                   </div>
                 </div>
               )}

              {/* Integrated QR card */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <h3 className="font-semibold text-gray-800 mb-3">My Patient QR</h3>
                {uid ? (
                  <>
                    <QRCode value={qrValue} size={140} className="mb-2" />
                    <div className="text-xs text-gray-500 break-all mt-1">UID: {uid}</div>
                    <div className="text-[10px] text-gray-400 break-all">{qrValue}</div>
                  </>
                ) : (
                  <div className="text-gray-400">Loading QR...</div>
                )}
              </div>

              {/* Blood Pressure card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Blood Pressure</h3>
                  <span className="text-sm opacity-80">130/82 mmHg</span>
                </div>
                <div className="mt-4 h-24 w-full bg-white/10 rounded-lg" />
              </div>

              {/* Profile card */}
              <div className="lg:col-span-4 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3">
                  <img src={currentUserInfo.avatar} alt="profile" className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-semibold text-gray-900">{currentUserInfo.name}</div>
                    <div className="text-xs text-gray-500">Diagnosis: Mild Hypertension</div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <button className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2">
                    <span className="text-sm text-gray-700">Heart Rate</span>
                    <span className="text-sm font-semibold text-gray-900">112 bpm ↗</span>
                  </button>
                  <button className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2">
                    <span className="text-sm text-gray-700">Glucose Level</span>
                    <span className="text-sm font-semibold text-gray-900">9.0 mmol/L ↗</span>
                  </button>
                </div>
              </div>

              {/* Medication reminder */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800">Medication Reminder</h3>
                <p className="mt-2 text-sm text-gray-600">Take your antihypertensive medication at 3:00 PM</p>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">Mark Done</button>
                  <button className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Snooze</button>
                </div>
              </div>
            </section>

            {/* Records + Upcoming appointments row */}
            <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* My Medical Records table */}
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-indigo-700 mb-4">My Medical Records</h2>
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
              </div>

              {/* Upcoming appointments mock */}
              <div className="lg:col-span-5 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Upcoming Appointments</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100" />
                    <div>
                      <div className="font-medium text-gray-900">Sophia Bennett</div>
                      <div className="text-xs text-gray-500">Cardiologist</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-700">May 19th, 2025</div>
                    <div className="text-xs text-gray-500">03:30 - 04:00 pm</div>
                  </div>
                </div>
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
        return renderPrescriptionsSection();
      case 5: // Doctors
        return renderDoctorsSection();
      case 6: // Settings
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Settings</h2>
            <div className="text-center text-gray-500">
              <p>Settings coming soon...</p>
            </div>
          </section>
        );
      case 7: // Profile
        return (
          <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Profile</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=4f46e5&color=fff&size=80`} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full" 
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{currentUser?.name || 'User'}</h3>
                    <p className="text-gray-600">{currentUser?.email || 'user@example.com'}</p>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Edit Profile
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-gray-900">{currentUser?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{currentUser?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">Not provided</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="text-gray-900">Not provided</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                      <p className="text-gray-900">Not provided</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies</label>
                      <p className="text-gray-900">None recorded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 8: // Game
        return <SnakeGame />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Emergency Mode Warning Banner */}
      <div className="bg-red-600 text-white p-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Emergency Mode Active:</span>
          <span>Firebase quota exceeded. Using offline data. Some features may be limited.</span>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {getSidebarLinks().map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeIdx === idx ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.icon}
                  <span className="flex-1">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Profile Section at Bottom */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-lg mb-4">
                <img src={currentUserInfo.avatar} alt="profile" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{currentUserInfo.name}</div>
                  <div className="text-xs text-gray-500">Patient</div>
                </div>
                <button 
                  onClick={() => setActiveIdx(7)} // Profile tab index
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                >
                  Edit
                </button>
              </div>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100">
                {helpSupportLink.icon}
                <span>{helpSupportLink.label}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
        {/* Test Notification Button - Only in test mode */}
        {isTestUser() && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                const mockNotification = {
                  id: 'test-notification-' + Date.now(),
                  type: 'doctor_connection_request',
                  title: 'Test Doctor Request',
                  message: 'Dr. Test Doctor wants to connect with you',
                  timestamp: new Date(),
                  read: false
                };
                setNotifications(prev => [mockNotification, ...prev]);
                console.log('Test notification added:', mockNotification);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg"
            >
              🧪 Test Notification
            </button>
          </div>
        )}
            {renderMainContent()}
          </div>
        </div>
      </div>


      {/* Add Family Member Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Family Member</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newFamilyMember.name}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={newFamilyMember.email}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newFamilyMember.phone}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={newFamilyMember.relationship}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={newFamilyMember.accessLevel}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, accessLevel: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="limited">Limited Access</option>
                <option value="full">Full Access</option>
                <option value="emergency">Emergency Only</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newFamilyMember.isEmergencyContact}
                  onChange={(e) => setNewFamilyMember(prev => ({ ...prev, isEmergencyContact: e.target.checked }))}
                  className="mr-2"
                />
                Emergency Contact
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddFamilyMember}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddFamily(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Grant Emergency Access</h3>
            <p className="text-gray-600 mb-6">
              This will grant temporary full access to your medical records for emergency purposes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmergencyAccess(false)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Grant Access
              </button>
              <button
                onClick={() => setShowEmergencyAccess(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PatientDashboard;
