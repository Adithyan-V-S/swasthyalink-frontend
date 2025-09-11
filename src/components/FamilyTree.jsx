import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';

const containerStyles = {
  width: '100%',
  height: '600px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
  padding: '10px',
  overflow: 'auto'
};

const avatarSize = 60;

const CustomNode = ({ nodeDatum, toggleNode }) => {
  const { name, attributes } = nodeDatum;
  const avatarUrl = attributes?.avatar || null;

  // Generate initials if no avatar
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const names = fullName.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  };

  return (
    <g>
      {/* Circle background for avatar */}
      <circle
        r={avatarSize / 2}
        fill="#f3f4f6"
        stroke="#4f46e5"
        strokeWidth={2}
        cx={0}
        cy={0}
      />
      {/* Avatar image or initials */}
      {avatarUrl ? (
        <image
          href={avatarUrl}
          x={-avatarSize / 2}
          y={-avatarSize / 2}
          width={avatarSize}
          height={avatarSize}
          clipPath="circle(30px at center)"
        />
      ) : (
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fontSize="24"
          fill="#4f46e5"
          fontWeight="bold"
        >
          {getInitials(name)}
        </text>
      )}
      {/* Name below avatar */}
      <text
        x={0}
        y={avatarSize / 2 + 20}
        textAnchor="middle"
        fontSize="14"
        fill="#1e40af"
        fontWeight="bold"
      >
        {name}
      </text>
      {/* Relationship below name */}
      <text
        x={0}
        y={avatarSize / 2 + 38}
        textAnchor="middle"
        fontSize="12"
        fill="#6b7280"
      >
        {attributes?.relationship || ''}
      </text>
      {/* Add button below */}
      <circle
        cx={0}
        cy={avatarSize / 2 + 60}
        r={12}
        fill="#4f46e5"
        cursor="pointer"
        onClick={() => alert(`Add family member to ${name}`)}
      />
      <text
        x={0}
        y={avatarSize / 2 + 65}
        textAnchor="middle"
        fontSize="18"
        fill="white"
        fontWeight="bold"
        pointerEvents="none"
      >
        +
      </text>
    </g>
  );
};

const FamilyTree = ({ currentUser, familyMembers }) => {
  console.log("FamilyTree component rendering with currentUser:", currentUser, "familyMembers:", familyMembers);

  const treeContainer = useRef(null);
  const [translate, setTranslate] = useState({ x: 400, y: 50 });

  useEffect(() => {
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      console.log("Tree container dimensions:", dimensions);
    }
  }, []);

  // Build tree data with currentUser as root and family members as children
  const treeData = {
    name: currentUser?.displayName || currentUser?.email || 'You',
    attributes: {
      relationship: 'Self',
      avatar: currentUser?.photoURL || null
    },
    children: familyMembers.map(member => ({
      name: member.name,
      attributes: {
        relationship: member.relationship || 'Family Member',
        avatar: member.avatar || null
      }
    }))
  };

  console.log("Tree data:", treeData);

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Error: currentUser is not defined. Please login to view the family tree.
      </div>
    );
  }

  if (!familyMembers || familyMembers.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No family members to display in the tree.
      </div>
    );
  }

  return (
    <div style={containerStyles} ref={treeContainer}>
      <Tree
        data={treeData}
        translate={translate}
        orientation="vertical"
        pathFunc="elbow"
        collapsible={false}
        zoomable={true}
        initialDepth={1}
        styles={{
          links: {
            stroke: '#4f46e5',
            strokeWidth: 2
          }
        }}
        renderCustomNodeElement={(rd3tProps) => <CustomNode {...rd3tProps} />}
      />
    </div>
  );
};

export default FamilyTree;
