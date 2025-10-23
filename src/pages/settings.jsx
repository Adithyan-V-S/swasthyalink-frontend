import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../services/firebaseProfileService";
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  validateAge, 
  validateGender, 
  validateBloodGroup, 
  validateEmergencyContact, 
  validateAddress, 
  validateMedicalHistory,
  validatePassword,
  validateConfirmPassword,
  validateProfileData 
} from "../utils/validation";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    address: '',
    medicalHistory: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setPhotoPreview(user.photoURL);

        // Load profile data from Firestore
        const response = await getUserProfile(user.uid);
        if (response.success) {
          setProfileData(prev => ({
            ...prev,
            ...response.data,
            displayName: user.displayName || response.data.displayName || '',
            email: user.email || response.data.email || ''
          }));
        } else {
          // If no profile found, initialize with auth data
          setProfileData(prev => ({
            ...prev,
            displayName: user.displayName || '',
            email: user.email || ''
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Validation function for individual fields
  const validateField = (fieldName, value) => {
    let validation;
    switch (fieldName) {
      case 'displayName':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'phone':
        validation = validatePhone(value);
        break;
      case 'age':
        validation = validateAge(value);
        break;
      case 'gender':
        validation = validateGender(value);
        break;
      case 'bloodGroup':
        validation = validateBloodGroup(value);
        break;
      case 'emergencyContact':
        validation = validateEmergencyContact(value);
        break;
      case 'address':
        validation = validateAddress(value);
        break;
      case 'medicalHistory':
        validation = validateMedicalHistory(value);
        break;
      default:
        return { isValid: true, message: '' };
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? '' : validation.message
    }));
    
    return validation;
  };

  // Real-time validation handler
  const handleFieldChange = (fieldName, value) => {
    setProfileData(prev => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate all fields before saving
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setError('Please fix the validation errors before saving');
      return;
    }

    setLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      // Update profile in Firebase Auth
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: photoPreview
      });

      // Update profile in Firestore
      const profileToSave = {
        ...profileData,
        email: user.email // ensure email is consistent
      };
      const response = await updateUserProfile(user.uid, profileToSave);
      if (!response.success) {
        throw new Error(response.error || 'Failed to save profile data');
      }

      // Save theme locally
      localStorage.setItem('theme', theme);

      alert('Profile updated successfully!');
    } catch (error) {
      setError(error.message);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced save function to reduce Firestore writes
  const debouncedSave = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // 2 second debounce
    setDebounceTimer(timer);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');

    // Validate new password
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      setPasswordLoading(false);
      return;
    }

    // Validate password confirmation
    const confirmValidation = validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword);
    if (!confirmValidation.isValid) {
      setPasswordError(confirmValidation.message);
      setPasswordLoading(false);
      return;
    }

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before changing your password';
      }
      
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {/* Floating Health Icons */}
          <div className="absolute top-10 left-10 animate-bounce">
            <svg className="w-8 h-8 text-blue-400 opacity-30" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute top-20 right-20 animate-pulse">
            <svg className="w-6 h-6 text-green-400 opacity-40" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute bottom-20 left-1/4 animate-spin-slow">
            <svg className="w-10 h-10 text-purple-400 opacity-25" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute bottom-10 right-1/3 animate-bounce">
            <svg className="w-7 h-7 text-red-400 opacity-35" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-7xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-indigo-600 to-blue-600'} p-6 text-white`}>
            <h1 className="text-3xl font-bold text-center">Account Settings</h1>
            <p className="text-center opacity-90 mt-2">Manage your profile and preferences</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Profile Photo Section */}
              <div className="xl:col-span-1">
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-6`}>
                  <h3 className="text-xl font-semibold mb-4 text-center">Profile Photo</h3>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-400 shadow-lg">
                        {photoPreview ? (
                          <img 
                            src={photoPreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center`}>
                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Click the camera icon to upload a new photo
                    </p>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-6 mt-6`}>
                  <h3 className="text-xl font-semibold mb-4">Theme</h3>
                  <div className="flex items-center justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-6 mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Password & Security</h3>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                      }`}
                    >
                      {showPasswordChange ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            const newPassword = e.target.value;
                            setPasswordData({...passwordData, newPassword});
                            // Real-time validation
                            const validation = validatePassword(newPassword);
                            if (!validation.isValid) {
                              setPasswordError(validation.message);
                            } else if (passwordData.confirmPassword && newPassword !== passwordData.confirmPassword) {
                              setPasswordError('Passwords do not match');
                            } else {
                              setPasswordError('');
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            passwordError && passwordData.newPassword
                              ? 'border-red-500 focus:ring-red-400'
                              : theme === 'dark' 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300'
                          }`}
                          placeholder="Enter new password (8+ characters)"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            const confirmPassword = e.target.value;
                            setPasswordData({...passwordData, confirmPassword});
                            // Real-time validation
                            const validation = validateConfirmPassword(passwordData.newPassword, confirmPassword);
                            if (!validation.isValid) {
                              setPasswordError(validation.message);
                            } else {
                              setPasswordError('');
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            passwordError && passwordData.confirmPassword
                              ? 'border-red-500 focus:ring-red-400'
                              : theme === 'dark' 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      {passwordError && (
                        <div className="text-red-500 text-sm">{passwordError}</div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordChange(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                            setPasswordError('');
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-gray-600 hover:bg-gray-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                            passwordLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="xl:col-span-3">
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-6`}>
                  <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => handleFieldChange('displayName', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.displayName 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                        required
                      />
                      {validationErrors.displayName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.displayName}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${
                          theme === 'dark' 
                            ? 'bg-gray-600 border-gray-500 text-gray-400' 
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.phone 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Age
                      </label>
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleFieldChange('age', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.age 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter age"
                        min="0"
                        max="150"
                      />
                      {validationErrors.age && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.age}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gender
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.gender 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {validationErrors.gender && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.gender}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Blood Group
                      </label>
                      <select
                        value={profileData.bloodGroup}
                        onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.bloodGroup 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
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

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={profileData.emergencyContact}
                        onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.emergencyContact 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter emergency contact number"
                      />
                      {validationErrors.emergencyContact && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.emergencyContact}</p>
                      )}
                    </div>

                    <div className="md:col-span-2 xl:col-span-3">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Address
                      </label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        rows="3"
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.address 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter your address"
                        maxLength="200"
                      />
                      {validationErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                      )}
                    </div>

                    <div className="md:col-span-2 xl:col-span-3">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Medical History
                      </label>
                      <textarea
                        value={profileData.medicalHistory}
                        onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                        rows="4"
                        placeholder="Any allergies, chronic conditions, or important medical information..."
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          validationErrors.medicalHistory 
                            ? 'border-red-500 focus:ring-red-400' 
                            : theme === 'dark' 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                        }`}
                        maxLength="1000"
                      />
                      {validationErrors.medicalHistory && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.medicalHistory}</p>
                      )}
                    </div>
                  </div>

                  {/* Validation Error Summary */}
                  {Object.keys(validationErrors).some(key => validationErrors[key]) && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Please fix the following errors:
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(validationErrors).map(([field, error]) => 
                                error && <li key={field}>{error}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={loading || Object.keys(validationErrors).some(key => validationErrors[key])}
                      className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                        loading || Object.keys(validationErrors).some(key => validationErrors[key])
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
