// Test utility to verify credential generation logic

export const testCredentialGeneration = () => {
  console.log("🧪 Testing credential generation logic...");
  
  // Test case 1: Known timestamp
  const testTimestamp = 175880755605;
  const expectedEmail = `doctor${testTimestamp}@swasthyalink.com`;
  const expectedPassword = `Doc${testTimestamp.toString().slice(-6)}!`;
  
  console.log("📧 Test Case 1:");
  console.log("  Timestamp:", testTimestamp);
  console.log("  Expected Email:", expectedEmail);
  console.log("  Expected Password:", expectedPassword);
  console.log("  Last 6 digits:", testTimestamp.toString().slice(-6));
  
  // Test case 2: Current timestamp
  const currentTimestamp = Date.now();
  const currentEmail = `doctor${currentTimestamp}@swasthyalink.com`;
  const currentPassword = `Doc${currentTimestamp.toString().slice(-6)}!`;
  
  console.log("📧 Test Case 2 (Current):");
  console.log("  Timestamp:", currentTimestamp);
  console.log("  Email:", currentEmail);
  console.log("  Password:", currentPassword);
  console.log("  Last 6 digits:", currentTimestamp.toString().slice(-6));
  
  return {
    testCase1: {
      timestamp: testTimestamp,
      email: expectedEmail,
      password: expectedPassword
    },
    testCase2: {
      timestamp: currentTimestamp,
      email: currentEmail,
      password: currentPassword
    }
  };
};

export const validateCredentials = (email, password) => {
  console.log("🔍 Validating credentials:", { email, password });

  // Extract timestamp from email - handle both auto-generated and manual emails
  const emailMatch = email.match(/doctor(\d+)@swasthyalink\.com/);
  if (!emailMatch) {
    // Handle manual emails that don't follow the pattern
    console.log("❌ Email doesn't follow auto-generated pattern:", email);
    return {
      valid: false,
      reason: "Email doesn't follow auto-generated pattern",
      expectedPassword: "N/A - Manual email",
      providedPassword: password,
      timestamp: "N/A"
    };
  }

  const timestamp = emailMatch[1];
  // Fix: Remove the exclamation mark from the expected password format
  const expectedPassword = `Doc${timestamp.slice(-6)}`;

  console.log("🔧 Validation details:");
  console.log("  Extracted timestamp:", timestamp);
  console.log("  Last 6 digits:", timestamp.slice(-6));
  console.log("  Expected password:", expectedPassword);
  console.log("  Provided password:", password);
  console.log("  Match:", password === expectedPassword);

  return {
    valid: password === expectedPassword,
    expectedPassword,
    providedPassword: password,
    timestamp,
    reason: password === expectedPassword ? "Valid" : "Password mismatch"
  };
};

export const fixStoredDoctors = () => {
  console.log("🔧 Fixing stored doctor credentials...");

  const mockDoctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
  console.log("📋 Found", mockDoctors.length, "doctors in storage");

  let fixedCount = 0;
  const fixedDoctors = mockDoctors.map(doctor => {
    const validation = validateCredentials(doctor.email, doctor.password);

    // Only fix if it's an auto-generated email and password is wrong
    if (!validation.valid && validation.expectedPassword !== "N/A - Manual email") {
      console.log(`🔧 Fixing doctor: ${doctor.name}`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  Old password: ${doctor.password}`);
      console.log(`  New password: ${validation.expectedPassword}`);

      fixedCount++;
      return {
        ...doctor,
        password: validation.expectedPassword
      };
    }

    if (validation.expectedPassword === "N/A - Manual email") {
      console.log(`⏭️ Skipping manual email: ${doctor.email} (${doctor.name})`);
    }

    return doctor;
  });

  if (fixedCount > 0) {
    localStorage.setItem('mockDoctors', JSON.stringify(fixedDoctors));
    window.dispatchEvent(new CustomEvent('mockDoctorsUpdated'));
    console.log(`✅ Fixed ${fixedCount} doctor credentials`);
  } else {
    console.log("✅ All doctor credentials are already correct");
  }

  return { fixedCount, totalDoctors: mockDoctors.length };
};

// Auto-run tests when this module is imported
if (typeof window !== 'undefined') {
  console.log("🚀 Credential test utility loaded");
  
  // Make functions available globally for debugging
  window.credentialTest = {
    test: testCredentialGeneration,
    validate: validateCredentials,
    fix: fixStoredDoctors
  };
}
