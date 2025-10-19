import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/firebaseProfileService";
import { getFamilyNetwork } from "../services/firebaseFamilyService";
import { motion } from "framer-motion";

// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,10}$/; // Allow up to 11 digits total (including country code)
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 150;
};

// Validate date of birth (must be before 2007)
const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return true; // Allow empty for now
  const birthYear = new Date(dateOfBirth).getFullYear();
  return birthYear < 2007;
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age.toString() : '';
};

const validateBloodGroup = (bloodGroup) => {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bloodGroup.toUpperCase());
};

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [error, setError] = useState("");
  
  // Enhanced state for editing and validation
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Real-time validation function
  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          errors.phone = 'Please enter a valid phone number (up to 11 digits)';
        } else {
          delete errors.phone;
        }
        break;
      case 'age':
        if (value && !validateAge(value)) {
          errors.age = 'Please enter a valid age (0-150)';
        } else {
          delete errors.age;
        }
        break;
      case 'bloodGroup':
        if (value && !validateBloodGroup(value)) {
          errors.bloodGroup = 'Please enter a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)';
        } else {
          delete errors.bloodGroup;
        }
        break;
      case 'displayName':
        if (value && value.trim().length < 2) {
          errors.displayName = 'Name must be at least 2 characters long';
        } else {
          delete errors.displayName;
        }
        break;
      case 'dateOfBirth':
        if (value && !validateDateOfBirth(value)) {
          errors.dateOfBirth = 'Date of birth must be before 2007';
        } else {
          delete errors.dateOfBirth;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate age when date of birth changes
    if (field === 'dateOfBirth' && value) {
      const calculatedAge = calculateAge(value);
      setEditData(prev => ({ ...prev, age: calculatedAge }));
    }
    
    validateField(field, value);
  };

  // Start editing mode
  const startEditing = () => {
    setEditData({ ...profileData });
    setValidationErrors({});
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditData({});
    setValidationErrors({});
    setIsEditing(false);
  };

  // Save profile changes
  const saveProfile = async () => {
    // Validate all fields before saving
    const fieldsToValidate = ['displayName', 'email', 'phone', 'age', 'bloodGroup', 'dateOfBirth'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (editData[field] !== undefined) {
        if (!validateField(field, editData[field])) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      setError('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Here you would typically call an API to save the profile
      // For now, we'll just update the local state
      setProfileData({ ...profileData, ...editData });
      setIsEditing(false);
      setEditData({});
      setValidationErrors({});
      setError('');
    } catch (error) {
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
      const response = await getUserProfile(currentUser.uid);
      if (response.success) {
        setProfileData(response.data);
      } else {
          // Use mock data in emergency mode
          const mockProfileData = {
            displayName: currentUser.displayName || 'Adithyan V.s',
            email: currentUser.email || 'vsadithyan215@gmail.com',
            phone: '9895415643',
            age: '22',
            gender: 'male',
            bloodGroup: 'O+',
            emergencyContact: '46453424',
            address: 'Kangazha, Kerala, India',
            medicalHistory: 'No significant medical history',
            photoURL: null,
            dateOfBirth: '2002-01-15',
            height: '175 cm',
            weight: '70 kg',
            allergies: 'None',
            medications: 'None',
            emergencyContactName: 'Parent',
            emergencyContactRelation: 'Father'
          };
          setProfileData(mockProfileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError("Failed to load profile data.");
      }
      setLoadingProfile(false);
    };

    const fetchFamily = async () => {
      setLoadingFamily(true);
      try {
        const members = await getFamilyNetwork(currentUser.uid);
        setFamilyMembers(members || []);
      } catch (error) {
        setError("Failed to load family members.");
        console.error("Error loading family members:", error);
        // Use mock family data in emergency mode
        const mockFamily = [
          {
            id: 'mock-1',
            name: '04_ADITHYAN V S INT MCA',
            relationship: 'Child',
            email: 'adithyanvs2026@mca.ajce.in',
            accessLevel: 'limited',
            isEmergencyContact: false
          }
        ];
        setFamilyMembers(mockFamily);
      }
      setLoadingFamily(false);
    };

    fetchProfile();
    fetchFamily();
  }, [currentUser]);

  if (loadingProfile || loadingFamily) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-[60vh] text-lg text-gray-600"
      >
        Loading profile...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-600 text-center p-4 bg-red-100 rounded-md max-w-xl mx-auto"
      >
        {error}
      </motion.div>
    );
  }

  if (!profileData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 p-6"
      >
        No profile data found.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-xl border border-gray-200"
    >
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold border-b-4 border-indigo-600 pb-5 text-indigo-700 drop-shadow-md">
        Profile
      </h1>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={isSaving || Object.keys(validationErrors).length > 0}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'personal', label: 'Personal Info', icon: '👤' },
          { id: 'medical', label: 'Medical Info', icon: '🏥' },
          { id: 'emergency', label: 'Emergency', icon: '🚨' },
          { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Content */}
      <div className="space-y-8">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 rounded-xl p-8"
          >
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
              {/* Profile Photo */}
              <div className="relative">
        <div className="w-44 h-44 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-indigo-300">
          {profileData.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-xl">No Photo</span>
          )}
        </div>
                {isEditing && (
                  <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Personal Details */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editData.displayName || ''}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            validationErrors.displayName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {validationErrors.displayName && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.displayName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.displayName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          value={editData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            validationErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your email"
                        />
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="tel"
                          value={editData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your phone number (up to 11 digits)"
                          maxLength="10"
                        />
                        {validationErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Enter up to 10 digits (including country code)</p>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.phone || "N/A"}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="number"
                          value={editData.age || ''}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            validationErrors.age ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Auto-calculated from date of birth"
                          min="0"
                          max="150"
                          readOnly={editData.dateOfBirth ? true : false}
                        />
                        {validationErrors.age && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.age}</p>
                        )}
                        {editData.dateOfBirth && (
                          <p className="text-xs text-blue-600 mt-1">Auto-calculated from date of birth</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.age || "N/A"}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    {isEditing ? (
                      <select
                        value={editData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg text-gray-900 capitalize">{profileData.gender || "N/A"}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="date"
                          value={editData.dateOfBirth || ''}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                          max="2006-12-31"
                        />
                        {validationErrors.dateOfBirth && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Must be before 2007</p>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.dateOfBirth || "N/A"}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    {isEditing ? (
                      <textarea
                        value={editData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.address || "N/A"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Medical Information Tab */}
        {activeTab === 'medical' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                {isEditing ? (
                  <div>
                    <select
                      value={editData.bloodGroup || ''}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        validationErrors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {validationErrors.bloodGroup && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.bloodGroup}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-gray-900">{profileData.bloodGroup || "N/A"}</p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 175 cm"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.height || "N/A"}</p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 70 kg"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.weight || "N/A"}</p>
                )}
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.allergies || ''}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="List any allergies"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.allergies || "None"}</p>
                )}
              </div>

              {/* Current Medications */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.medications || ''}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="List current medications"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.medications || "None"}</p>
                )}
              </div>

              {/* Medical History */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                {isEditing ? (
                  <textarea
                    value={editData.medicalHistory || ''}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="4"
                    placeholder="Describe your medical history"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.medicalHistory || "No significant medical history"}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency Information Tab */}
        {activeTab === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Emergency Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.emergencyContactName || ''}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter emergency contact name"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.emergencyContactName || "N/A"}</p>
                )}
              </div>

              {/* Emergency Contact Relation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.emergencyContactRelation || ''}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Father, Mother, Spouse"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profileData.emergencyContactRelation || "N/A"}</p>
                )}
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      value={editData.emergencyContact || ''}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        validationErrors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter emergency contact phone"
                    />
                    {validationErrors.emergencyContact && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.emergencyContact}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-gray-900">{profileData.emergencyContact || "N/A"}</p>
                )}
              </div>

              {/* Emergency Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Email</label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={editData.emergencyContactEmail || ''}
                      onChange={(e) => handleInputChange('emergencyContactEmail', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        validationErrors.emergencyContactEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter emergency contact email"
                    />
                    {validationErrors.emergencyContactEmail && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.emergencyContactEmail}</p>
                    )}
          </div>
                ) : (
                  <p className="text-lg text-gray-900">{profileData.emergencyContactEmail || "N/A"}</p>
                )}
        </div>
      </div>
          </motion.div>
        )}

        {/* Family Members Tab */}
        {activeTab === 'family' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Family Members</h3>
      {familyMembers.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                className="text-gray-600 text-center py-8"
        >
          No family members found.
        </motion.p>
      ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyMembers.map((member, index) => (
                  <motion.div
                    key={member.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {(member.name || member.displayName || 'F').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name || member.displayName || "N/A"}</h4>
                        <p className="text-sm text-gray-500">{member.relationship || "N/A"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {member.email || "N/A"}</p>
                      <p><span className="font-medium">Access Level:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          member.accessLevel === 'full' ? 'bg-green-100 text-green-800' :
                          member.accessLevel === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {member.accessLevel || "N/A"}
                        </span>
                      </p>
                      <p><span className="font-medium">Emergency Contact:</span> 
                        <span className={`ml-2 ${member.isEmergencyContact ? 'text-green-600' : 'text-gray-500'}`}>
                          {member.isEmergencyContact ? "Yes" : "No"}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
