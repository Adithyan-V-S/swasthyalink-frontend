/**
 * Set up test doctor user for development
 * This creates a proper test user that works with the doctor dashboard
 */

// Set up test doctor user in localStorage
const testDoctor = {
  uid: 'test-doctor-uid-1758810279159',
  email: 'doctor1758810279159@swasthyalink.com',
  displayName: 'Dr. Test Doctor',
  emailVerified: true,
  role: 'doctor',
  specialization: 'General Medicine',
  name: 'Dr. Test Doctor'
};

// Store in localStorage
localStorage.setItem('testUser', JSON.stringify(testDoctor));
localStorage.setItem('testUserRole', 'doctor');

console.log('✅ Test doctor user created:');
console.log('Email:', testDoctor.email);
console.log('Name:', testDoctor.name);
console.log('Role:', testDoctor.role);
console.log('Specialization:', testDoctor.specialization);
console.log('\n🔄 Please refresh the page to use the new test user.');
console.log('📋 You can now access the doctor dashboard with full functionality.');










