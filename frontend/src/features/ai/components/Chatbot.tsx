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
    } catch (error) {
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
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] h-[80vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center shadow-md pb-5">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold tracking-wide">Nexis Assistant</h3>
                <p className="text-xs text-indigo-100 font-medium">AI-Powered Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-xl transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div
                    className={`p-4 rounded-2xl shadow-sm ${message.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : message.error
                          ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-sm'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                      }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                    {/* Feedback buttons for bot messages */}
                    {message.type === 'bot' && !message.error && index !== 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/60">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Helpful?</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleFeedback(index, 'up')}
                            className={`p-1.5 rounded-lg transition-all transform hover:scale-105 ${messageFeedback[index] === 'up'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-500'
                              }`}
                          >
                            <ThumbsUp size={14} className={messageFeedback[index] === 'up' ? 'fill-current' : ''} />
                          </button>
                          <button
                            onClick={() => handleFeedback(index, 'down')}
                            className={`p-1.5 rounded-lg transition-all transform hover:scale-105 ${messageFeedback[index] === 'down'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500'
                              }`}
                          >
                            <ThumbsDown size={14} className={messageFeedback[index] === 'down' ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 font-medium px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quick questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white/90 backdrop-blur-md">
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-1 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
