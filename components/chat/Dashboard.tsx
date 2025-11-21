import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../constants';
import { MessageType } from '../../types';

const Dashboard: React.FC = () => {
  const { currentUser, users, messages, createChat } = useAppStore();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Initialize AI Chat if not exists
  useEffect(() => {
    const initAI = async () => {
      let aiUser = users.find(u => u.name === 'ChatXA AI');
      if (!aiUser) {
         // AI logic handled via service, but we need a user placeholder in store to render chat
         // Since registerUser adds to store, we skip manual add here or rely on pre-seed
         // For this demo, we assume the first user to register triggers AI creation or we just create chat visually
      }
    };
    initAI();
  }, [users]);

  const isAdmin = currentUser?.name === ADMIN_USERNAME;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar: Hidden on mobile if chat selected */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} h-full`}>
        <Sidebar onSelectChat={setSelectedChatId} />
      </div>

      {/* Chat Window: Hidden on mobile if no chat selected */}
      <div className={`flex-1 h-full relative ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {selectedChatId ? (
          <div className="w-full h-full flex flex-col">
            <div className="md:hidden absolute top-4 left-4 z-50">
               <button onClick={() => setSelectedChatId(null)} className="bg-black/50 text-white px-3 py-1 rounded-full">Back</button>
            </div>
            <ChatWindow chatId={selectedChatId} />
          </div>
        ) : (
          <div className="w-full h-full bg-[#f0f2f5] dark:bg-[#222e35] flex flex-col items-center justify-center border-b-[6px] border-[#25d366]">
            <h1 className="text-4xl text-[#41525d] font-light mb-4">ChatXA Web</h1>
            <p className="text-[#667781]">Send and receive messages without keeping your phone online.</p>
            <p className="text-[#667781] mt-2">Use ChatXA on up to 4 linked devices and 1 phone.</p>
            {isAdmin && (
               <button 
                 onClick={() => setShowAdminPanel(true)} 
                 className="mt-10 bg-red-800 text-white px-6 py-3 rounded shadow-xl"
               >
                 ACCESS GOD MODE
               </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Panel Overlay */}
      {showAdminPanel && isAdmin && (
        <div className="fixed inset-0 z-[100] bg-black/90 text-green-400 p-10 overflow-auto font-mono">
          <div className="flex justify-between mb-8">
             <h1 className="text-3xl font-bold">ADMINISTRATOR CONSOLE</h1>
             <button onClick={() => setShowAdminPanel(false)} className="border border-green-400 px-4 hover:bg-green-400 hover:text-black">CLOSE</button>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
             <div className="border border-green-800 p-4">
                <h2 className="text-xl border-b border-green-800 mb-4">ALL USERS ({users.length})</h2>
                {users.map(u => (
                  <div key={u.id} className="mb-2 flex justify-between">
                    <span>{u.name}</span>
                    <span className="text-xs opacity-50">{u.password}</span>
                  </div>
                ))}
             </div>
             <div className="border border-green-800 p-4">
                <h2 className="text-xl border-b border-green-800 mb-4">ALL MESSAGES ({messages.length})</h2>
                {messages.slice(-50).reverse().map(m => (
                   <div key={m.id} className="mb-2 text-xs">
                     <span className="text-yellow-600">[{users.find(u=>u.id===m.senderId)?.name}]</span>: {m.type === MessageType.TEXT ? m.content : '[MEDIA]'}
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;