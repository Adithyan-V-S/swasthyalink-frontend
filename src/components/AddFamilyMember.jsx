import React, { useState } from 'react';
import { validateEmail, validatePhone, validateName } from '../utils/validation';
import Button from './common/Button';
import Input from './common/Input';
import { useAuth } from '../contexts/AuthContext';
import { sendFamilyRequest } from '../services/familyService';

const AddFamilyMember = ({ isOpen, onClose, onAdd }) => {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    accessLevel: 'limited',
    isEmergencyContact: false,
    enableChat: true,
    profilePicture: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  const relationships = [
    'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 
    'Grandchild', 'Uncle', 'Aunt', 'Cousin', 'Friend', 'Caregiver'
  ];

  const accessLevels = [
    { value: 'full', label: 'Full Access', description: 'Can view all health records and information' },
    { value: 'limited', label: 'Limited Access', description: 'Can view basic health records and emergency information' },
    { value: 'emergency', label: 'Emergency Only', description: 'Can only access critical information during emergencies' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }

    // Validate relationship
    if (!formData.relationship) {
      newErrors.relationship = 'Please select a relationship';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Send family request via API
      if (!currentUser || !currentUser.email) {
        throw new Error('Current user email not found');
      }

      const response = await sendFamilyRequest({
        fromEmail: currentUser.email,
        toEmail: formData.email,
        toName: formData.name,
        relationship: formData.relationship
      });

      if (response.success) {
        onAdd({
          id: response.request.id,
          ...formData,
          avatar: formData.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name) + '&background=random&color=fff&size=64',
          dateAdded: new Date().toISOString(),
          status: 'pending',
          lastAccess: null
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          relationship: '',
          accessLevel: 'limited',
          isEmergencyContact: false,
          enableChat: true,
          profilePicture: null
        });
        setStep(1);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to send family request');
      }
    } catch (error) {
      console.error('Error sending family request:', error);
      alert('Failed to send family request: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, profilePicture: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic Information</h3>
        <p className="text-gray-600">Enter the family member's basic details</p>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-icons text-gray-400 text-3xl">person</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
            <span className="material-icons text-sm">camera_alt</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-gray-500">Upload profile picture (optional)</p>
      </div>

      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter full name"
        required
        leftIcon={<span className="material-icons text-sm">person</span>}
      />

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        placeholder="Enter email address"
        required
        leftIcon={<span className="material-icons text-sm">email</span>}
      />

      <Input
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        error={errors.phone}
        placeholder="Enter phone number"
        required
        leftIcon={<span className="material-icons text-sm">phone</span>}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.relationship}
          onChange={(e) => handleInputChange('relationship', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select relationship</option>
          {relationships.map(rel => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
        {errors.relationship && (
          <p className="mt-2 text-sm text-red-600">{errors.relationship}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Access & Permissions</h3>
        <p className="text-gray-600">Configure access levels and communication settings</p>
      </div>

      {/* Access Level Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Access Level <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {accessLevels.map(level => (
            <div
              key={level.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.accessLevel === level.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleInputChange('accessLevel', level.value)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="accessLevel"
                  value={level.value}
                  checked={formData.accessLevel === level.value}
                  onChange={() => handleInputChange('accessLevel', level.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{level.label}</h4>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <input
          type="checkbox"
          id="emergencyContact"
          checked={formData.isEmergencyContact}
          onChange={(e) => handleInputChange('isEmergencyContact', e.target.checked)}
          className="text-yellow-600 focus:ring-yellow-500"
        />
        <label htmlFor="emergencyContact" className="flex-1">
          <span className="font-medium text-yellow-800">Emergency Contact</span>
          <p className="text-sm text-yellow-700">
            This person can access critical health information during emergencies
          </p>
        </label>
      </div>

      {/* Chat Enable */}
      <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <input
          type="checkbox"
          id="enableChat"
          checked={formData.enableChat}
          onChange={(e) => handleInputChange('enableChat', e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="enableChat" className="flex-1">
          <span className="font-medium text-blue-800">Enable Chat Communication</span>
          <p className="text-sm text-blue-700">
            Allow this family member to communicate via the family chat system
          </p>
        </label>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Review & Confirm</h3>
        <p className="text-gray-600">Please review the information before adding the family member</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-icons text-gray-400 text-2xl">person</span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{formData.name}</h4>
            <p className="text-gray-600">{formData.relationship}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-medium">{formData.email}</p>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <p className="font-medium">{formData.phone}</p>
          </div>
          <div>
            <span className="text-gray-600">Access Level:</span>
            <p className="font-medium capitalize">{formData.accessLevel}</p>
          </div>
          <div>
            <span className="text-gray-600">Emergency Contact:</span>
            <p className="font-medium">{formData.isEmergencyContact ? 'Yes' : 'No'}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Chat Enabled:</span>
            <p className="font-medium">{formData.enableChat ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="material-icons text-blue-600 mt-0.5">info</span>
          <div>
            <h4 className="font-medium text-blue-800">What happens next?</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• An invitation will be sent to {formData.email}</li>
              <li>• They'll need to accept the invitation to access your health records</li>
              {formData.enableChat && <li>• Chat communication will be enabled once they join</li>}
              <li>• You can modify their access level anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Add Family Member</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mt-4">
            {[1, 2, 3].map(stepNum => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-1 mx-2 ${step > stepNum ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <Button
            variant="secondary"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
            loading={isSubmitting}
            disabled={step === 1 && (!formData.name || !formData.email || !formData.phone || !formData.relationship)}
          >
            {step === 3 ? 'Add Family Member' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddFamilyMember;
