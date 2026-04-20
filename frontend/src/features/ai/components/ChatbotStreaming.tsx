import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../../axiosConfig';
import ReactMarkdown from 'react-markdown';

// --- Type Definitions ---

interface RootState {
  user: {
    email: string | null;
  };
}

interface ToolUsed {
  tool: string;
  result: { success: boolean; [key: string]: any };
}

interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  error?: boolean;
  sources?: any[];
  toolsUsed?: ToolUsed[];
}

interface AgentStatus {
  message: string;
  status: string;
}

interface ToolInProgress {
  tool: string;
  message: string;
  status: 'executing' | 'completed';
}

interface StreamEvent {
  type: string;
  threadId?: string;
  message?: string;
  status?: string;
  tool?: string;
  content?: string;
  answer?: string;
  sources?: any[];
  toolsUsed?: ToolUsed[];
}

const ChatbotStreaming: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const userEmail = useSelector((state: RootState) => state.user.email);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: "Hello. I am your Nexis assistant. I can search policies, check orders, and help you find products.",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [toolsInProgress, setToolsInProgress] = useState<ToolInProgress[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<number, 'up' | 'down'>>({});
  
  const [suggestions] = useState<string[]>([
    "How does shipping work?",
    "Show my orders",
    "Search for electronics",
    "Return policy",
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus, toolsInProgress, currentAnswer]);

  const handleSendMessage = async (text: string = input): Promise<void> => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
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
          threadId: threadId,
          email: userEmail || null,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; 

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
              const event: StreamEvent = JSON.parse(data);
              handleStreamEvent(event);
            } catch (e) {
              console.error("Failed to parse stream event", e);
            }
          }
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        type: 'bot',
        text: "Connection error. Please try again later.",
        error: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      setAgentStatus(null);
      setToolsInProgress([]);
    }
  };

  const handleStreamEvent = (event: StreamEvent): void => {
    switch (event.type) {
      case 'thread_init':
        if (!threadId && event.threadId) {
          setThreadId(event.threadId);
        }
        break;

      case 'status':
        if (event.message && event.status) {
          setAgentStatus({
            message: event.message,
            status: event.status,
          });
        }
        break;

      case 'tool_start':
        if (event.tool && event.message) {
          setToolsInProgress((prev) => [
            ...prev,
            {
              tool: event.tool as string,
              message: event.message as string,
              status: 'executing',
            },
          ]);
        }
        break;

      case 'tool_complete':
        setToolsInProgress((prev) =>
          prev.map((t) =>
            t.tool === event.tool
              ? { ...t, status: 'completed', message: event.message || t.message }
              : t
          )
        );
        setTimeout(() => {
          setToolsInProgress((prev) => prev.filter((t) => t.tool !== event.tool));
        }, 2000);
        break;

      case 'answer_start':
        setAgentStatus({ message: 'Generating response...', status: 'streaming' });
        break;

      case 'answer_chunk':
        if (event.content) {
          setCurrentAnswer((prev) => prev + event.content);
        }
        break;

      case 'complete':
        const botMessage: Message = {
          type: 'bot',
          text: event.answer || '',
          sources: event.sources,
          toolsUsed: event.toolsUsed,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setCurrentAnswer('');
        setAgentStatus(null);
        break;

      case 'error':
        const errorMessage: Message = {
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

  const handleSuggestionClick = (suggestion: string): void => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageIndex: number, feedbackType: 'up' | 'down'): Promise<void> => {
    setMessageFeedback((prev) => ({
      ...prev,
      [messageIndex]: feedbackType,
    }));
    
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
    } catch (error: any) {
      console.error("Failed to submit feedback", error);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(91,50,246,0.3)] hover:bg-indigo-700 transition-all duration-300 z-50 text-sm font-semibold tracking-wide"
        >
          Ask Support
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[440px] h-[80vh] max-h-[750px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col z-50 border border-gray-200 rounded-[2rem] overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-white">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 tracking-tight">SupportFlow</h3>
              <p className="text-xs text-indigo-600 font-medium tracking-wide">AI Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-all"
            >
              Close
            </button>
          </div>

          {/* Agent Status Bar */}
          {(agentStatus || toolsInProgress.length > 0) && (
            <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100/50">
              {agentStatus && (
                <div className="flex items-center space-x-2 text-sm text-indigo-900">
                  <span className="font-medium">{agentStatus.message}</span>
                </div>
              )}
              {toolsInProgress.map((tool, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 text-xs mt-1 ${
                    tool.status === 'completed' ? 'text-indigo-900 font-medium' : 'text-indigo-600/70'
                  }`}
                >
                  <span>{tool.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-5 text-sm leading-relaxed ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-sm shadow-sm'
                      : message.error
                      ? 'bg-red-50 text-red-900 border border-red-100 rounded-[1.5rem] rounded-tl-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-[1.5rem] rounded-tl-sm'
                  }`}
                >
                  {message.type === 'user' ? (
                    <p className="whitespace-pre-wrap font-medium">{message.text}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }: any) => (
                            <a
                              {...props}
                              className="text-indigo-600 font-semibold underline decoration-1 underline-offset-2 hover:text-indigo-800 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          p: ({ node, ...props }: any) => <p {...props} className="mb-4 last:mb-0" />,
                          strong: ({ node, ...props }: any) => <strong {...props} className="font-semibold text-gray-900" />,
                          ul: ({ node, ...props }: any) => <ul {...props} className="ml-4 space-y-2 mb-4" />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Process</p>
                      {message.toolsUsed.map((tool, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mt-2 flex items-center justify-between border border-gray-100">
                          <span>{tool.tool}</span>
                          {tool.result.success && <span className="text-indigo-500 font-medium">Done</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Feedback buttons for bot messages */}
                  {message.type === 'bot' && !message.error && index !== 0 && (
                    <div className="flex items-center gap-2 mt-5">
                      <button
                        onClick={() => handleFeedback(index, 'up')}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                          messageFeedback[index] === 'up'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        Helpful
                      </button>
                      <button
                        onClick={() => handleFeedback(index, 'down')}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                          messageFeedback[index] === 'down'
                            ? 'bg-red-50 border-red-200 text-red-700 font-medium'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        Needs work
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming Answer Preview */}
            {currentAnswer && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-5 rounded-[1.5rem] rounded-tl-sm shadow-sm bg-white text-gray-800 border border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }: any) => (
                          <a
                            {...props}
                            className="text-indigo-600 font-semibold underline decoration-1 underline-offset-2 hover:text-indigo-800 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        p: ({ node, ...props }: any) => <p {...props} className="mb-4 last:mb-0" />,
                        strong: ({ node, ...props }: any) => <strong {...props} className="font-semibold text-gray-900" />,
                        ul: ({ node, ...props }: any) => <ul {...props} className="ml-4 space-y-2 mb-4" />,
                      }}
                    >
                      {currentAnswer}
                    </ReactMarkdown>
                    <span className="inline-block w-1.5 h-3 bg-indigo-400 animate-pulse ml-1 align-middle"></span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !currentAnswer && !agentStatus && (
              <div className="flex justify-start">
                <div className="bg-white px-5 py-4 rounded-[1.5rem] rounded-tl-sm shadow-sm border border-gray-200 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4 bg-white">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-white text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all font-medium shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-inner focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Support..."
                className="flex-1 px-4 py-2.5 bg-transparent focus:outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotStreaming;