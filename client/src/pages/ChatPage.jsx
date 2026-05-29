import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles,
  Bot,
  User,
  Loader
} from 'lucide-react';
import API from '../services/api';

const parseBold = (content, isBot) => {
  return content.split('**').map((chunk, j) => {
    if (j % 2 === 1) {
      return (
        <strong 
          key={j} 
          className={isBot ? 'text-emerald-400 font-extrabold' : 'text-slate-950 font-black'}
        >
          {chunk}
        </strong>
      );
    }
    return chunk;
  });
};

const renderFormattedMessage = (text, isBot) => {
  if (!text) return null;
  
  return text.split('\n').map((line, idx) => {
    let cleanLine = line.trim();
    
    // 1. Horizontal rules / Dividers
    if (cleanLine === '---') {
      return <hr key={idx} className="my-4 border-slate-800" />;
    }
    
    // 2. Headings
    if (cleanLine.startsWith('### ')) {
      const title = cleanLine.replace('### ', '');
      return (
        <h4 key={idx} className="text-base font-bold text-emerald-400 mt-4 mb-2">
          {parseBold(title, isBot)}
        </h4>
      );
    }
    if (cleanLine.startsWith('## ')) {
      const title = cleanLine.replace('## ', '');
      return (
        <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-2">
          {parseBold(title, isBot)}
        </h3>
      );
    }
    
    // 3. Bullet lists
    if (cleanLine.startsWith('* ') || cleanLine.startsWith('• ') || cleanLine.startsWith('- ')) {
      const content = cleanLine.replace(/^[\*\•\-]\s+/, '');
      return (
        <div key={idx} className="flex gap-2 items-start ml-2 my-1 text-sm">
          <span className="text-emerald-400 select-none">•</span>
          <span className="flex-1 text-slate-200">{parseBold(content, isBot)}</span>
        </div>
      );
    }
    
    // 4. Default paragraphs
    if (cleanLine === '') {
      return <div key={idx} className="h-2" />;
    }
    
    return (
      <p key={idx} className="mt-1 text-sm text-slate-250 leading-relaxed">
        {parseBold(line, isBot)}
      </p>
    );
  });
};

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Welcome to your AI Health Q&A Assistant! Ask me any general health, nutrition, or exercise question. I will give you a short, concise, and on-point answer instantly.\n\n*(Note: To create or modify your personalized diet plan, please click the floating **AI Chat Coach** button in the bottom-right corner!)*"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue || inputValue.trim() === '' || loading) return;

    const userText = inputValue;
    setInputValue('');

    const userMsg = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await API.post('/diet/quick-qa', {
        text: userText,
        history: messages.slice(1) // exclude first bot welcome message
      });

      if (data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Failed to get a response. Please try again.' }]);
      }
    } catch (err) {
      console.error('Quick QA error:', err);
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: '⚠️ Error communicating with the AI. Please check your internet connection and API keys.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      
      {/* Top navbar */}
      <header className="px-8 py-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex justify-between items-center relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">AI Health Q&A Assistant</h2>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Q&A Session (Powered by Groq)
            </p>
          </div>
        </div>
      </header>

      {/* Main chat window */}
      <main className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar relative z-10">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={idx}
                className={`flex gap-4 max-w-3xl ${isBot ? 'self-start' : 'self-end flex-row-reverse animate-fade-in'}`}
              >
                {/* Profile image */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                  isBot 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}>
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message text */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isBot 
                    ? 'bg-slate-900/40 border border-slate-800/80 text-slate-200 shadow-md' 
                    : 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-950/20'
                }`}>
                  {renderFormattedMessage(msg.text, isBot)}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-4 max-w-3xl self-start">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl text-sm bg-slate-900/40 border border-slate-800/80 text-slate-400 flex items-center gap-3">
                <Loader size={12} className="animate-spin text-emerald-400 animate-pulse" />
                <span className="font-semibold text-xs animate-pulse text-emerald-400">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input section */}
      <footer className="p-6 border-t border-slate-900 bg-slate-950/95 relative z-10 shrink-0 flex flex-col gap-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full flex flex-col gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              disabled={loading}
              placeholder="Ask a general health/fitness question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full glass-input pl-5 pr-14 py-4 rounded-2xl outline-none text-sm font-semibold disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="absolute right-3 p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-650 rounded-xl transition-all duration-200 glow-emerald disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </footer>

    </div>
  );
};

export default ChatPage;
