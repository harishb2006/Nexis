import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from '../../../axiosConfig';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your ShopHub assistant. Ask me anything about the documents in our knowledge base!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState({}); // Track feedback for each message
  const [suggestions] = useState([
    "How does shipping work?",
    "What are your shipping costs?",
    "Do you ship internationally?",
    "How can I track my order?",
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/v2/chat/ask', {
        question: text.trim(),
      });

      const botMessage = {
        type: 'bot',
        text: response.data.data.answer,
        sources: response.data.data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        error: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleFeedback = async (messageIndex, feedbackType) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [messageIndex]: feedbackType,
    }));
    
    // Send feedback to backend
    try {
      const message = messages[messageIndex];
      await axios.post('/api/v2/chat/feedback', {
        messageIndex,
        feedbackType,
        question: messageIndex > 0 ? messages[messageIndex - 1]?.text : null,
        answer: message?.text,
      });
      console.log(`Feedback sent: ${feedbackType}`);
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 z-50 group"
        >
          <MessageCircle size={28} className="group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 bg-slate-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles size={20} />
              <div>
                <h3 className="font-semibold">ShopHub Assistant</h3>
                <p className="text-xs text-slate-300">AI-Powered Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-none'
                      : message.error
                      ? 'bg-red-100 text-red-800 rounded-tl-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Feedback buttons for bot messages */}
                  {message.type === 'bot' && !message.error && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Helpful?</span>
                      <button
                        onClick={() => handleFeedback(index, 'up')}
                        className={`p-1 rounded transition-all transform hover:scale-110 ${
                          messageFeedback[index] === 'up'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-600'
                        }`}
                      >
                        <ThumbsUp size={14} className={messageFeedback[index] === 'up' ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => handleFeedback(index, 'down')}
                        className={`p-1 rounded transition-all transform hover:scale-110 ${
                          messageFeedback[index] === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
                        }`}
                      >
                        <ThumbsDown size={14} className={messageFeedback[index] === 'down' ? 'fill-current' : ''} />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-100">
                  <Loader2 size={20} className="animate-spin text-slate-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
