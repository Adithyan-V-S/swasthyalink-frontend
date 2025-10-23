import React, { useState, useEffect } from 'react';
import { 
  getCurrentLocation, 
  getAddressFromCoordinates, 
  shareEmergencyLocation 
} from '../services/locationSharingService';

/**
 * Emergency Location Modal Component
 * Handles location sharing during emergency situations
 */
const EmergencyLocationModal = ({ isOpen, onClose, onLocationShared, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('medical');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestLocationPermission();
    }
  }, [isOpen]);

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('📍 Requesting location permission...');
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      
      // Get address from coordinates
      const locationAddress = await getAddressFromCoordinates(
        currentLocation.lat, 
        currentLocation.lng
      );
      setAddress(locationAddress);
      setPermissionGranted(true);
      
      console.log('✅ Location permission granted');
    } catch (err) {
      console.error('❌ Location permission denied:', err);
      setError('Location access is required for emergency sharing. Please enable location services and try again.');
      setPermissionGranted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = async () => {
    if (!location) {
      setError('Location not available. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('🚨 Sharing emergency location...');
      
      const locationData = {
        ...location,
        address: address
      };

      const result = await shareEmergencyLocation(
        userId, 
        locationData, 
        emergencyType, 
        message
      );

      if (result.success) {
        console.log('✅ Emergency location shared successfully');
        onLocationShared(result);
        onClose();
      } else {
        throw new Error(result.error || 'Failed to share location');
      }
    } catch (err) {
      console.error('❌ Error sharing location:', err);
      setError(`Failed to share location: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLocation(null);
    setAddress('');
    setMessage('');
    setError('');
    setPermissionGranted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="material-icons text-2xl">emergency</span>
              <h2 className="text-xl font-bold">Emergency Location Sharing</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className={`material-icons ${permissionGranted ? 'text-green-600' : 'text-red-600'}`}>
                {permissionGranted ? 'location_on' : 'location_off'}
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  {permissionGranted ? 'Location Access Granted' : 'Location Access Required'}
                </p>
                <p className="text-sm text-gray-600">
                  {permissionGranted 
                    ? 'Your location will be shared with family members' 
                    : 'Please enable location services to share your location'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          {location && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Location Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="font-mono text-blue-700">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="text-blue-700">
                    ±{Math.round(location.accuracy)}m
                  </span>
                </div>
                {address && (
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="text-blue-700 font-medium">{address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Type
            </label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="medical">Medical Emergency</option>
              <option value="accident">Accident</option>
              <option value="safety">Safety Concern</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Emergency Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the emergency situation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-red-600">error</span>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShareLocation}
              disabled={!permissionGranted || isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-sm">share_location</span>
                  <span>Share Location</span>
                </>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="material-icons text-yellow-600 text-sm">info</span>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Privacy Notice:</p>
                <p>Your location will be shared with your family members for 24 hours. You can stop sharing at any time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyLocationModal;

