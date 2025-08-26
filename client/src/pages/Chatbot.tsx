import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import MagneticButton from "@/components/MagneticButton";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Who should I start this week, Jaylen Waddle or Courtland Sutton?",
      sender: 'user',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      text: "I'd recommend Jaylen Waddle. He has a higher target share and faces a weaker secondary this week.",
      sender: 'assistant',
      timestamp: new Date(Date.now() - 240000)
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <h1 className="mb-6">
              Ask the Assistant
            </h1>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-textDim text-xl max-w-2xl mx-auto">
              Get instant, AI-powered answers to all your fantasy football questions. 
              From start/sit decisions to trade analysis.
            </p>
          </Reveal>
        </div>

        {/* Chat Window */}
        <Reveal delay={0.4}>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-surface border border-border rounded-2xl backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              data-testid="chat-window"
            >
              {/* Chat Header */}
              <div className="border-b border-border p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth={2}/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-text">Fantasy Assistant</h3>
                    <p className="text-textDim text-sm">Always ready to help you win</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-6 space-y-4" data-testid="messages-area">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.sender}-${message.id}`}
                    >
                      <div
                        className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-primary text-white ml-8'
                            : 'bg-surface2 text-text mr-8'
                        } backdrop-blur-sm`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-white' : 'text-textDim'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-6">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask your fantasy assistant…"
                      className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                      data-testid="chat-input"
                    />
                  </div>
                  
                  <button
                    type="submit" 
                    className="bg-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:scale-105 hover:-translate-y-1 transition-all duration-200"
                    disabled={!inputMessage.trim()}
                    data-testid="send-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Help Text */}
            <div className="text-center mt-8">
              <p className="text-textDim text-sm">
                Try asking: "Should I trade CMC for Josh Allen?" or "Who are the best waiver pickups?"
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}