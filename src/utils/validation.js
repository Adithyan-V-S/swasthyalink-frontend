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

// Admin Dashboard Validation Functions

// Specialization validation
export const validateSpecialization = (specialization) => {
  if (!specialization || specialization.trim().length === 0) {
    return { isValid: false, message: 'Specialization is required' };
  }
  if (specialization.trim().length < 2) {
    return { isValid: false, message: 'Specialization must be at least 2 characters long' };
  }
  if (specialization.trim().length > 50) {
    return { isValid: false, message: 'Specialization must be less than 50 characters' };
  }
  return { isValid: true, message: '' };
};

// License validation
export const validateLicense = (license) => {
  if (!license || license.trim().length === 0) {
    return { isValid: false, message: 'License number is required' };
  }
  if (license.trim().length < 3) {
    return { isValid: false, message: 'License number must be at least 3 characters long' };
  }
  if (license.trim().length > 20) {
    return { isValid: false, message: 'License number must be less than 20 characters' };
  }
  // Check for valid license format (alphanumeric with some special characters)
  const licenseRegex = /^[A-Za-z0-9\-_]+$/;
  if (!licenseRegex.test(license.trim())) {
    return { isValid: false, message: 'License number can only contain letters, numbers, hyphens, and underscores' };
  }
  return { isValid: true, message: '' };
};

// Role validation (for staff)
export const validateRole = (role) => {
  if (!role || role.trim().length === 0) {
    return { isValid: false, message: 'Role is required' };
  }
  if (role.trim().length < 2) {
    return { isValid: false, message: 'Role must be at least 2 characters long' };
  }
  if (role.trim().length > 30) {
    return { isValid: false, message: 'Role must be less than 30 characters' };
  }
  return { isValid: true, message: '' };
};

// Quantity validation (for pharmacy)
export const validateQuantity = (quantity) => {
  if (!quantity || quantity.toString().trim().length === 0) {
    return { isValid: false, message: 'Quantity is required' };
  }
  const quantityNum = parseInt(quantity);
  if (isNaN(quantityNum)) {
    return { isValid: false, message: 'Quantity must be a valid number' };
  }
  if (quantityNum < 0) {
    return { isValid: false, message: 'Quantity must be 0 or greater' };
  }
  if (quantityNum > 10000) {
    return { isValid: false, message: 'Quantity must be less than 10,000' };
  }
  return { isValid: true, message: '' };
};

// Price validation (for pharmacy)
export const validatePrice = (price) => {
  if (!price || price.toString().trim().length === 0) {
    return { isValid: false, message: 'Price is required' };
  }
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) {
    return { isValid: false, message: 'Price must be a valid number' };
  }
  if (priceNum < 0) {
    return { isValid: false, message: 'Price must be 0 or greater' };
  }
  if (priceNum > 100000) {
    return { isValid: false, message: 'Price must be less than $100,000' };
  }
  return { isValid: true, message: '' };
};

// Category validation (for pharmacy)
export const validateCategory = (category) => {
  if (!category || category.trim().length === 0) {
    return { isValid: false, message: 'Category is required' };
  }
  if (category.trim().length < 2) {
    return { isValid: false, message: 'Category must be at least 2 characters long' };
  }
  if (category.trim().length > 30) {
    return { isValid: false, message: 'Category must be less than 30 characters' };
  }
  return { isValid: true, message: '' };
};

// Validate doctor form data
export const validateDoctorData = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }

  // Validate email (optional for auto-generation)
  if (formData.email && formData.email.trim()) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
      isValid = false;
    }
  }

  // Validate password (optional for auto-generation)
  if (formData.password && formData.password.trim()) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
      isValid = false;
    }
  }

  // Validate specialization
  const specializationValidation = validateSpecialization(formData.specialization);
  if (!specializationValidation.isValid) {
    errors.specialization = specializationValidation.message;
    isValid = false;
  }

  // Validate license
  const licenseValidation = validateLicense(formData.license);
  if (!licenseValidation.isValid) {
    errors.license = licenseValidation.message;
    isValid = false;
  }

  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};

// Validate staff form data
export const validateStaffData = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }

  // Validate role (using specialization field for staff)
  const roleValidation = validateRole(formData.specialization);
  if (!roleValidation.isValid) {
    errors.specialization = roleValidation.message;
    isValid = false;
  }

  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};

// Validate pharmacy form data
export const validatePharmacyData = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }

  // Validate quantity (using specialization field for quantity)
  const quantityValidation = validateQuantity(formData.specialization);
  if (!quantityValidation.isValid) {
    errors.specialization = quantityValidation.message;
    isValid = false;
  }

  // Validate price (using license field for price)
  const priceValidation = validatePrice(formData.license);
  if (!priceValidation.isValid) {
    errors.license = priceValidation.message;
    isValid = false;
  }

  // Validate category (using phone field for category)
  const categoryValidation = validateCategory(formData.phone);
  if (!categoryValidation.isValid) {
    errors.phone = categoryValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};