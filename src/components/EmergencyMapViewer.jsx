import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getRoute, getCurrentLocation } from '../services/locationSharingService';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Emergency Map Viewer Component
 * Displays emergency locations and routes on an interactive map
 */
const EmergencyMapViewer = ({ emergencyLocations, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentUserLocation();
  }, []);

  useEffect(() => {
    if (selectedLocation && currentLocation) {
      calculateRoute();
    }
  }, [selectedLocation, currentLocation]);

  const getCurrentUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.warn('Could not get current location:', error);
    }
  };

  const calculateRoute = async () => {
    if (!selectedLocation || !currentLocation) return;

    setIsLoadingRoute(true);
    setRouteError('');

    try {
      const routeData = await getRoute(currentLocation, selectedLocation.location);
      
      if (routeData.success) {
        setRoute(routeData);
      } else {
        setRouteError(routeData.error || 'Could not calculate route');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setRouteError('Failed to calculate route');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Custom icons
  const emergencyIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#dc2626" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="8"/>
        <text x="12.5" y="17" text-anchor="middle" fill="#dc2626" font-family="Arial" font-size="12" font-weight="bold">!</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#3b82f6" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="8"/>
        <text x="12.5" y="17" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="10" font-weight="bold">U</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  if (!emergencyLocations || emergencyLocations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <span className="material-icons text-6xl">location_off</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Emergency Locations</h3>
        <p className="text-gray-600">
          No active emergency locations are currently being shared.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-icons">emergency</span>
            <h2 className="text-lg font-bold">Emergency Locations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 relative">
        <MapContainer
          center={emergencyLocations[0]?.location ? [emergencyLocations[0].location.lat, emergencyLocations[0].location.lng] : [0, 0]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Emergency Location Markers */}
          {emergencyLocations.map((location) => (
            <Marker
              key={location.id}
              position={[location.location.lat, location.location.lng]}
              icon={emergencyIcon}
              eventHandlers={{
                click: () => handleLocationSelect(location)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-red-600 mb-2">Emergency Location</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Type:</strong> {location.emergencyType}
                  </p>
                  {location.message && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Message:</strong> {location.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Address:</strong> {location.location.address || 'Address not available'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Shared: {new Date(location.sharedAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleLocationSelect(location)}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Current User Location Marker */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-blue-600 mb-2">Your Location</h3>
                  <p className="text-sm text-gray-600">
                    {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {route && route.coordinates && (
            <Polyline
              positions={route.coordinates}
              color="#dc2626"
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* Route Information */}
      {selectedLocation && (
        <div className="p-4 bg-gray-50 border-t">
          <h3 className="font-semibold text-gray-800 mb-3">Route Information</h3>
          
          {isLoadingRoute ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span>Calculating route...</span>
            </div>
          ) : routeError ? (
            <div className="text-red-600 text-sm">
              <span className="material-icons text-sm mr-1">error</span>
              {routeError}
            </div>
          ) : route ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Distance:</span>
                <span className="ml-2 font-medium">{formatDistance(route.distance)}</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-medium">{formatDuration(route.duration)}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm">
              Click "Get Directions" on a marker to calculate route
            </div>
          )}
        </div>
      )}

      {/* Emergency Locations List */}
      <div className="p-4 border-t">
        <h3 className="font-semibold text-gray-800 mb-3">Active Emergency Locations</h3>
        <div className="space-y-2">
          {emergencyLocations.map((location) => (
            <div
              key={location.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedLocation?.id === location.id
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleLocationSelect(location)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 capitalize">
                    {location.emergencyType} Emergency
                  </p>
                  <p className="text-sm text-gray-600">
                    {location.location.address || 'Address not available'}
                  </p>
                  {location.message && (
                    <p className="text-sm text-gray-500 mt-1">"{location.message}"</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {new Date(location.sharedAt).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-red-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyMapViewer;
