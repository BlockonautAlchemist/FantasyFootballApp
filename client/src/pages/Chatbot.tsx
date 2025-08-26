import { useState } from "react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import ConnectionCallout from "@/components/ConnectionCallout";

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
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: '2',
      text: "I'd recommend Jaylen Waddle. He has a higher target share and faces a weaker secondary this week.",
      sender: 'assistant',
      timestamp: new Date(Date.now() - 240000) // 4 minutes ago
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
    <div>
      <PageHeader 
        title="Fantasy Assistant Chat" 
        subtitle="Get personalized advice for your fantasy football questions" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* Chat Window */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-surface border border-gray-200 rounded-lg shadow-sm overflow-hidden" data-testid="chat-window">
          {/* Chat Header */}
          <div className="bg-primary/5 border-b border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-primary"></i>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Fantasy Assistant</h3>
                <p className="text-sm text-slate-600">Your AI-powered fantasy football advisor</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4" data-testid="messages-area">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.sender}-${message.id}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your fantasy assistant…"
                className="flex-1 input"
                data-testid="chat-input"
              />
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={!inputMessage.trim()}
                data-testid="send-button"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </form>
          </div>
        </div>

        {/* Chat Info */}
        <div className="mt-4 text-center text-sm text-slate-600">
          <p>Get instant answers to your fantasy football questions</p>
        </div>
      </div>
    </div>
  );
}