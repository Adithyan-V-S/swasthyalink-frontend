/**
 * Security Utilities
 * Functions for input sanitization, validation, and security measures
 */

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return input.replace(/[&<>"'`=/]/g, (s) => map[s]);
};

/**
 * Validates and sanitizes user input
 * @param {string} input - Input to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, sanitized: string, errors: array }
 */
export const validateAndSanitizeInput = (input, options = {}) => {
  const {
    maxLength = 1000,
    minLength = 0,
    allowHTML = false,
    allowSpecialChars = true,
    required = false
  } = options;
  
  const errors = [];
  
  // Check if required
  if (required && (!input || input.trim() === '')) {
    errors.push('This field is required');
    return { isValid: false, sanitized: '', errors };
  }
  
  // If empty and not required, return early
  if (!input || input.trim() === '') {
    return { isValid: true, sanitized: '', errors: [] };
  }
  
  // Check length
  if (input.length < minLength) {
    errors.push(`Must be at least ${minLength} characters long`);
  }
  
  if (input.length > maxLength) {
    errors.push(`Must be less than ${maxLength} characters long`);
  }
  
  // Sanitize input
  let sanitized = input.trim();
  
  if (!allowHTML) {
    sanitized = sanitizeHTML(sanitized);
  }
  
  if (!allowSpecialChars) {
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'%;()&+]/g, '');
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

/**
 * Validates file uploads for security
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, errors: array }
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }
  
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
    errors.push('File extension not allowed');
  }
  
  // Check for potentially dangerous file names
  const dangerousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i,
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('File type not allowed for security reasons');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates a secure random token
 * @param {number} length - Token length
 * @returns {string} - Random token
 */
export const generateSecureToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Validates URL to prevent open redirect attacks
 * @param {string} url - URL to validate
 * @param {array} allowedDomains - Allowed domains
 * @returns {boolean} - True if URL is safe
 */
export const validateURL = (url, allowedDomains = []) => {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check domain if allowedDomains is provided
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a string contains potentially malicious content
 * @param {string} input - Input to check
 * @returns {boolean} - True if potentially malicious
 */
export const containsMaliciousContent = (input) => {
  if (typeof input !== 'string') return false;
  
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiting utility for client-side protection
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  
  /**
   * Check if action is allowed
   * @param {string} key - Unique identifier (e.g., IP, user ID)
   * @returns {boolean} - True if allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Update attempts
    this.attempts.set(key, validAttempts);
    
    return validAttempts.length < this.maxAttempts;
  }
  
  /**
   * Record an attempt
   * @param {string} key - Unique identifier
   */
  recordAttempt(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    userAttempts.push(now);
    this.attempts.set(key, userAttempts);
  }
  
  /**
   * Reset attempts for a key
   * @param {string} key - Unique identifier
   */
  reset(key) {
    this.attempts.delete(key);
  }
}

/**
 * Content Security Policy helper
 * @returns {string} - CSP header value
 */
export const getCSPHeader = () => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.firebase.com https://*.firebaseio.com https://securetoken.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  /**
   * Set item with optional encryption
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {boolean} encrypt - Whether to encrypt (basic obfuscation)
   */
  setItem: (key, value, encrypt = false) => {
    try {
      let dataToStore = JSON.stringify(value);
      
      if (encrypt) {
        // Basic obfuscation (not real encryption)
        dataToStore = btoa(dataToStore);
      }
      
      localStorage.setItem(key, dataToStore);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },
  
  /**
   * Get item with optional decryption
   * @param {string} key - Storage key
   * @param {boolean} decrypt - Whether to decrypt
   * @returns {any} - Stored value or null
   */
  getItem: (key, decrypt = false) => {
    try {
      let data = localStorage.getItem(key);
      
      if (!data) return null;
      
      if (decrypt) {
        // Basic deobfuscation
        data = atob(data);
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  /**
   * Remove item
   * @param {string} key - Storage key
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  }
};

export default {
  sanitizeHTML,
  validateAndSanitizeInput,
  validateFileUpload,
  generateSecureToken,
  validateURL,
  containsMaliciousContent,
  RateLimiter,
  getCSPHeader,
  secureStorage
};
