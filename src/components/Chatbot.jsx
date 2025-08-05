import React, { useState, useRef } from "react";
import dialogflowService from '../services/dialogflowService';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your health assistant powered by Dialogflow. Ask me anything about health, appointments, or doctors!" },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    
    // Clear input field
    setInput("");
    
    try {
      // Get response from Dialogflow
      const response = await dialogflowService.detectIntent(input, sessionId);
      
      if (response.success) {
        const botMsg = { role: "assistant", content: response.response };
        setMessages((msgs) => [...msgs, botMsg]);
        
        // Update session ID if provided
        if (response.sessionId) {
          setSessionId(response.sessionId);
        }
      } else {
        // Fallback message if Dialogflow fails
        const botMsg = { role: "assistant", content: "Sorry, I'm having trouble understanding. Could you please rephrase your question?" };
        setMessages((msgs) => [...msgs, botMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const botMsg = { role: "assistant", content: "Sorry, I'm currently unavailable. Please try again later." };
      setMessages((msgs) => [...msgs, botMsg]);
    }
  };

  React.useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  return (
    <>
      {/* Floating chat button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-yellow-400 text-white hover:text-indigo-800 rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chatbot"
      >
        💬
      </button>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-indigo-200 flex flex-col">
          <div className="px-4 py-3 bg-indigo-600 text-white rounded-t-2xl font-bold flex justify-between items-center">
            Health Chatbot (Dialogflow)
            <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</button>
          </div>
          <div className="flex-1 px-4 py-2 overflow-y-auto max-h-80" style={{ minHeight: 200 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`my-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${msg.role === "user" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex border-t border-indigo-100">
            <input
              className="flex-1 px-3 py-2 rounded-bl-2xl outline-none text-sm"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-br-2xl hover:bg-yellow-400 hover:text-indigo-800 transition-colors disabled:opacity-50"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
