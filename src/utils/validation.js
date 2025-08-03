import { VALIDATION, ERROR_MESSAGES } from '../constants';

/**
 * Validation utility functions
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error: string, strength: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD, strength: 'none' };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PASSWORD, strength: 'weak' };
  }
  
  // Check password strength
  let strength = 'weak';
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return { isValid: true, error: null, strength };
};

/**
 * Validates name format
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (name.length < VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long` };
  }
  
  if (name.length > VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters long` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!VALIDATION.PHONE_REGEX.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates file upload
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed file types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateFile = (file, allowedTypes = [], maxSize = null) => {
  if (!file) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE };
  }
  
  if (maxSize && file.size > maxSize) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates form data
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = ERROR_MESSAGES.REQUIRED_FIELD;
      isValid = false;
      return;
    }
    
    if (value && rule.type) {
      let validation;
      
      switch (rule.type) {
        case 'email':
          validation = validateEmail(value);
          break;
        case 'password':
          validation = validatePassword(value);
          break;
        case 'name':
          validation = validateName(value);
          break;
        case 'phone':
          validation = validatePhone(value);
          break;
        default:
          validation = { isValid: true, error: null };
      }
      
      if (!validation.isValid) {
        errors[field] = validation.error;
        isValid = false;
      }
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `Must be at least ${rule.minLength} characters long`;
      isValid = false;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Must be less than ${rule.maxLength} characters long`;
      isValid = false;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || 'Invalid format';
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

/**
 * Sanitizes input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates date format and range
 * @param {string} date - Date string to validate
 * @param {string} format - Expected date format
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  // Check if date is not in the future (for birth dates, etc.)
  if (dateObj > new Date()) {
    return { isValid: false, error: 'Date cannot be in the future' };
  }
  
  return { isValid: true, error: null };
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateFile,
  validateForm,
  sanitizeInput,
  validateDate,
};
