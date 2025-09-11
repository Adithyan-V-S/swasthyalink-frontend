import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FamilyTreeVisualization = ({ familyMembers, onEditMember, onNavigateToChat }) => {
  const { currentUser } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeLayout, setTreeLayout] = useState('hierarchical'); // 'hierarchical' or 'circular'

  // Group family members by relationship hierarchy
  const organizeByHierarchy = () => {
    const hierarchy = {
      grandparents: [],
      parents: [],
      self: currentUser,
      siblings: [],
      spouses: [],
      children: [],
      grandchildren: [],
      others: []
    };

    familyMembers.forEach(member => {
      const relationship = member.relationship?.toLowerCase();
      
      switch (relationship) {
        case 'grandparent':
        case 'grandfather':
        case 'grandmother':
          hierarchy.grandparents.push(member);
          break;
        case 'parent':
        case 'father':
        case 'mother':
          hierarchy.parents.push(member);
          break;
        case 'sibling':
        case 'brother':
        case 'sister':
          hierarchy.siblings.push(member);
          break;
        case 'spouse':
        case 'husband':
        case 'wife':
          hierarchy.spouses.push(member);
          break;
        case 'child':
        case 'son':
        case 'daughter':
          hierarchy.children.push(member);
          break;
        case 'grandchild':
        case 'grandson':
        case 'granddaughter':
          hierarchy.grandchildren.push(member);
          break;
        default:
          hierarchy.others.push(member);
      }
    });

    return hierarchy;
  };

  const getRelationshipIcon = (relationship) => {
    const icons = {
      'spouse': '💑', 'husband': '👨', 'wife': '👩',
      'parent': '👨‍👩‍👧‍👦', 'father': '👨', 'mother': '👩',
      'child': '👶', 'son': '👦', 'daughter': '👧',
      'sibling': '👫', 'brother': '👨', 'sister': '👩',
      'grandparent': '👴', 'grandfather': '👴', 'grandmother': '👵',
      'grandchild': '👶', 'grandson': '👦', 'granddaughter': '👧',
      'uncle': '👨', 'aunt': '👩', 'cousin': '👥',
      'friend': '🤝', 'caregiver': '🩺'
    };
    return icons[relationship?.toLowerCase()] || '👤';
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'full': return 'border-green-400 bg-green-50';
      case 'limited': return 'border-yellow-400 bg-yellow-50';
      case 'emergency': return 'border-red-400 bg-red-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getOnlineStatus = (member) => {
    // Mock online status - in real app, this would come from backend
    return Math.random() > 0.5;
  };

  const MemberCard = ({ member, isCenter = false, size = 'normal' }) => {
    const cardSize = size === 'large' ? 'w-24 h-24' : size === 'small' ? 'w-12 h-12' : 'w-16 h-16';
    const textSize = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-sm' : 'text-lg';
    const nameSize = size === 'large' ? 'text-lg' : size === 'small' ? 'text-xs' : 'text-sm';

    return (
      <div className="flex flex-col items-center group">
        <div className="relative">
          <div 
            className={`${cardSize} ${getAccessLevelColor(member.accessLevel)} 
              rounded-full flex items-center justify-center font-bold ${textSize}
              border-2 cursor-pointer transition-all duration-300 
              hover:scale-110 hover:shadow-lg ${isCenter ? 'ring-4 ring-indigo-300' : ''}
              ${selectedMember?.email === member.email ? 'ring-4 ring-blue-400' : ''}`}
            onClick={() => setSelectedMember(selectedMember?.email === member.email ? null : member)}
          >
            {member.name?.charAt(0) || '?'}
          </div>
          
          {/* Online Status */}
          {getOnlineStatus(member) && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
          
          {/* Emergency Contact Badge */}
          {member.isEmergencyContact && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-center">
          <p className={`font-medium text-gray-900 ${nameSize}`}>{member.name}</p>
          <div className="flex items-center justify-center mt-1">
            <span className="mr-1">{getRelationshipIcon(member.relationship)}</span>
            <p className="text-xs text-gray-600">{member.relationship}</p>
          </div>
        </div>

        {/* Action Buttons - Show on Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToChat && onNavigateToChat(member);
            }}
            className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Start Chat"
          >
            <span className="material-icons text-sm">chat</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditMember && onEditMember(member);
            }}
            className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
            title="Edit Access"
          >
            <span className="material-icons text-sm">edit</span>
          </button>
        </div>
      </div>
    );
  };

  const ConnectionLine = ({ from, to, type = 'solid' }) => (
    <div className={`absolute bg-gray-300 ${type === 'dashed' ? 'border-dashed border-t-2' : 'h-0.5'}`} 
         style={{
           left: `${Math.min(from.x, to.x)}px`,
           top: `${Math.min(from.y, to.y)}px`,
           width: `${Math.abs(to.x - from.x)}px`,
           height: type === 'dashed' ? '2px' : '2px'
         }} 
    />
  );

  const renderHierarchicalTree = () => {
    const hierarchy = organizeByHierarchy();

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-max p-8 space-y-12">
          {/* Grandparents Level */}
          {hierarchy.grandparents.length > 0 && (
            <div className="flex justify-center">
              <div className="flex space-x-8">
                {hierarchy.grandparents.map(member => (
                  <MemberCard key={member.email} member={member} size="small" />
                ))}
              </div>
            </div>
          )}

          {/* Parents Level */}
          {hierarchy.parents.length > 0 && (
            <div className="flex justify-center">
              <div className="flex space-x-8">
                {hierarchy.parents.map(member => (
                  <MemberCard key={member.email} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Self and Spouse Level */}
          <div className="flex justify-center items-center space-x-12">
            {/* Siblings */}
            {hierarchy.siblings.length > 0 && (
              <div className="flex flex-col space-y-4">
                <h4 className="text-sm font-medium text-gray-600 text-center">Siblings</h4>
                <div className="flex flex-col space-y-4">
                  {hierarchy.siblings.map(member => (
                    <MemberCard key={member.email} member={member} size="small" />
                  ))}
                </div>
              </div>
            )}

            {/* Self */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-indigo-300">
                  {currentUser?.displayName?.charAt(0) || 'Y'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="mt-2 text-center">
                <p className="font-bold text-gray-900">{currentUser?.displayName || 'You'}</p>
                <p className="text-xs text-indigo-600">Family Center</p>
              </div>
            </div>

            {/* Spouse */}
            {hierarchy.spouses.length > 0 && (
              <div className="flex flex-col space-y-4">
                <h4 className="text-sm font-medium text-gray-600 text-center">Spouse</h4>
                <div className="flex flex-col space-y-4">
                  {hierarchy.spouses.map(member => (
                    <MemberCard key={member.email} member={member} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Children Level */}
          {hierarchy.children.length > 0 && (
            <div className="flex justify-center">
              <div className="flex space-x-8">
                {hierarchy.children.map(member => (
                  <MemberCard key={member.email} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Grandchildren Level */}
          {hierarchy.grandchildren.length > 0 && (
            <div className="flex justify-center">
              <div className="flex space-x-8">
                {hierarchy.grandchildren.map(member => (
                  <MemberCard key={member.email} member={member} size="small" />
                ))}
              </div>
            </div>
          )}

          {/* Others */}
          {hierarchy.others.length > 0 && (
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-lg font-semibold text-gray-800 text-center mb-6">Extended Family & Friends</h4>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {hierarchy.others.map(member => (
                    <MemberCard key={member.email} member={member} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCircularTree = () => {
    const centerX = 300;
    const centerY = 300;
    const radius = 200;
    const angleStep = (2 * Math.PI) / familyMembers.length;

    return (
      <div className="relative w-full h-[600px] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          {/* Connection Lines */}
          {familyMembers.map((member, index) => {
            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <line
                key={`line-${member.email}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeDasharray={member.accessLevel === 'emergency' ? '5,5' : 'none'}
              />
            );
          })}
        </svg>

        {/* Center - Current User */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: centerX, top: centerY }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-indigo-300">
            {currentUser?.displayName?.charAt(0) || 'Y'}
          </div>
          <p className="text-center mt-2 font-bold text-gray-900">You</p>
        </div>

        {/* Family Members */}
        {familyMembers.map((member, index) => {
          const angle = index * angleStep;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <div
              key={member.email}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <MemberCard member={member} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Family Tree</h3>
            <p className="text-gray-600 mt-1">Visual representation of your family network</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTreeLayout('hierarchical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                treeLayout === 'hierarchical'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="material-icons text-sm mr-1">account_tree</span>
              Hierarchy
            </button>
            <button
              onClick={() => setTreeLayout('circular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                treeLayout === 'circular'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="material-icons text-sm mr-1">radio_button_checked</span>
              Circular
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Full Access</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Limited Access</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-400 rounded-full mr-2"></div>
            <span className="text-gray-600">Emergency Only</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Online</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="text-gray-600">Emergency Contact</span>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="p-6">
        {familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-icons text-6xl">people_outline</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">No Family Members</h4>
            <p className="text-gray-600">Add family members to see your family tree</p>
          </div>
        ) : (
          <>
            {treeLayout === 'hierarchical' ? renderHierarchicalTree() : renderCircularTree()}
          </>
        )}
      </div>

      {/* Selected Member Details */}
      {selectedMember && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${getAccessLevelColor(selectedMember.accessLevel)} rounded-full flex items-center justify-center font-bold text-lg border-2`}>
                {selectedMember.name?.charAt(0) || '?'}
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">{selectedMember.name}</h4>
                <p className="text-sm text-gray-600">{selectedMember.email}</p>
                <div className="flex items-center mt-1">
                  <span className="mr-2">{getRelationshipIcon(selectedMember.relationship)}</span>
                  <span className="text-sm text-gray-700">{selectedMember.relationship}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onNavigateToChat && onNavigateToChat(selectedMember)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <span className="material-icons text-sm mr-1">chat</span>
                Chat
              </button>
              <button
                onClick={() => onEditMember && onEditMember(selectedMember)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <span className="material-icons text-sm mr-1">edit</span>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreeVisualization;