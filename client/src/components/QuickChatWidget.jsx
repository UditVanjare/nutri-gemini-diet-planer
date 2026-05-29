import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  Loader,
  RefreshCw,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
      return <hr key={idx} className="my-3 border-slate-800" />;
    }
    
    // 2. Headings
    if (cleanLine.startsWith('### ')) {
      const title = cleanLine.replace('### ', '');
      return (
        <h4 key={idx} className="text-xs font-bold text-emerald-400 mt-3 mb-1.5">
          {parseBold(title, isBot)}
        </h4>
      );
    }
    if (cleanLine.startsWith('## ')) {
      const title = cleanLine.replace('## ', '');
      return (
        <h3 key={idx} className="text-sm font-bold text-white mt-3 mb-1.5">
          {parseBold(title, isBot)}
        </h3>
      );
    }
    
    // 3. Bullet lists
    if (cleanLine.startsWith('* ') || cleanLine.startsWith('• ') || cleanLine.startsWith('- ')) {
      const content = cleanLine.replace(/^[\*\•\-]\s+/, '');
      return (
        <div key={idx} className="flex gap-2 items-start ml-1 my-0.5 text-xs">
          <span className="text-emerald-400 select-none">•</span>
          <span className="flex-1 text-slate-200">{parseBold(content, isBot)}</span>
        </div>
      );
    }
    
    // 4. Default paragraphs
    if (cleanLine === '') {
      return <div key={idx} className="h-1.5" />;
    }
    
    return (
      <p key={idx} className="mt-1 text-xs text-slate-250 leading-normal">
        {parseBold(line, isBot)}
      </p>
    );
  });
};

const QuickChatWidget = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState('Offline');
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef(null);

  // Fetch session
  const fetchSession = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get('/diet/chat');
      if (data.success) {
        setMessages(data.session.messages);
        setCurrentStep(data.session.currentStep);
        setProvider(data.provider || 'Offline');
      }
    } catch (err) {
      console.error('Error fetching chat session:', err);
      setError('Failed to load chat coach session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSession();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiGenerating, isOpen]);

  if (!isOpen) return null;

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text || text.trim() === '') return;

    setInputValue('');
    setError('');
    
    if (currentStep >= 9) {
      setAiGenerating(true);
    }

    try {
      const { data } = await API.post('/diet/chat/message', { text });
      if (data.success) {
        setMessages(data.session.messages);
        setCurrentStep(data.session.currentStep);
        setProvider(data.provider || 'Offline');
        if (data.dietPlan) {
          setGeneratedPlan(data.dietPlan);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Error communicating.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Reset chat
  const handleResetChat = async () => {
    if (window.confirm('Are you sure you want to clear your current progress and restart the questionnaire?')) {
      try {
        setLoading(true);
        setGeneratedPlan(null);
        setError('');
        const { data } = await API.post('/diet/chat/reset');
        if (data.success) {
          setMessages(data.session.messages);
          setCurrentStep(data.session.currentStep);
          setProvider(data.provider || 'Offline');
        }
      } catch (err) {
        console.error('Error resetting chat:', err);
        setError('Failed to restart session.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Quick Select Buttons
  const renderQuickSelectOptions = () => {
    switch (currentStep) {
      case 1: // Gender
        return ['Male', 'Female', 'Other'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSendMessage(opt)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-[10px] transition-all duration-200 cursor-pointer"
          >
            {opt}
          </button>
        ));
      case 5: // Goal
        return ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSendMessage(opt)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-[10px] transition-all duration-200 cursor-pointer"
          >
            {opt}
          </button>
        ));
      case 6: // Activity Level
        return ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSendMessage(opt)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-[10px] transition-all duration-200 cursor-pointer"
          >
            {opt}
          </button>
        ));
      case 7: // Dietary Preference
        return ['Vegetarian', 'Vegan', 'Non-Vegetarian'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSendMessage(opt)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-[10px] transition-all duration-200 cursor-pointer"
          >
            {opt}
          </button>
        ));
      case 8: // Allergies
      case 9: // Medical Restrictions
        return ['None'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSendMessage(opt)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700 rounded-xl font-bold text-[10px] transition-all duration-200 cursor-pointer"
          >
            {opt}
          </button>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[420px] sm:w-[485px] h-[580px] rounded-2xl bg-slate-900/95 border border-slate-800/90 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden backdrop-blur-md animate-fade-in font-sans">
      
      {/* Widget Header */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">AI Diet & Fitness Coach ({provider})</h3>
            <p className="text-[9px] text-slate-400">Biometrics intake & workout planning</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={handleResetChat} 
            title="Reset Questionnaire"
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <RefreshCw size={12} />
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Widget Messages */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-slate-900/40 animate-fade-in">
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold">{error}</div>}
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader className="animate-spin text-emerald-400" size={24} />
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[90%] ${isBot ? 'self-start' : 'self-end flex-row-reverse animate-fade-in'}`}
              >
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border text-[10px] ${
                  isBot 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}>
                  {isBot ? <Bot size={13} /> : <User size={13} />}
                </div>
                <div className={`p-3 rounded-2xl leading-relaxed ${
                  isBot 
                    ? 'bg-slate-900/60 border border-slate-800 text-slate-200 shadow-md' 
                    : 'bg-emerald-500 text-slate-950 font-semibold'
                }`}>
                  {renderFormattedMessage(msg.text, isBot)}
                </div>
              </div>
            );
          })
        )}

        {aiGenerating && (
          <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Bot size={13} />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 flex items-center gap-2 text-xs">
              <Loader size={12} className="animate-spin text-emerald-400" />
              Dietitian is analyzing your profile & formulating...
            </div>
          </div>
        )}

        {/* Success Plan Card inside widget */}
        {generatedPlan && (
          <div className="self-center w-full max-w-xs glass-panel p-4 rounded-xl border border-emerald-500/25 shadow-xl flex flex-col items-center text-center gap-3 my-2 animate-fade-in">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-full">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Diet Plan Ready!</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Calorie target: <span className="text-emerald-400 font-bold">{generatedPlan.generatedPlan.calories} kcal</span></p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link 
                to="/dashboard"
                onClick={onClose}
                className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs text-center transition-all duration-200"
              >
                Go to Dashboard
              </Link>
              <Link 
                to="/plans"
                onClick={onClose}
                className="py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-lg text-xs text-center transition-all duration-200 flex justify-center items-center gap-1"
              >
                <ClipboardList size={12} /> View Plan details
              </Link>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Widget Input/Quick Select Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-2 shrink-0">
        
        {/* Render quick select buttons inside the form footer */}
        {currentStep < 10 && !loading && (
          <div className="flex flex-wrap gap-1.5 justify-center py-1">
            {renderQuickSelectOptions()}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="flex gap-2"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={currentStep >= 10 ? "Ask your AI Diet Coach anything..." : "Reply to the coach..."}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-250 focus:outline-none placeholder-slate-500 disabled:opacity-50"
            disabled={loading || aiGenerating}
          />
          <button 
            type="submit" 
            disabled={loading || aiGenerating || !inputValue.trim()}
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickChatWidget;
