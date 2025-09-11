import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFamilyNetwork, getFamilyRequests } from '../services/familyService';

const FamilyStatusIndicator = ({ onStatusClick }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState({
    totalMembers: 0,
    pendingRequests: 0,
    emergencyContacts: 0,
    onlineMembers: 0,
    lastSync: null,
    isLoading: true,
    hasError: false
  });

  useEffect(() => {
    if (currentUser) {
      loadStatus();
      
      // Auto-refresh every 60 seconds
      const interval = setInterval(loadStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadStatus = async () => {
    if (!currentUser) return;
    
    try {
      setStatus(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      // Load family network
      const networkResponse = await getFamilyNetwork(currentUser.uid);
      
      // Load family requests
      const requestsResponse = await getFamilyRequests(currentUser.email);
      
      if (networkResponse.success && requestsResponse.success) {
        const members = networkResponse.network?.members || [];
        const pendingReceived = requestsResponse.requests.received.filter(req => req.status === 'pending');
        
        // Calculate stats
        const emergencyContacts = members.filter(member => member.isEmergencyContact).length;
        const onlineMembers = members.filter(member => getOnlineStatus(member)).length;
        
        setStatus({
          totalMembers: members.length,
          pendingRequests: pendingReceived.length,
          emergencyContacts,
          onlineMembers,
          lastSync: new Date(),
          isLoading: false,
          hasError: false
        });
      } else {
        throw new Error('Failed to load family status');
      }
    } catch (error) {
      console.error('Error loading family status:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        hasError: true
      }));
    }
  };

  const getOnlineStatus = (member) => {
    // Mock online status - in real app, this would come from backend
    return Math.random() > 0.6;
  };

  const formatLastSync = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  const getStatusColor = () => {
    if (status.hasError) return 'text-red-600';
    if (status.pendingRequests > 0) return 'text-yellow-600';
    if (status.totalMembers === 0) return 'text-gray-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (status.isLoading) return 'sync';
    if (status.hasError) return 'error';
    if (status.pendingRequests > 0) return 'pending';
    if (status.totalMembers === 0) return 'people_outline';
    return 'people';
  };

  const getStatusMessage = () => {
    if (status.hasError) return 'Connection error';
    if (status.isLoading) return 'Syncing...';
    if (status.totalMembers === 0) return 'No family members';
    if (status.pendingRequests > 0) return `${status.pendingRequests} pending request${status.pendingRequests > 1 ? 's' : ''}`;
    return 'All connected';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Family Status</h3>
        <button
          onClick={loadStatus}
          disabled={status.isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          title="Refresh status"
        >
          <span className={`material-icons text-sm ${status.isLoading ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>
      </div>

      {/* Main Status */}
      <div className="flex items-center mb-6">
        <div className={`p-3 rounded-full ${status.hasError ? 'bg-red-100' : status.pendingRequests > 0 ? 'bg-yellow-100' : 'bg-green-100'} mr-4`}>
          <span className={`material-icons ${getStatusColor()} ${status.isLoading ? 'animate-pulse' : ''}`}>
            {getStatusIcon()}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{getStatusMessage()}</p>
          <p className="text-sm text-gray-600">Last sync: {formatLastSync(status.lastSync)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => onStatusClick && onStatusClick('members')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{status.totalMembers}</p>
              <p className="text-sm text-blue-700">Members</p>
            </div>
            <span className="material-icons text-blue-500">people</span>
          </div>
        </div>

        <div 
          className="bg-yellow-50 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => onStatusClick && onStatusClick('requests')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{status.pendingRequests}</p>
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
            <span className="material-icons text-yellow-500">pending</span>
          </div>
        </div>

        <div 
          className="bg-red-50 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => onStatusClick && onStatusClick('emergency')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{status.emergencyContacts}</p>
              <p className="text-sm text-red-700">Emergency</p>
            </div>
            <span className="material-icons text-red-500">emergency</span>
          </div>
        </div>

        <div 
          className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => onStatusClick && onStatusClick('online')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{status.onlineMembers}</p>
              <p className="text-sm text-green-700">Online</p>
            </div>
            <span className="material-icons text-green-500">radio_button_checked</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onStatusClick && onStatusClick('add_member')}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <span className="material-icons text-sm mr-1">person_add</span>
            Add Member
          </button>
          <button
            onClick={() => onStatusClick && onStatusClick('view_network')}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <span className="material-icons text-sm mr-1">hub</span>
            View Network
          </button>
        </div>
      </div>

      {/* Error State */}
      {status.hasError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="material-icons text-red-600 mr-2">error</span>
            <div>
              <p className="text-sm font-medium text-red-800">Connection Error</p>
              <p className="text-xs text-red-600">Unable to sync family status</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyStatusIndicator;