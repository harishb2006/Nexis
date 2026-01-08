import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Database, Search, Package, CheckCircle2, Zap } from 'lucide-react';
import axios from '../../../axiosConfig';

export default function ChatbotStreaming() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your AI-powered ShopHub assistant. I can search policies, check orders, and help you find products!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [toolsInProgress, setToolsInProgress] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [threadId, setThreadId] = useState(null); // Conversation memory
  const [suggestions] = useState([
    "How does shipping work?",
    "Show me all pending orders",
    "Search for electronics",
    "What's your return policy?",
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus, toolsInProgress]);

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
    setAgentStatus(null);
    setToolsInProgress([]);
    setCurrentAnswer('');

    try {
      const response = await fetch(`${axios.defaults.baseURL}/api/v2/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text.trim(),
          threadId: threadId, // Pass existing threadId for conversation memory
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              setAgentStatus(null);
              setToolsInProgress([]);
              continue;
            }

            try {
              const event = JSON.parse(data);
              handleStreamEvent(event);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      const errorMessage = {
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        error: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      setAgentStatus(null);
      setToolsInProgress([]);
    }
  };

  const handleStreamEvent = (event) => {
    switch (event.type) {
      case 'thread_init':
        // Save threadId for future messages in this conversation
        if (!threadId) {
          setThreadId(event.threadId);
          console.log('Thread initialized:', event.threadId);
        }
        break;

      case 'status':
        setAgentStatus({
          message: event.message,
          status: event.status,
        });
        break;

      case 'tool_start':
        setToolsInProgress((prev) => [
          ...prev,
          {
            tool: event.tool,
            message: event.message,
            status: 'executing',
          },
        ]);
        break;

      case 'tool_complete':
        setToolsInProgress((prev) =>
          prev.map((t) =>
            t.tool === event.tool
              ? { ...t, status: 'completed', message: event.message }
              : t
          )
        );
        // Keep tool visible for a moment
        setTimeout(() => {
          setToolsInProgress((prev) => prev.filter((t) => t.tool !== event.tool));
        }, 2000);
        break;

      case 'answer_start':
        setAgentStatus({ message: '💬 Generating response...', status: 'streaming' });
        break;

      case 'answer_chunk':
        setCurrentAnswer((prev) => prev + event.content);
        break;

      case 'complete':
        const botMessage = {
          type: 'bot',
          text: event.answer,
          sources: event.sources,
          toolsUsed: event.toolsUsed,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setCurrentAnswer('');
        setAgentStatus(null);
        break;

      case 'error':
        const errorMessage = {
          type: 'bot',
          text: `Error: ${event.message}`,
          error: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setCurrentAnswer('');
        setAgentStatus(null);
        setToolsInProgress([]);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'searching':
        return <Search size={16} className="animate-pulse" />;
      case 'found_context':
        return <Database size={16} />;
      case 'thinking':
        return <Sparkles size={16} className="animate-spin" />;
      case 'tool_execution':
        return <Zap size={16} className="animate-bounce" />;
      case 'executing':
        return <Loader2 size={16} className="animate-spin" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      default:
        return <Loader2 size={16} className="animate-spin" />;
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-110 z-50 group"
        >
          <MessageCircle size={28} className="group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sparkles size={24} className="animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">SupportFlow AI</h3>
                <p className="text-xs text-orange-100">Level 3 Agentic System</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Agent Status Bar */}
          {(agentStatus || toolsInProgress.length > 0) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
              {agentStatus && (
                <div className="flex items-center space-x-2 text-sm text-blue-700 mb-2">
                  {getStatusIcon(agentStatus.status)}
                  <span className="font-medium">{agentStatus.message}</span>
                </div>
              )}
              {toolsInProgress.map((tool, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 text-xs ${
                    tool.status === 'completed' ? 'text-green-600' : 'text-purple-600'
                  } mb-1`}
                >
                  {getStatusIcon(tool.status)}
                  <span>{tool.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none'
                      : message.error
                      ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 rounded-tl-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold mb-1">🛠️ Tools Used:</p>
                      {message.toolsUsed.map((tool, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-blue-50 p-2 rounded mt-1">
                          <span className="font-medium">{tool.tool}</span>
                          {tool.result.success && <span className="text-green-600 ml-2">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold mb-1">📚 Sources:</p>
                      {message.sources.map((source, idx) => (
                        <p key={idx} className="text-xs text-gray-500 mt-1">
                          • {source.relevance} relevant
                        </p>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming Answer Preview */}
            {currentAnswer && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none shadow-lg bg-white text-gray-800 border border-gray-100">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {currentAnswer}
                    <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1"></span>
                  </p>
                </div>
              </div>
            )}

            {isLoading && !currentAnswer && !agentStatus && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-lg border border-gray-100">
                  <Loader2 size={20} className="animate-spin text-orange-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <p className="text-xs text-gray-600 font-semibold mb-2">✨ Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-2 rounded-full hover:bg-orange-100 hover:border-orange-300 transition-all shadow-sm font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-orange-100 bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about orders, products, or policies..."
                className="flex-1 px-4 py-3 border border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-full hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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
