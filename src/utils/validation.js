// Validation utility functions for form validation

// Email validation
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true, message: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }
  if (/^\d+$/.test(name.trim())) {
    return { isValid: false, message: 'Name should not be purely numeric' };
  }
  return { isValid: true, message: '' };
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: '' }; // Phone is optional
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  return { isValid: true, message: '' };
};

// Age validation
export const validateAge = (age) => {
  if (!age) return { isValid: true, message: '' }; // Age is optional
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) {
    return { isValid: false, message: 'Age must be a valid number' };
  }
  if (ageNum < 0 || ageNum > 150) {
    return { isValid: false, message: 'Age must be between 0 and 150' };
  }
  return { isValid: true, message: '' };
};

// Gender validation
export const validateGender = (gender) => {
  if (!gender) return { isValid: true, message: '' }; // Gender is optional
  const validGenders = ['male', 'female', 'other'];
  if (!validGenders.includes(gender)) {
    return { isValid: false, message: 'Please select a valid gender' };
  }
  return { isValid: true, message: '' };
};

// Blood group validation
export const validateBloodGroup = (bloodGroup) => {
  if (!bloodGroup) return { isValid: true, message: '' }; // Blood group is optional
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validBloodGroups.includes(bloodGroup)) {
    return { isValid: false, message: 'Please select a valid blood group' };
  }
  return { isValid: true, message: '' };
};

// Emergency contact validation
export const validateEmergencyContact = (contact) => {
  if (!contact) return { isValid: true, message: '' }; // Emergency contact is optional
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(contact)) {
    return { isValid: false, message: 'Please enter a valid emergency contact number' };
  }
  return { isValid: true, message: '' };
};

// Address validation
export const validateAddress = (address) => {
  if (!address) return { isValid: true, message: '' }; // Address is optional
  if (address.trim().length > 200) {
    return { isValid: false, message: 'Address must be less than 200 characters' };
  }
  return { isValid: true, message: '' };
};

// Medical history validation
export const validateMedicalHistory = (history) => {
  if (!history) return { isValid: true, message: '' }; // Medical history is optional
  if (history.trim().length > 1000) {
    return { isValid: false, message: 'Medical history must be less than 1000 characters' };
  }
  return { isValid: true, message: '' };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[A-Za-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true, message: '' };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' };
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  return { isValid: true, message: '' };
};

// Validate all profile data
export const validateProfileData = (profileData) => {
  const errors = {};
  let isValid = true;

  // Validate name
  const nameValidation = validateName(profileData.displayName);
  if (!nameValidation.isValid) {
    errors.displayName = nameValidation.message;
    isValid = false;
  }

  // Validate email
  const emailValidation = validateEmail(profileData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }

  // Validate phone
  const phoneValidation = validatePhone(profileData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
    isValid = false;
  }

  // Validate age
  const ageValidation = validateAge(profileData.age);
  if (!ageValidation.isValid) {
    errors.age = ageValidation.message;
    isValid = false;
  }

  // Validate gender
  const genderValidation = validateGender(profileData.gender);
  if (!genderValidation.isValid) {
    errors.gender = genderValidation.message;
    isValid = false;
  }

  // Validate blood group
  const bloodGroupValidation = validateBloodGroup(profileData.bloodGroup);
  if (!bloodGroupValidation.isValid) {
    errors.bloodGroup = bloodGroupValidation.message;
    isValid = false;
  }

  // Validate emergency contact
  const emergencyContactValidation = validateEmergencyContact(profileData.emergencyContact);
  if (!emergencyContactValidation.isValid) {
    errors.emergencyContact = emergencyContactValidation.message;
    isValid = false;
  }

  // Validate address
  const addressValidation = validateAddress(profileData.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.message;
    isValid = false;
  }

  // Validate medical history
  const medicalHistoryValidation = validateMedicalHistory(profileData.medicalHistory);
  if (!medicalHistoryValidation.isValid) {
    errors.medicalHistory = medicalHistoryValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};