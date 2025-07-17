import React, { useState, useRef } from "react";

const LOCAL_RESPONSES = [
  { keywords: ["hello", "hi"], response: "Hello! How can I help you with your health today?" },
  { keywords: ["help", "support"], response: "I'm here to help! You can ask about appointments, doctors, or health tips." },
  { keywords: ["doctor"], response: "You can find a list of doctors in the Doctors section or book an appointment from your dashboard." },
  { keywords: ["appointment"], response: "To book an appointment, go to your dashboard and click 'Book Appointment'." },
  { keywords: ["medicine", "prescription"], response: "Always follow your doctor's prescription. If you have questions, consult your healthcare provider." },
  { keywords: ["emergency"], response: "If this is a medical emergency, please call your local emergency number immediately!" },
  { keywords: ["bye", "goodbye"], response: "Take care! If you need anything else, just ask." },
];

const HEALTH_TIPS = [
  "Drink plenty of water every day!",
  "Regular exercise helps keep your body and mind healthy.",
  "Eat a balanced diet rich in fruits and vegetables.",
  "Wash your hands frequently to prevent illness.",
  "Get enough sleep for better health.",
  "Don't skip your regular health checkups!",
  "Take breaks and manage stress for mental well-being.",
];

function getLocalBotResponse(input) {
  const text = input.toLowerCase();
  for (const entry of LOCAL_RESPONSES) {
    if (entry.keywords.some((kw) => text.includes(kw))) {
      return entry.response;
    }
  }
  // If no keyword matched, return a random health tip
  return HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your health assistant. Ask me anything about health, appointments, or doctors!" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const botMsg = { role: "assistant", content: getLocalBotResponse(input) };
    setMessages((msgs) => [...msgs, userMsg, botMsg]);
    setInput("");
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
            Health Chatbot
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