import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getFamilyRequests, 
  acceptFamilyRequest, 
  rejectFamilyRequest 
} from '../services/familyService';
import Button from './common/Button';

const FamilyRequestManager = ({ onUpdate }) => {
  const { currentUser } = useAuth();
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const loadRequests = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log("Loading family requests for user:", currentUser.email);
      const response = await getFamilyRequests(currentUser.email);
      
      if (response.success) {
        console.log("Family requests loaded:", response.requests);
        
        // Filter out any requests that have already been accepted or rejected
        const filteredSent = response.requests.sent.filter(req => {
          console.log(`Sent request ${req.id} status: ${req.status}`);
          return req.status === 'pending';
        });
        
        const filteredReceived = response.requests.received.filter(req => {
          console.log(`Received request ${req.id} status: ${req.status}`);
          return req.status === 'pending';
        });
        
        console.log("Filtered requests - Sent:", filteredSent.length, "Received:", filteredReceived.length);
        
        // Log the filtered requests for debugging
        console.log("Filtered sent requests:", filteredSent);
        console.log("Filtered received requests:", filteredReceived);
        
        setSentRequests(filteredSent);
        setReceivedRequests(filteredReceived);
      } else {
        throw new Error(response.error || 'Failed to load requests');
      }
    } catch (error) {
      console.error('Error loading family requests:', error);
      setError('Failed to load family requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    
    try {
      console.log("Accepting family request:", requestId);
      
      // Immediately remove this request from the UI to prevent multiple clicks
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      
      const response = await acceptFamilyRequest(requestId);
      
      if (response.success) {
        console.log("Family request accepted successfully");
        
        // Update sent requests status
        setSentRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'accepted' } 
              : req
          )
        );
        
        // Notify parent component
        if (onUpdate) onUpdate();
        
        // Force a reload of the family network
        setTimeout(() => {
          loadRequests();
        }, 1000);
        
        // Show success message
        alert("Family request accepted successfully!");
      } else {
        throw new Error(response.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Failed to accept request. Please try again.');
      
      // Reload requests to restore the UI
      loadRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    
    try {
      console.log("Rejecting family request:", requestId);
      
      // Immediately remove this request from the UI to prevent multiple clicks
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      
      const response = await rejectFamilyRequest(requestId);
      
      if (response.success) {
        console.log("Family request rejected successfully");
        
        // Update sent requests status
        setSentRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'rejected' } 
              : req
          )
        );
        
        // Notify parent component
        if (onUpdate) onUpdate();
        
        // Force a reload of the family network
        setTimeout(() => {
          loadRequests();
        }, 1000);
        
        // Show success message
        alert("Family request rejected successfully!");
      } else {
        throw new Error(response.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request. Please try again.');
      
      // Reload requests to restore the UI
      loadRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : timestamp.toDate();
      
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <span className="material-icons text-red-600 mr-2">error</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Button 
          onClick={loadRequests} 
          className="mt-2"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (receivedRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <div className="text-gray-400 mb-3">
          <span className="material-icons text-4xl">mail</span>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Family Requests</h3>
        <p className="text-gray-600 mb-4">
          You don't have any pending family requests at the moment.
        </p>
        <button 
          onClick={loadRequests}
          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh Requests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadRequests}
          className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span className="material-icons text-sm">refresh</span>
          <span>Refresh</span>
        </button>
      </div>
      
      {/* Received Requests */}
      {receivedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Received Requests
          </h3>
          <div className="space-y-3">
            {receivedRequests.map(request => (
              <div 
                key={request.id} 
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.fromName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      wants to add you as their {request.relationship}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAccept(request.id)}
                    loading={processingId === request.id}
                    disabled={processingId !== null}
                    size="sm"
                    className="flex-1"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    loading={processingId === request.id}
                    disabled={processingId !== null}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Sent Requests
          </h3>
          <div className="space-y-3">
            {sentRequests.map(request => (
              <div 
                key={request.id} 
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.toName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      as your {request.relationship}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyRequestManager;