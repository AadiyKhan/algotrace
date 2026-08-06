import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Minus, Terminal, Zap } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import useChatStore from '../store/useChatStore';

const parseInline = (text) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\$[^\$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-black/40 px-1 py-0.5 rounded text-amber-400 font-mono text-[11px] border border-white/10">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="text-white/80 italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return <span key={i} className="text-amber-300 font-mono text-[12px] font-bold tracking-widest">{part.slice(1, -1)}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

const parseMarkdownToReact = (text) => {
  if (!text) return null;
  
  // Split into paragraphs/blocks based on double newline
  const blocks = text.split(/\n{2,}/);
  
  return blocks.map((block, bIdx) => {
    const tBlock = block.trim();
    if (!tBlock) return null;

    if (tBlock.startsWith('```') && tBlock.endsWith('```')) {
      const code = tBlock.slice(3, -3).replace(/^[\w]+\n/, '');
      return (
        <pre key={bIdx} className="bg-black/50 p-3 rounded mt-2 mb-2 border border-white/10 overflow-x-auto text-[11px] font-mono text-amber-500">
          <code>{code}</code>
        </pre>
      );
    }

    if (tBlock.startsWith('### ')) {
      return <h3 key={bIdx} className="text-white font-bold text-sm mt-3 mb-1 uppercase tracking-wider">{parseInline(tBlock.slice(4))}</h3>;
    }
    if (tBlock.startsWith('## ')) {
      return <h2 key={bIdx} className="text-amber-500 font-bold text-sm mt-4 mb-2 uppercase tracking-widest">{parseInline(tBlock.slice(3))}</h2>;
    }
    if (tBlock.startsWith('# ')) {
      return <h1 key={bIdx} className="text-amber-500 font-black text-base mt-4 mb-2 uppercase tracking-widest">{parseInline(tBlock.slice(2))}</h1>;
    }
    if (tBlock === '---') {
      return <div key={bIdx} className="w-full h-[1px] bg-white/10 my-4" />;
    }

    if (/^(\s*[-*]|\s*\d+\.)\s/.test(tBlock)) {
      const items = tBlock.split('\n');
      return (
        <ul key={bIdx} className="list-disc list-inside space-y-1 my-2 ml-1 text-[13px] leading-relaxed">
          {items.map((item, iIdx) => {
            const cleanItem = item.replace(/^(\s*[-*]|\s*\d+\.)\s*/, '');
            return <li key={iIdx} className="pl-1 marker:text-amber-500">{parseInline(cleanItem)}</li>;
          })}
        </ul>
      );
    }

    return <p key={bIdx} className="mb-2 leading-relaxed text-[13px]">{parseInline(tBlock)}</p>;
  });
};

const ChatAssistant = ({ problemData, stepData }) => {
  const { isOpen, setIsOpen, queuedQuery, clearQueuedQuery } = useChatStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen, isMinimized]);

  // If problem changes, reset chat
  useEffect(() => {
    setMessages([]);
    setIsOpen(false);
  }, [problemData?.title]);

  const handleSend = async (e, overrideMsg = null) => {
    if (e) e.preventDefault();
    const userMsg = overrideMsg || inputValue.trim();
    if (!userMsg || isLoading) return;

    setInputValue('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const problemContext = {
        title: problemData?.title,
        difficulty: problemData?.difficulty,
        tags: problemData?.tags,
        description: problemData?.description,
      };
      
      const res = await sendChatMessage(problemContext, stepData, messages, userMsg);
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.slice(0, -1)); // Remove the user message on error
    } finally {
      setIsLoading(false);
    }
  };

  // Process queued queries
  useEffect(() => {
    if (queuedQuery) {
      handleSend(null, queuedQuery);
      clearQueuedQuery();
      setIsMinimized(false);
    }
  }, [queuedQuery, isLoading]);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-black rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow flex items-center justify-center gap-2 group border-[2px] border-amber-400"
      >
        <Zap size={20} className="fill-black group-hover:animate-pulse" />
        <span className="font-mono font-black text-[12px] uppercase tracking-widest hidden group-hover:block pr-2">Ask AI</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`fixed bottom-6 right-6 z-50 bg-[#050505] border-[2px] border-white/20 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-[320px] h-[52px]' : 'w-[400px] h-[550px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div 
        className="h-12 border-b-[2px] border-white/20 flex items-center justify-between px-4 bg-[#0a0a0b] shrink-0 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-amber-500" />
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white/80">
            AI Assistant
          </span>
          <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold">BETA</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="text-white/40 hover:text-amber-500 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#050505]">
            {messages.length === 0 && (
              <div className="m-auto text-center flex flex-col items-center gap-3 opacity-50">
                <Zap size={32} className="text-amber-500 fill-amber-500/20" />
                <p className="font-mono text-[11px] uppercase tracking-widest text-white/60 leading-relaxed">
                  I know the exact problem you are solving and your current step.
                  <br /><br />
                  Ask me anything!
                </p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-white/30">
                    {msg.role === 'user' ? 'YOU' : 'AI'}
                  </span>
                </div>
                <div 
                  className={`max-w-[85%] p-3 text-[13px] leading-relaxed font-sans ${
                    msg.role === 'user' 
                      ? 'bg-white/10 border-[1px] border-white/20 text-white rounded-l-lg rounded-br-lg' 
                      : 'bg-amber-500/10 border-[1px] border-amber-500/50 text-white/90 rounded-r-lg rounded-bl-lg'
                  }`}
                >
                  {parseMarkdownToReact(msg.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-amber-500/70">
                    AI IS THINKING...
                  </span>
                </div>
                <div className="max-w-[85%] p-4 bg-amber-500/5 border-[1px] border-amber-500/20 rounded-r-lg rounded-bl-lg flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center font-mono text-[10px] text-red-500 uppercase tracking-widest p-2 border border-red-500/20 bg-red-500/10">
                Error: {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t-[2px] border-white/20 bg-[#0a0a0b] shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Type your question..."
                className="w-full bg-[#050505] border-[2px] border-white/20 text-white placeholder-white/30 text-[13px] px-4 py-3 pr-12 focus:outline-none focus:border-amber-500 transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 text-white/50 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-white/50 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatAssistant;
