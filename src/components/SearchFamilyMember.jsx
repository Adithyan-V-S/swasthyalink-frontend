import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { searchUsers, sendFamilyRequest, getFamilyRequests, acceptFamilyRequest, rejectFamilyRequest, getMutualFamilyNetwork } from '../services/familyService';
import Button from './common/Button';
import Input from './common/Input';

const SearchFamilyMember = ({ onClose, onFamilyUpdate }) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [relationship, setRelationship] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mutualFamily, setMutualFamily] = useState(null);

  const relationships = [
    'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 
    'Grandchild', 'Uncle', 'Aunt', 'Cousin', 'Friend', 'Caregiver'
  ];

  useEffect(() => {
    loadFamilyRequests();
  }, []);

  const loadFamilyRequests = async () => {
    if (!currentUser?.email) return;
    
    try {
      const response = await getFamilyRequests(currentUser.email);
      if (response.success) {
        setSentRequests(response.sent);
        setReceivedRequests(response.received);
      }
    } catch (error) {
      console.error('Error loading family requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(searchQuery);
      if (response.success) {
        // Filter out current user and existing family members
        const filteredResults = response.results.filter(user => 
          user.email !== currentUser?.email
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser || !relationship) return;

    setIsLoading(true);
    try {
      const response = await sendFamilyRequest({
        fromEmail: currentUser.email,
        toEmail: selectedUser.email,
        toName: selectedUser.name,
        relationship
      });

      if (response.success) {
        setSelectedUser(null);
        setRelationship('');
        setSearchQuery('');
        setSearchResults([]);
        await loadFamilyRequests();
        onFamilyUpdate();
      }
    } catch (error) {
      console.error('Error sending family request:', error);
      alert('Failed to send family request: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, fromEmail, toEmail) => {
    try {
      const response = await acceptFamilyRequest(requestId);
      if (response.success) {
        await loadFamilyRequests();
        onFamilyUpdate();
        // Fetch mutual family network after acceptance
        if (fromEmail && toEmail) {
          const mutualResponse = await getMutualFamilyNetwork(fromEmail, toEmail);
          if (mutualResponse.success) {
            setMutualFamily(mutualResponse);
          }
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await rejectFamilyRequest(requestId);
      if (response.success) {
        await loadFamilyRequests();
        onFamilyUpdate();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (e.target.value.length === 0) {
      setSearchResults([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Search & Add Family Members</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Search Users</h3>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                leftIcon={<span className="material-icons text-gray-400">search</span>}
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Search Results</h4>
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.email}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.email === user.email
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{user.name}</h5>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                      {selectedUser?.email === user.email && (
                        <span className="material-icons text-indigo-600">check_circle</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship to {selectedUser.name}
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select relationship</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                  
                  <Button
                    onClick={handleSendRequest}
                    loading={isLoading}
                    disabled={!relationship}
                    className="mt-3 w-full"
                  >
                    Send Family Request
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pending Requests */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Received Requests */}
            {receivedRequests.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Received Requests</h4>
                <div className="space-y-3">
                  {receivedRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">{request.toName || request.fromEmail}</h5>
                          <p className="text-sm text-gray-600">wants to add you as {request.relationship}</p>
                          <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pending
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id, request.fromEmail, request.toEmail)}
                          className="flex-1"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRejectRequest(request.id)}
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
                <h4 className="text-md font-semibold text-gray-700 mb-3">Sent Requests</h4>
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{request.toName || request.toEmail}</h5>
                          <p className="text-sm text-gray-600">as {request.relationship}</p>
                          <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mutual Family Network Display */}
          {mutualFamily && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50">
              <h4 className="text-lg font-semibold mb-3">Mutual Family Network</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium">Your Family</h5>
                  <ul className="list-disc list-inside">
                    {mutualFamily.user1.family.map(member => (
                      <li key={member.email}>
                        {member.name} ({member.relationship})
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">Family of {mutualFamily.user2.email}</h5>
                  <ul className="list-disc list-inside">
                    {mutualFamily.user2.family.map(member => (
                      <li key={member.email}>
                        {member.name} ({member.relationship})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {searchResults.length === 0 && receivedRequests.length === 0 && sentRequests.length === 0 && !mutualFamily && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <span className="material-icons text-4xl">search</span>
              </div>
              <p className="text-gray-600">Search for family members by email or name</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFamilyMember;
