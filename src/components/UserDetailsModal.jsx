import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    status: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setEditData({
        name: user.name || user.displayName || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || '',
        address: user.address || '',
        status: user.status || 'active'
      });
      setIsEditing(false);
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('User ID not found');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user in Firestore
      const userRef = doc(db, 'users', user.id);
      const updateData = {
        ...editData,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      await updateDoc(userRef, updateData);
      
      setSuccess('User updated successfully!');
      setIsEditing(false);
      
      // Notify parent component to refresh data
      if (onUserUpdate) {
        onUserUpdate();
      }

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error updating user:', error);
      setError(`Failed to update user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableUser = async () => {
    if (!user?.id) {
      setError('User ID not found');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${user.isDisabled ? 'enable' : 'disable'} this user?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', user.id);
      const updateData = {
        isDisabled: !user.isDisabled,
        disabledAt: user.isDisabled ? null : new Date().toISOString(),
        disabledBy: user.isDisabled ? null : 'admin',
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);
      
      setSuccess(`User ${user.isDisabled ? 'enabled' : 'disabled'} successfully!`);
      
      // Notify parent component to refresh data
      if (onUserUpdate) {
        onUserUpdate();
      }

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error updating user status:', error);
      setError(`Failed to ${user.isDisabled ? 'enable' : 'disable'} user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setEditData(prev => ({
      ...prev,
      role: newRole
    }));
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-2xl rounded-xl bg-gray-800 border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">
            User Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-200">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* User Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.name || user.displayName || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.email || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                {isEditing ? (
                  <select
                    name="role"
                    value={editData.role}
                    onChange={handleInputChange}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'patient' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role || 'patient'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isDisabled ? 'Disabled' : 'Active'}
                  </span>
                  {user.disabledAt && (
                    <span className="text-xs text-gray-400">
                      (Disabled on {new Date(user.disabledAt).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Auth Method</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.authMethod === 'Google' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.authMethod || 'Unknown'}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={editData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{user.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">User ID</label>
                <p className="text-gray-300 font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Created</label>
                <p className="text-gray-300">
                  {user.createdAt && user.createdAt !== 'Demo' && user.createdAt !== 'Unknown'
                    ? new Date(user.createdAt).toLocaleString()
                    : user.createdAt || 'Unknown'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Updated</label>
                <p className="text-gray-300">
                  {user.updatedAt 
                    ? new Date(user.updatedAt).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Verified</label>
                <p className="text-gray-300">
                  {user.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-600">
          <div className="flex space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={handleDisableUser}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    user.isDisabled 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      user.isDisabled 
                        ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    } />
                  </svg>
                  <span>{user.isDisabled ? 'Enable' : 'Disable'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      name: user.name || user.displayName || '',
                      email: user.email || '',
                      role: user.role || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      status: user.status || 'active'
                    });
                    setError('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

