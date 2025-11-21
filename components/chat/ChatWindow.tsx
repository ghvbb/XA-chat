import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { MessageType, Message } from '../../types';
import { generateAIResponse } from '../../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  chatId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const { chats, messages, currentUser, sendMessage, users } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const chatMessages = messages.filter(m => m.chatId === chatId);
  
  // Determine chat partner (if not group)
  const partnerId = !chat?.isGroup ? chat?.participants.find(p => p !== currentUser?.id) : null;
  const partner = users.find(u => u.id === partnerId);

  // Is this the AI chat?
  const isAIChat = chat?.isGroup === false && partner?.name === 'ChatXA AI';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    sendMessage(chatId, inputValue, MessageType.TEXT);
    setInputValue('');

    if (isAIChat) {
      setAiThinking(true);
      const history = chatMessages.slice(-5).map(m => 
        `${m.senderId === currentUser?.id ? 'User' : 'AI'}: ${m.content}`
      );
      const response = await generateAIResponse(inputValue, history);
      setAiThinking(false);
      
      // Simulate receive delay
      sendMessage(chatId, response, MessageType.TEXT);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendMessage(chatId, base64Audio, MessageType.AUDIO, recordingTime);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      alert("Microphone permission needed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const content = reader.result as string;
      const type = file.type.startsWith('image/') ? MessageType.IMAGE : MessageType.VIDEO;
      sendMessage(chatId, content, type);
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!chat) return <div className="flex items-center justify-center h-full text-gray-500">Select a chat to start messaging</div>;

  return (
    <div className="flex flex-col h-full relative bg-[#efe7dd] dark:bg-[#0b1e18] bg-[url('https://www.transparenttextures.com/patterns/subtle-dark-vertical.png')]">
      
      {/* Header */}
      <div className="p-4 liquid-glass flex items-center gap-4 z-10 text-[#1D503A] dark:text-[#FAF5EE]">
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
          {chat.isGroup ? (
             <img src={chat.groupAvatar} alt="Group" className="w-full h-full object-cover" />
          ) : (
             <img src={partner?.avatar || 'https://via.placeholder.com/40'} alt="User" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h2 className="font-bold">{chat.isGroup ? chat.groupName : partner?.name}</h2>
          <p className="text-xs opacity-70">{isAIChat ? "Powered by Gemini" : (partner?.isOnline ? "Online" : "Offline")}</p>
        </div>
        <div className="ml-auto flex gap-4">
            <button className="p-2 hover:bg-black/10 rounded-full">📞</button>
            <button className="p-2 hover:bg-black/10 rounded-full">📹</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const isAI = !isMe && isAIChat;

          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[70%] rounded-lg p-3 shadow-md relative overflow-hidden
                  ${isMe ? 'bg-[#1D503A] text-[#FAF5EE]' : isAI ? 'liquid-glass text-[#1D503A] dark:text-white border-blue-400/30' : 'bg-white dark:bg-[#1f2c34] dark:text-white'}
                `}
              >
                {/* Liquid Shimmer for AI */}
                {isAI && (
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer pointer-events-none"></div>
                )}

                {/* Name in Group */}
                {chat.isGroup && !isMe && (
                  <p className="text-xs font-bold text-[#6c7d36] mb-1">
                    {users.find(u => u.id === msg.senderId)?.name || 'Unknown'}
                  </p>
                )}

                {/* Content Types */}
                {msg.type === MessageType.TEXT && <p className="whitespace-pre-wrap relative z-10">{msg.content}</p>}
                
                {msg.type === MessageType.IMAGE && (
                  <img src={msg.content} alt="Shared" className="rounded-lg max-w-full h-auto" />
                )}
                
                {msg.type === MessageType.VIDEO && (
                  <video src={msg.content} controls className="rounded-lg max-w-full h-auto" />
                )}

                {msg.type === MessageType.AUDIO && (
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <span className="text-xl">▶️</span>
                    <div className="h-1 bg-current opacity-50 flex-1 rounded-full"></div>
                    <span className="text-xs">{formatTime(msg.duration || 0)}</span>
                    <audio src={msg.content} className="hidden" />
                  </div>
                )}

                <span className="text-[10px] opacity-70 block text-right mt-1 relative z-10">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
        
        {aiThinking && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="liquid-glass p-3 rounded-lg">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-[#6c7d36] rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-[#6c7d36] rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-[#6c7d36] rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 liquid-glass flex items-center gap-2 z-10">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-[#1D503A] dark:text-white hover:bg-white/10 rounded-full transition">
          📎
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*" 
          onChange={handleFileUpload}
        />
        
        <div className="flex-1 bg-white dark:bg-[#1f2c34] rounded-full px-4 py-2 flex items-center shadow-inner">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message"
            className="flex-1 bg-transparent outline-none text-black dark:text-white"
            disabled={isRecording}
          />
        </div>

        {inputValue.trim() ? (
          <button 
            onClick={handleSend}
            className="p-3 bg-[#1D503A] text-white rounded-full hover:scale-110 transition transform"
          >
            ➤
          </button>
        ) : (
          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-3 rounded-full transition transform ${isRecording ? 'bg-red-500 scale-125' : 'bg-[#1D503A]'} text-white`}
          >
            {isRecording ? formatTime(recordingTime) : '🎤'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;