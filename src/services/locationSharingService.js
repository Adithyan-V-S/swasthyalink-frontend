import { db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

/**
 * Location Sharing Service for Emergency Situations
 * Handles real-time location sharing between family members
 */

// OpenRouteService API key (you'll need to get this from https://openrouteservice.org/)
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || null;

/**
 * Share emergency location with family members
 * @param {string} userId - Current user ID
 * @param {Object} location - Location data {lat, lng, accuracy, timestamp}
 * @param {string} emergencyType - Type of emergency
 * @param {string} message - Emergency message
 * @returns {Promise<Object>} - Result of location sharing
 */
export const shareEmergencyLocation = async (userId, location, emergencyType = 'medical', message = '') => {
  try {
    console.log('🚨 Sharing emergency location:', location);

    const emergencyLocationData = {
      userId,
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || null,
        address: location.address || null
      },
      emergencyType,
      message,
      isActive: true,
      sharedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'active'
    };

    const docRef = await addDoc(collection(db, 'emergencyLocations'), emergencyLocationData);
    
    console.log('✅ Emergency location shared successfully:', docRef.id);
    
    return {
      success: true,
      locationId: docRef.id,
      message: 'Emergency location shared with family members'
    };

  } catch (error) {
    console.error('❌ Error sharing emergency location:', error);
    throw new Error(`Failed to share emergency location: ${error.message}`);
  }
};

/**
 * Get current user's location using Geolocation API
 * @returns {Promise<Object>} - Location data
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        console.log('📍 Current location obtained:', location);
        resolve(location);
      },
      (error) => {
        console.error('❌ Error getting location:', error);
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      options
    );
  });
};

/**
 * Get address from coordinates using reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Address string
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    // Check if API key is available
    if (!ORS_API_KEY || ORS_API_KEY === 'your-api-key-here') {
      console.warn('⚠️ OpenRouteService API key not configured, using coordinates');
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    // Using OpenRouteService for reverse geocoding
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lon=${lng}&point.lat=${lat}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.warn('⚠️ Reverse geocoding failed, using coordinates:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

/**
 * Subscribe to emergency locations for a family
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for location updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToEmergencyLocations = (userId, callback) => {
  try {
    console.log('🔔 Subscribing to emergency locations for user:', userId);
    
    const q = query(
      collection(db, 'emergencyLocations'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('sharedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        locations.push({
          id: doc.id,
          ...data,
          sharedAt: data.sharedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      console.log('📍 Emergency locations updated:', locations.length);
      callback(locations);
    }, (error) => {
      console.error('❌ Error subscribing to emergency locations:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up emergency location subscription:', error);
    return () => {};
  }
};

/**
 * Get route between two points using OpenRouteService
 * @param {Object} start - Start coordinates {lat, lng}
 * @param {Object} end - End coordinates {lat, lng}
 * @returns {Promise<Object>} - Route data
 */
export const getRoute = async (start, end) => {
  try {
    console.log('🗺️ Getting route from', start, 'to', end);
    
    // Check if API key is available
    if (!ORS_API_KEY || ORS_API_KEY === 'your-api-key-here') {
      console.warn('⚠️ OpenRouteService API key not configured, returning fallback route');
      return {
        success: true,
        distance: 0,
        duration: 0,
        coordinates: [[start.lat, start.lng], [end.lat, end.lng]],
        instructions: [],
        fallback: true
      };
    }
    
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
    );
    
    if (!response.ok) {
      throw new Error('Route calculation failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const route = data.features[0];
      return {
        success: true,
        distance: route.properties.summary.distance,
        duration: route.properties.summary.duration,
        coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert to [lat, lng]
        instructions: route.properties.segments?.[0]?.steps || []
      };
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.error('❌ Error getting route:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Stop sharing emergency location
 * @param {string} locationId - Location document ID
 * @returns {Promise<Object>} - Result of stopping location sharing
 */
export const stopEmergencyLocationSharing = async (locationId) => {
  try {
    console.log('🛑 Stopping emergency location sharing:', locationId);
    
    await updateDoc(doc(db, 'emergencyLocations', locationId), {
      isActive: false,
      status: 'stopped',
      stoppedAt: serverTimestamp()
    });
    
    console.log('✅ Emergency location sharing stopped');
    
    return {
      success: true,
      message: 'Emergency location sharing stopped'
    };
  } catch (error) {
    console.error('❌ Error stopping emergency location sharing:', error);
    throw new Error(`Failed to stop location sharing: ${error.message}`);
  }
};

/**
 * Get emergency location history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of emergency locations
 */
export const getEmergencyLocationHistory = async (userId) => {
  try {
    console.log('📚 Getting emergency location history for user:', userId);
    
    const q = query(
      collection(db, 'emergencyLocations'),
      where('userId', '==', userId),
      orderBy('sharedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const locations = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      locations.push({
        id: doc.id,
        ...data,
        sharedAt: data.sharedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    console.log('✅ Found', locations.length, 'emergency locations in history');
    return locations;
  } catch (error) {
    console.error('❌ Error getting emergency location history:', error);
    return [];
  }
};
