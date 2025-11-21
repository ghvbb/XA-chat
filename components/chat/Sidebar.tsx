import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { MessageType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onSelectChat: (id: string) => void;
}

type Tab = 'chats' | 'status' | 'calls' | 'contacts' | 'settings';

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat }) => {
  const { chats, users, currentUser, statuses, addStatus, sendContactRequest, contactRequests, acceptContactRequest, theme, setTheme } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFile, setStatusFile] = useState<File | null>(null);

  const filteredChats = chats.filter(c => {
     if (c.isGroup) return c.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
     const otherId = c.participants.find(p => p !== currentUser?.id);
     const other = users.find(u => u.id === otherId);
     return other?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const reader = new FileReader();
       reader.onload = () => {
         const type = file.type.startsWith('image') ? MessageType.IMAGE : MessageType.VIDEO;
         addStatus(reader.result as string, type);
       };
       reader.readAsDataURL(file);
    }
  };

  const handleContactSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const success = sendContactRequest(searchTerm);
    if (success) alert("Request sent!");
    else alert("User not found or already added.");
  };

  return (
    <div className="w-full md:w-[400px] h-full flex flex-col border-r border-white/10 bg-white dark:bg-[#111b21] dark:text-gray-100 relative z-20">
      
      {/* Sidebar Header */}
      <div className="p-4 bg-[#FAF5EE] dark:bg-[#1f2c34] flex justify-between items-center shadow-md">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
           <img src={currentUser?.avatar} alt="Me" />
        </div>
        <div className="flex gap-4 text-[#1D503A] dark:text-gray-300">
           <button onClick={() => setActiveTab('status')} title="Status">◎</button>
           <button onClick={() => setActiveTab('chats')} title="Chats">💬</button>
           <button onClick={() => setActiveTab('contacts')} title="Add Contact">➕</button>
           <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
             {theme === 'light' ? '🌙' : '☀️'}
           </button>
           <button onClick={() => setActiveTab('settings')}>⋮</button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-white dark:bg-[#111b21]">
        <input 
          type="text" 
          placeholder="Search or start new chat" 
          className="w-full p-2 rounded-lg bg-[#f0f2f5] dark:bg-[#1f2c34] outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        
        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="flex flex-col">
            {filteredChats.map(chat => {
              const partnerId = !chat.isGroup ? chat.participants.find(p => p !== currentUser?.id) : null;
              const partner = users.find(u => u.id === partnerId);
              const name = chat.isGroup ? chat.groupName : partner?.name;
              const avatar = chat.isGroup ? chat.groupAvatar : partner?.avatar;

              return (
                <motion.div 
                  key={chat.id}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className="font-semibold truncate">{name}</h4>
                      <span className="text-xs text-gray-500">
                         {chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage?.content.startsWith('data:') ? 'Media File' : chat.lastMessage?.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-6 cursor-pointer relative">
               <div className="w-12 h-12 rounded-full bg-[#1D503A] flex items-center justify-center text-white relative">
                 +
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAddStatus} accept="image/*,video/*" />
               </div>
               <div>
                 <h4 className="font-bold">My Status</h4>
                 <p className="text-sm text-gray-500">Tap to add status update</p>
               </div>
            </div>
            <h5 className="text-sm font-bold text-gray-500 mb-2">Recent Updates</h5>
            {statuses.map(status => (
              <div key={status.id} className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full border-2 border-[#6c7d36] p-[2px]">
                    <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden">
                      {status.type === MessageType.IMAGE ? (
                        <img src={status.content} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">VID</div>
                      )}
                    </div>
                 </div>
                 <div>
                    <h4 className="font-semibold">{users.find(u => u.id === status.userId)?.name}</h4>
                    <p className="text-xs text-gray-500">{new Date(status.timestamp).toLocaleTimeString()}</p>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
           <div className="p-4">
             <h3 className="font-bold mb-4">Add Contact</h3>
             <form onSubmit={handleContactSearch} className="flex gap-2 mb-6">
               <input 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                placeholder="Enter exact username" 
                className="flex-1 border p-2 rounded text-black"
               />
               <button type="submit" className="bg-[#1D503A] text-white px-4 rounded">Add</button>
             </form>

             <h3 className="font-bold mb-2">Pending Requests</h3>
             {contactRequests.filter(r => r.toUserId === currentUser?.id).length === 0 && <p className="text-sm text-gray-400">No pending requests.</p>}
             {contactRequests.filter(r => r.toUserId === currentUser?.id).map(req => (
               <div key={req.id} className="flex justify-between items-center bg-gray-100 dark:bg-[#1f2c34] p-2 rounded mb-2">
                 <span>{users.find(u => u.id === req.fromUserId)?.name} wants to connect</span>
                 <button onClick={() => acceptContactRequest(req.id)} className="text-green-600 font-bold">Accept</button>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;