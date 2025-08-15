import React, { useState, useRef, useEffect } from "react";
import dialogflowService from '../services/dialogflowService';
import { useAuth } from '../contexts/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1,
      role: "assistant", 
      content: "Hi! I'm your SwasthyaBot health assistant. You can ask me about appointments, medications, family connections, or health records. How can I help you today?",
      timestamp: new Date()
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  // Fallback responses in case Dialogflow is unavailable
  const fallbackResponses = [
    "I'm sorry, I'm having trouble connecting to my knowledge base. Could you try again?",
    "It seems I'm experiencing some technical difficulties. Please try again in a moment.",
    "I couldn't process that request. Could you rephrase your question?",
    "I'm still learning! Could you try asking another health-related question?",
    "That's beyond my current capabilities. Please ask about appointments, medications, records, or family connections."
  ];

  // Get random fallback response
  const getRandomFallback = () => {
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  // Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session ID on component mount
  useEffect(() => {
    if (!sessionId && currentUser) {
      // Use user ID as part of session ID if available
      const userPart = currentUser ? currentUser.uid.substring(0, 8) : '';
      const randomPart = Math.random().toString(36).substring(2, 10);
      setSessionId(`${userPart}-${randomPart}-${Date.now()}`);
    }
  }, [currentUser, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    // Add user message to chat with timestamp
    const userMsg = { 
      id: Date.now(),
      role: "user", 
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages((msgs) => [...msgs, userMsg]);
    
    // Store the message for processing
    const messageToProcess = inputMessage;
    
    // Clear input field
    setInputMessage("");
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Add a small delay to simulate thinking
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Get response from Dialogflow (with local fallback)
      const response = await dialogflowService.detectIntent(messageToProcess, sessionId);
      
      if (response.success) {
        const botMsg = { 
          id: Date.now(),
          role: "assistant", 
          content: response.response,
          timestamp: new Date()
        };
        setMessages((msgs) => [...msgs, botMsg]);
        
        // Update session ID if provided
        if (response.sessionId) {
          setSessionId(response.sessionId);
        }
      } else {
        // Fallback message if Dialogflow fails
        const botMsg = { 
          id: Date.now(),
          role: "assistant", 
          content: getRandomFallback(),
          timestamp: new Date()
        };
        setMessages((msgs) => [...msgs, botMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const botMsg = { 
        id: Date.now(),
        role: "assistant", 
        content: "Sorry, I'm currently unavailable. Please try again later.",
        timestamp: new Date()
      };
      setMessages((msgs) => [...msgs, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format timestamp to readable time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Close chatbot on Escape key
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chatbot toggle button */}
      <button
        onClick={toggleChatbot}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 focus:outline-none"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 max-h-[500px] border border-gray-200">
          {/* Chatbot header */}
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">SwasthyaBot</h3>
                <p className="text-xs text-indigo-100">Health Assistant</p>
              </div>
            </div>
            <button 
              onClick={toggleChatbot}
              className="text-white hover:text-indigo-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: '350px' }}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className={`px-4 py-2 rounded-r-lg focus:outline-none ${
                  !inputMessage.trim() || isTyping
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
