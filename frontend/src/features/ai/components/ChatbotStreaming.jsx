import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Database, Search, Package, CheckCircle2, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from '../../../axiosConfig';
import ReactMarkdown from 'react-markdown';

export default function ChatbotStreaming() {
  const [isOpen, setIsOpen] = useState(false);
  const userEmail = useSelector((state) => state.user.email); // Get email from Redux
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
  const [messageFeedback, setMessageFeedback] = useState({}); // Track feedback for each message
  const [suggestions] = useState([
    "How does shipping work?",
    "Show my orders",
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
          email: userEmail || null, // Pass user email if logged in
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
            }
          }
        }
      }
    } catch (error) {
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
        threadId: threadId || null,
        question: messageIndex > 0 ? messages[messageIndex - 1]?.text : null,
        answer: message?.text,
        userEmail: userEmail || null,
      });
    } catch (error) {
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
          className="fixed bottom-6 right-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white p-5 rounded-full shadow-2xl hover:from-slate-700 hover:to-slate-600 transition-all duration-300 transform hover:scale-110 z-50 group"
        >
          <MessageCircle size={32} className="group-hover:animate-bounce" />
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[500px] h-[750px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6 rounded-t-2xl flex justify-between items-center shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Sparkles size={28} className="text-emerald-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-xl">SupportFlow AI</h3>
                <p className="text-sm text-slate-300">Smart Shopping Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-all transform hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>

          {/* Agent Status Bar */}
          {(agentStatus || toolsInProgress.length > 0) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-blue-100">
              {agentStatus && (
                <div className="flex items-center space-x-3 text-base text-slate-700 mb-2">
                  {getStatusIcon(agentStatus.status)}
                  <span className="font-semibold">{agentStatus.message}</span>
                </div>
              )}
              {toolsInProgress.map((tool, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 text-sm ${
                    tool.status === 'completed' ? 'text-emerald-600 font-semibold' : 'text-slate-600'
                  } mb-1`}
                >
                  {getStatusIcon(tool.status)}
                  <span>{tool.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-gray-50 to-gray-100">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] p-5 rounded-2xl shadow-md ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-tr-none'
                      : message.error
                      ? 'bg-red-50 text-red-800 rounded-tl-none border-2 border-red-200'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                  }`}
                >
                  {message.type === 'user' ? (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <div className="text-base leading-relaxed prose prose-base max-w-none">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 font-semibold transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          p: ({ node, ...props }) => <p {...props} className="mb-3" />,
                          strong: ({ node, ...props }) => <strong {...props} className="font-bold text-slate-900" />,
                          ul: ({ node, ...props }) => <ul {...props} className="ml-4 space-y-1" />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 font-bold mb-2">Tools Used:</p>
                      {message.toolsUsed.map((tool, idx) => (
                        <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-2 flex items-center justify-between">
                          <span className="font-semibold">{tool.tool}</span>
                          {tool.result.success && <span className="text-emerald-600 text-lg">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Feedback buttons for bot messages */}
                  {message.type === 'bot' && !message.error && (
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(index, 'up')}
                        className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${
                          messageFeedback[index] === 'up'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-600'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp size={16} className={messageFeedback[index] === 'up' ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => handleFeedback(index, 'down')}
                        className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${
                          messageFeedback[index] === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown size={16} className={messageFeedback[index] === 'down' ? 'fill-current' : ''} />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-3">
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
                <div className="max-w-[90%] p-5 rounded-2xl rounded-tl-none shadow-md bg-white text-gray-800 border border-gray-200">
                  <div className="text-base leading-relaxed prose prose-base max-w-none">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 font-semibold transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        p: ({ node, ...props }) => <p {...props} className="mb-3" />,
                        strong: ({ node, ...props }) => <strong {...props} className="font-bold text-slate-900" />,
                        ul: ({ node, ...props }) => <ul {...props} className="ml-4 space-y-1" />,
                      }}
                    >
                      {currentAnswer}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-slate-600 animate-pulse ml-1"></span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !currentAnswer && !agentStatus && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-md border border-gray-200">
                  <Loader2 size={24} className="animate-spin text-slate-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <p className="text-sm text-gray-700 font-bold mb-3">💡 Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm bg-white border-2 border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-5 border-t-2 border-gray-200 bg-white rounded-b-2xl">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about orders, products, or policies..."
                className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-base shadow-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 rounded-xl hover:from-slate-700 hover:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105 active:scale-95"
              >
                <Send size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
