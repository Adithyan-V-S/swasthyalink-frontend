import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '../utils/helpers';

// Mock chat data
const mockChatData = {
  conversations: [
    {
      id: 1,
      participantId: 'patient_john',
      participantName: 'John Doe (Patient)',
      participantAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=64',
      lastMessage: 'How are you feeling today?',
      lastMessageTime: '2024-01-15 14:30',
      unreadCount: 2,
      isOnline: true,
      relationship: 'Patient'
    },
    {
      id: 2,
      participantId: 'family_emma',
      participantName: 'Emma Doe',
      participantAvatar: 'https://ui-avatars.com/api/?name=Emma+Doe&background=10b981&color=fff&size=64',
      lastMessage: 'Dad\'s appointment is tomorrow',
      lastMessageTime: '2024-01-15 12:15',
      unreadCount: 0,
      isOnline: false,
      relationship: 'Daughter'
    },
    {
      id: 3,
      participantId: 'doctor_sharma',
      participantName: 'Dr. A. Sharma',
      participantAvatar: 'https://ui-avatars.com/api/?name=Dr+Sharma&background=8b5cf6&color=fff&size=64',
      lastMessage: 'Please continue the medication',
      lastMessageTime: '2024-01-14 16:45',
      unreadCount: 1,
      isOnline: true,
      relationship: 'Doctor'
    }
  ],
  messages: {
    1: [
      {
        id: 1,
        senderId: 'patient_john',
        senderName: 'John Doe',
        message: 'Hi Sarah, I wanted to update you on my health status.',
        timestamp: '2024-01-15 10:00',
        type: 'text',
        isRead: true
      },
      {
        id: 2,
        senderId: 'family_sarah',
        senderName: 'Sarah Doe',
        message: 'Thank you for keeping me updated. How are you feeling today?',
        timestamp: '2024-01-15 10:15',
        type: 'text',
        isRead: true
      },
      {
        id: 3,
        senderId: 'patient_john',
        senderName: 'John Doe',
        message: 'Much better! The new medication is working well.',
        timestamp: '2024-01-15 14:20',
        type: 'text',
        isRead: false
      },
      {
        id: 4,
        senderId: 'patient_john',
        senderName: 'John Doe',
        message: 'My blood pressure readings have been stable.',
        timestamp: '2024-01-15 14:30',
        type: 'text',
        isRead: false
      }
    ],
    2: [
      {
        id: 1,
        senderId: 'family_emma',
        senderName: 'Emma Doe',
        message: 'Hi Mom, just reminding you that Dad\'s appointment is tomorrow at 2 PM.',
        timestamp: '2024-01-15 12:15',
        type: 'text',
        isRead: true
      }
    ],
    3: [
      {
        id: 1,
        senderId: 'doctor_sharma',
        senderName: 'Dr. A. Sharma',
        message: 'Hello, I\'ve reviewed John\'s latest test results. Please continue the current medication regimen.',
        timestamp: '2024-01-14 16:45',
        type: 'text',
        isRead: false
      }
    ]
  }
};

const FamilyChat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState(mockChatData.conversations);
  const [messages, setMessages] = useState(mockChatData.messages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg = {
      id: Date.now(),
      senderId: 'family_sarah', // Current user
      senderName: 'Sarah Doe',
      message: newMessage.trim(),
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'text',
      isRead: true
    };

    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg]
    }));

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: newMsg.timestamp }
        : conv
    ));

    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelationshipColor = (relationship) => {
    switch (relationship.toLowerCase()) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-purple-100 text-purple-800';
      case 'daughter':
      case 'son':
      case 'spouse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex h-[600px]">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-indigo-50">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Family Chat</h3>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  markAsRead(conversation.id);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={conversation.participantAvatar}
                      alt={conversation.participantName}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {conversation.participantName}
                      </h4>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getRelationshipColor(conversation.relationship)}`}>
                        {conversation.relationship}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.lastMessageTime, 'TIME_ONLY')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedConversation.participantAvatar}
                    alt={selectedConversation.participantName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedConversation.participantName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getRelationshipColor(selectedConversation.relationship)}`}>
                        {selectedConversation.relationship}
                      </span>
                      <span className={`text-xs ${selectedConversation.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedConversation.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(messages[selectedConversation.id] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'family_sarah' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'family_sarah'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.senderId !== 'family_sarah' && (
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 'family_sarah' ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatDate(message.timestamp, 'TIME_ONLY')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-icons text-sm">send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <span className="material-icons text-6xl text-gray-400 mb-4">chat</span>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Select a conversation to start chatting
                </h3>
                <p className="text-gray-500">
                  Connect with family members, patients, and healthcare providers
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyChat;
