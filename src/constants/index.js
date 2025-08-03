// Application Constants

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  PATIENT_DASHBOARD: '/patientdashboard',
  DOCTOR_DASHBOARD: '/doctordashboard',
  FAMILY_DASHBOARD: '/familydashboard',
  SETTINGS: '/settings',
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  FAMILY_MEMBER: 'family_member',
  ADMIN: 'admin',
};

// Access Levels for Family Members
export const ACCESS_LEVELS = {
  FULL: 'full',
  LIMITED: 'limited',
  EMERGENCY_ONLY: 'emergency_only',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ACCESS_GRANTED: 'access_granted',
  ACCESS_REVOKED: 'access_revoked',
  RECORD_UPDATED: 'record_updated',
  EMERGENCY_ACCESS: 'emergency_access',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  FAMILY_MEMBER_ADDED: 'family_member_added',
};

// Application Settings
export const APP_CONFIG = {
  NAME: 'Swasthyalink',
  VERSION: '1.0.0',
  DESCRIPTION: 'Digital Healthcare Platform',
  SUPPORT_EMAIL: 'support@swasthyalink.com',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
};

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: '256px',
  HEADER_HEIGHT: '64px',
  MOBILE_BREAKPOINT: '768px',
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[\d\s\-\(\)]{10,}$/,
  EMERGENCY_ACCESS_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please check your credentials.',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  REQUIRED_FIELD: 'This field is required.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  UNSUPPORTED_FILE_TYPE: 'File type is not supported.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FAMILY_MEMBER_ADDED: 'Family member added successfully!',
  ACCESS_GRANTED: 'Access granted successfully!',
  RECORD_SAVED: 'Medical record saved successfully!',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'swasthyalink_user_preferences',
  THEME: 'swasthyalink_theme',
  LANGUAGE: 'swasthyalink_language',
  LAST_LOGIN: 'swasthyalink_last_login',
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    DELETE: '/api/users/delete',
  },
  MEDICAL_RECORDS: {
    LIST: '/api/records',
    CREATE: '/api/records',
    UPDATE: '/api/records/:id',
    DELETE: '/api/records/:id',
  },
  FAMILY: {
    LIST: '/api/family',
    ADD: '/api/family',
    UPDATE: '/api/family/:id',
    REMOVE: '/api/family/:id',
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  TIME_ONLY: 'HH:mm',
};

// Theme Colors (for future theme system)
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
  },
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
};

export default {
  ROUTES,
  USER_ROLES,
  ACCESS_LEVELS,
  NOTIFICATION_TYPES,
  APP_CONFIG,
  UI_CONSTANTS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  DATE_FORMATS,
  THEME_COLORS,
};
