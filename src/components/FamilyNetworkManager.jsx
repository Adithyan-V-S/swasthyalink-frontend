import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getFamilyNetwork
} from '../services/familyService';
import Button from './common/Button';

const FamilyNetworkManager = ({ onUpdate }) => {
  const { currentUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  
  // Form state for editing
  const [accessLevel, setAccessLevel] = useState('limited');
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);

  useEffect(() => {
    loadFamilyNetwork();
    
    // Refresh the network every 5 seconds to ensure it's up to date
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing family network");
      loadFamilyNetwork();
    }, 5000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const loadFamilyNetwork = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log("Loading family network for user:", currentUser.email, "UID:", currentUser.uid);
      const response = await getFamilyNetwork(currentUser.uid);
      
      if (response.success) {
        console.log("Family network loaded:", response.network);
        
        // Check if we have members
        if (response.network && response.network.members && response.network.members.length > 0) {
          console.log(`Found ${response.network.members.length} family members`);
          setFamilyMembers(response.network.members);
        } else {
          console.log("No family members found in network");
          setFamilyMembers([]);
        }
      } else {
        throw new Error(response.error || 'Failed to load network');
      }
    } catch (error) {
      console.error('Error loading family network:', error);
      setError('Failed to load family network. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    if (!confirm(`Are you sure you want to disable this family member? This will hide them from your view but preserve all data for security purposes.`)) {
      return;
    }

    setProcessingId(memberEmail);
    
    try {
      // Call the soft delete function
      const result = await removeFamilyMember(currentUser.uid, memberEmail);
      
      if (result.success) {
        // Update local state to remove from view
        setFamilyMembers(prev => prev.filter(member => member.email !== memberEmail));
        
        // Notify parent component
        if (onUpdate) onUpdate();
        
        alert("Family member disabled successfully. Data preserved for security.");
        console.log('✅ Family member disabled successfully (data preserved)');
      } else {
        throw new Error(result.error || 'Failed to disable family member');
      }
      
    } catch (error) {
      console.error('Error disabling family member:', error);
      setError('Failed to disable family member. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setAccessLevel(member.accessLevel || 'limited');
    setIsEmergencyContact(member.isEmergencyContact || false);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    setProcessingId(editingMember.email);
    
    try {
      // For now, just update the UI without actually updating Firestore
      // We'll implement this functionality later
      
      // Update local state
      setFamilyMembers(prev => 
        prev.map(member => 
          member.email === editingMember.email 
            ? { 
                ...member, 
                accessLevel, 
                isEmergencyContact,
                updatedAt: new Date().toISOString()
              } 
            : member
        )
      );
      
      // Reset editing state
      setEditingMember(null);
      
      // Notify parent component
      if (onUpdate) onUpdate();
      
      // Show a message that this is just UI update
      alert("This is a UI-only update. Changes will be reset on refresh until we implement the full functionality.");
      
    } catch (error) {
      console.error('Error updating family member:', error);
      setError('Failed to update family member. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getAccessLevelLabel = (level) => {
    switch (level) {
      case 'full': return 'Full Access';
      case 'limited': return 'Limited Access';
      case 'emergency': return 'Emergency Only';
      default: return 'Limited Access';
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          onClick={loadFamilyNetwork} 
          className="mt-2"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (familyMembers.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <div className="text-gray-400 mb-3">
          <span className="material-icons text-4xl">people</span>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Family Members Yet</h3>
        <p className="text-gray-600 mb-4">
          Add family members to share your health information and enable emergency access.
        </p>
        <button 
          onClick={loadFamilyNetwork}
          disabled={loading}
          className={`mt-2 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            loading 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white`}
        >
          {loading && <span className="material-icons animate-spin text-sm">sync</span>}
          <span>{loading ? 'Refreshing...' : 'Refresh Network'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Your Family Network
        </h3>
        <button
          onClick={loadFamilyNetwork}
          disabled={loading}
          className={`flex items-center space-x-1 ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'} transition-colors`}
        >
          <span className={`material-icons text-sm ${loading ? 'animate-spin' : ''}`}>
            {loading ? 'sync' : 'refresh'}
          </span>
          <span>{loading ? 'Refreshing...' : 'Refresh Network'}</span>
        </button>
      </div>
      
      {familyMembers.map(member => (
        <div 
          key={member.email} 
          className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
        >
          {editingMember?.email === member.email ? (
            // Edit mode
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {member.name}
                </h4>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <div className="space-y-2">
                  {['full', 'limited', 'emergency'].map(level => (
                    <div 
                      key={level}
                      className={`p-3 border rounded-lg cursor-pointer ${
                        accessLevel === level 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setAccessLevel(level)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={accessLevel === level}
                          onChange={() => setAccessLevel(level)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900">
                            {getAccessLevelLabel(level)}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {level === 'full' && 'Can view all health records and information'}
                            {level === 'limited' && 'Can view basic health records and emergency information'}
                            {level === 'emergency' && 'Can only access critical information during emergencies'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`emergency-${member.email}`}
                  checked={isEmergencyContact}
                  onChange={() => setIsEmergencyContact(!isEmergencyContact)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor={`emergency-${member.email}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  Emergency Contact
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  loading={processingId === member.email}
                  disabled={processingId !== null}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            // View mode
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {member.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {member.relationship}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.email}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 text-xs rounded-full mb-1 ${getAccessLevelColor(member.accessLevel)}`}>
                    {getAccessLevelLabel(member.accessLevel)}
                  </span>
                  {member.isEmergencyContact && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Emergency Contact
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    try {
                      localStorage.setItem('startChatMember', JSON.stringify({ uid: member.uid, email: member.email }));
                      // Navigate to chat tab if the UI supports it; otherwise, user can open Chat manually
                      alert('Opening chat... Go to the Family Chat tab to start messaging.');
                    } catch (e) {
                      console.error('Failed to store startChat target', e);
                    }
                  }}
                  disabled={!member.uid}
                >
                  Start Chat
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditMember(member)}
                  disabled={processingId !== null}
                >
                  Edit Access
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveMember(member.email)}
                  loading={processingId === member.email}
                  disabled={processingId !== null}
                >
                  Disable
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FamilyNetworkManager;