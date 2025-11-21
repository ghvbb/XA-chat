import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../constants';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser, registerUser, setCurrentUser, createChat, users } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) return;

    if (isLogin) {
       if (name === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          // Admin login bypass
          let admin = users.find(u => u.name === ADMIN_USERNAME);
          if (!admin) {
             admin = registerUser(ADMIN_USERNAME, ADMIN_PASSWORD);
          }
          setCurrentUser(admin);
          return;
       }

       const user = loginUser(name, password);
       if (user) {
         setCurrentUser(user);
       } else {
         alert("Invalid credentials");
       }
    } else {
       const existing = users.find(u => u.name === name);
       if (existing) {
         alert("Username taken");
         return;
       }
       const newUser = registerUser(name, password);
       
       // Auto-create AI Chat
       let aiUser = users.find(u => u.name === 'ChatXA AI');
       if (!aiUser) {
         aiUser = registerUser('ChatXA AI', 'ai-secure-pass');
       }
       createChat([newUser.id, aiUser.id]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5EE] relative overflow-hidden">
       <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#1D503A]/20 rounded-full blur-3xl"></div>
       <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#6c7d36]/20 rounded-full blur-3xl"></div>
       
       <div className="liquid-glass p-8 rounded-2xl w-full max-w-md shadow-2xl z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1D503A] text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-4 transform rotate-180">A</div>
            <h2 className="text-3xl font-serif font-bold text-[#1D503A]">{isLogin ? 'Welcome Back' : 'Join ChatXA'}</h2>
            <p className="text-gray-500 mt-2">Experience the Winzy flow.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-bold text-[#1D503A] mb-1">Username</label>
               <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full p-3 rounded-lg bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#6c7d36]"
                 placeholder="Enter your unique name"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-[#1D503A] mb-1">Password</label>
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-3 rounded-lg bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#6c7d36]"
                 placeholder="••••••••"
               />
             </div>
             
             <button type="submit" className="w-full bg-[#1D503A] text-white py-3 rounded-lg font-bold hover:bg-[#06392f] transition-all transform hover:scale-[1.02]">
                {isLogin ? 'Login' : 'Create Account'}
             </button>
          </form>

          <div className="mt-6 text-center">
             <button onClick={() => setIsLogin(!isLogin)} className="text-[#6c7d36] font-semibold hover:underline">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
             </button>
          </div>
       </div>
    </div>
  );
};

export default Auth;