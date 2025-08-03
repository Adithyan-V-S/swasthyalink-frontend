// Authentication Guard Utility
// Provides helper functions for route protection and user access control

/**
 * Check if user can access a specific route based on authentication and role
 * @param {boolean} isAuthenticated - Whether user is logged in
 * @param {boolean} isEmailVerified - Whether user's email is verified
 * @param {string} userRole - User's role (admin, doctor, patient)
 * @param {string} requiredRole - Required role for the route (optional)
 * @returns {boolean} - Whether user can access the route
 */
export const canAccessRoute = (isAuthenticated, isEmailVerified, userRole, requiredRole = null) => {
  // Must be authenticated
  if (!isAuthenticated) return false;
  
  // Must have verified email (except for preset admin)
  if (!isEmailVerified) return false;
  
  // If specific role is required, check it
  if (requiredRole) {
    // Special handling for family dashboard - patients can access it
    if (requiredRole === 'family' && userRole === 'patient') {
      return true;
    }
    if (userRole !== requiredRole) return false;
  }
  
  return true;
};

/**
 * Get redirect path based on user role
 * @param {string} userRole - User's role
 * @returns {string} - Redirect path
 */
export const getRedirectPath = (userRole) => {
  switch (userRole) {
    case 'admin':
      return '/admindashboard';
    case 'doctor':
      return '/doctordashboard';
    case 'patient':
      return '/patientdashboard';
    default:
      return '/';
  }
};

/**
 * Check if route is public (no authentication required)
 * @param {string} pathname - Current route path
 * @returns {boolean} - Whether route is public
 */
export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/', '/about', '/login', '/register'];
  return publicRoutes.includes(pathname);
};

/**
 * Check if route is authentication-only (login/register)
 * @param {string} pathname - Current route path
 * @returns {boolean} - Whether route is auth-only
 */
export const isAuthRoute = (pathname) => {
  const authRoutes = ['/login', '/register'];
  return authRoutes.includes(pathname);
};

/**
 * Check if route requires specific role
 * @param {string} pathname - Current route path
 * @returns {string|null} - Required role or null
 */
export const getRequiredRole = (pathname) => {
  const roleRoutes = {
    '/admindashboard': 'admin',
    '/doctordashboard': 'doctor',
    '/patientdashboard': 'patient',
    '/familydashboard': 'family' // Patients can access this
  };
  
  return roleRoutes[pathname] || null;
};

/**
 * Validate user permissions for a specific action
 * @param {string} userRole - User's role
 * @param {string} action - Action to perform
 * @param {object} resource - Resource being accessed
 * @returns {boolean} - Whether user can perform the action
 */
export const canPerformAction = (userRole, action, resource = null) => {
  // Admin can do everything
  if (userRole === 'admin') return true;
  
  // Role-based permissions
  const permissions = {
    doctor: {
      view_patients: true,
      edit_patients: true,
      view_records: true,
      edit_records: true,
      schedule_appointments: true
    },
    patient: {
      view_own_records: true,
      edit_own_profile: true,
      schedule_appointments: true,
      view_family_access: true,
      manage_family_members: true,
      view_family_records: true
    }
  };
  
  const rolePermissions = permissions[userRole] || {};
  return rolePermissions[action] || false;
}; 