import { 
  createChatMessageNotification,
  createFamilyRequestNotification,
  createEmergencyAlertNotification 
} from '../services/notificationService';

// Test function to create sample notifications
export const createTestNotifications = async (currentUser) => {
  if (!currentUser) {
    console.error('No current user provided');
    return;
  }

  try {
    console.log('Creating test notifications for user:', currentUser.uid);

    // Create a test chat notification
    const chatResult = await createChatMessageNotification(
      currentUser.uid,
      {
        uid: 'test-sender-123',
        name: 'Test Family Member',
        email: 'family@test.com'
      },
      'Hey! This is a test message to check notifications.',
      'test-conversation-123'
    );

    console.log('Chat notification result:', chatResult);

    // Create a test family request notification
    const familyResult = await createFamilyRequestNotification(
      currentUser.uid,
      {
        uid: 'test-requester-456',
        name: 'John Doe',
        email: 'john@test.com'
      },
      'son'
    );

    console.log('Family request notification result:', familyResult);

    // Create a test emergency notification
    const emergencyResult = await createEmergencyAlertNotification(
      currentUser.uid,
      {
        uid: 'test-emergency-789',
        name: 'Emergency Contact',
        email: 'emergency@test.com'
      },
      'This is a test emergency alert - please respond!'
    );

    console.log('Emergency notification result:', emergencyResult);

    return {
      chat: chatResult,
      family: familyResult,
      emergency: emergencyResult
    };

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return { error: error.message };
  }
};

// Function to clear test notifications (for cleanup)
export const clearTestNotifications = async () => {
  console.log('Test notification cleanup would go here');
  // This would require a cleanup function in the notification service
};