// Image paths for the Swasthyalink application
export const IMAGES = {
  // Hero and main images
  HERO_HEALTHCARE: '/src/assets/images/hero-healthcare.jpg',
  
  // Feature icons
  SECURITY_ICON: '/src/assets/images/security-icon.svg',
  FAMILY_ICON: '/src/assets/images/family-icon.svg',
  QR_ICON: '/src/assets/images/qr-icon.svg',
  
  // Placeholder images
  PLACEHOLDER: '/src/assets/images/placeholder.jpg',
  
  // Logo and branding
  LOGO: '/src/assets/images/logo.svg',
  
  // Dashboard images
  DASHBOARD_BG: '/src/assets/images/dashboard-bg.jpg',
  
  // Medical related images
  DOCTOR_AVATAR: '/src/assets/images/doctor-avatar.jpg',
  PATIENT_AVATAR: '/src/assets/images/patient-avatar.jpg',
  FAMILY_AVATAR: '/src/assets/images/family-avatar.jpg',
  
  // UI elements
  WAVES_BG: '/src/assets/images/waves-bg.svg',
  PATTERN_BG: '/src/assets/images/pattern-bg.svg',
};

// Alternative image URLs for development/testing
export const EXTERNAL_IMAGES = {
  HERO_HEALTHCARE: 'https://www.scubadiving.com/sites/default/files/styles/655_1x_/public/scuba/import/2014/files/_images/201402/heinrichswinner.jpeg?itok=wEs8pEcs',
  DOCTOR_AVATAR: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
  PATIENT_AVATAR: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  FAMILY_AVATAR: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop',
};

// Image optimization settings
export const IMAGE_SETTINGS = {
  HERO: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp'
  },
  AVATAR: {
    width: 200,
    height: 200,
    quality: 80,
    format: 'webp'
  },
  THUMBNAIL: {
    width: 150,
    height: 150,
    quality: 75,
    format: 'webp'
  }
}; 