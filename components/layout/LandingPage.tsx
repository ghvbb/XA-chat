import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, Stars, MeshTransmissionMaterial } from '@react-three/drei';
import { LANDING_CONTENT_SECTIONS } from '../../constants';
import { GlassCard } from '../ui/GlassCard';

// 3D Logo Component
const Logo3D = () => {
  const meshRef = useRef<any>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* @ts-ignore */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        {/* @ts-ignore */}
        <torusKnotGeometry args={[1.5, 0.4, 100, 16]} />
        <MeshTransmissionMaterial 
          backside
          samples={4}
          thickness={2}
          chromaticAberration={0.5}
          anisotropy={0.5}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#6c7d36"
        />
      {/* @ts-ignore */}
      </mesh>
    </Float>
  );
};

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF5EE] dark:bg-[#06392f] text-[#1D503A] dark:text-[#FAF5EE] transition-colors duration-500 overflow-hidden relative">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex justify-between items-center liquid-glass">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1D503A] rounded-full flex items-center justify-center text-white font-serif font-bold text-xl transform rotate-180">
            A
          </div>
          <span className="font-bold text-xl tracking-tighter">ChatXA</span>
        </div>
        <div className="flex gap-6 text-sm font-semibold">
          <a href="https://www.youtube.com/@Mohamedxa-shorts" target="_blank" rel="noreferrer" className="hover:text-[#6c7d36] transition-colors">YouTube</a>
          <a href="https://github.com/ghvbb" target="_blank" rel="noreferrer" className="hover:text-[#6c7d36] transition-colors">GitHub</a>
          <a href="https://x.com/BallLibya6983" target="_blank" rel="noreferrer" className="hover:text-[#6c7d36] transition-colors">X (Twitter)</a>
          <button onClick={onStart} className="bg-[#1D503A] text-white px-6 py-2 rounded-full hover:bg-[#6c7d36] transition-colors">
            Start Chatting
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Canvas>
             {/* @ts-ignore */}
             <ambientLight intensity={0.5} />
             {/* @ts-ignore */}
             <directionalLight position={[10, 10, 5]} intensity={1} />
             <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
             <Logo3D />
          </Canvas>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-7xl md:text-9xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#1D503A] to-[#6c7d36] dark:from-[#FAF5EE] dark:to-[#6c7d36]"
          >
            WINZY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl mb-12 font-light leading-relaxed"
          >
            The Future of Liquid Communication. Powered by Gemini AI. <br/>
            Connect. Share. Experience.
          </motion.p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="bg-gradient-to-r from-[#1D503A] to-[#06392f] text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:shadow-[#6c7d36]/50 transition-all"
          >
            Enter App
          </motion.button>
        </div>
      </header>

      {/* Content Sections (Detailed Text) */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {LANDING_CONTENT_SECTIONS.map((section, idx) => (
          <GlassCard key={idx} delay={idx * 0.2} className="h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-4 font-serif text-[#1D503A] dark:text-[#FAF5EE]">{section.title}</h3>
            <div className="text-sm leading-relaxed opacity-80 flex-grow">
              {section.content.substring(0, 150)}...
            </div>
            <button 
              onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
              className="mt-4 text-[#6c7d36] font-bold text-sm hover:underline self-start"
            >
              {expandedSection === idx ? "Read Less" : "Read More"}
            </button>
            {expandedSection === idx && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 text-sm leading-relaxed opacity-90 border-t border-current pt-4"
              >
                {section.content}
              </motion.div>
            )}
          </GlassCard>
        ))}
      </section>

      {/* Feature Scroll Stack */}
      <section className="py-20 bg-[#1D503A] text-[#FAF5EE] relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-5xl font-serif font-bold mb-16 text-center">Why ChatXA?</h2>
            
            <div className="space-y-24">
               {[
                 { title: "Real-Time Voice", desc: "Crystal clear audio transmission using webRTC simulation technologies.", icon: "🎙️" },
                 { title: "Liquid Interface", desc: "A UI that flows like water. Glass-morphism taken to the extreme.", icon: "💧" },
                 { title: "AI Assistant", desc: "Integrated directly into your chat list. Ask anything, anytime.", icon: "🤖" },
                 { title: "Secure Status", desc: "Share moments with videos, photos, and text that disappear.", icon: "⭕" }
               ].map((feature, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex items-center gap-8 ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}
                 >
                    <div className="text-8xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-4xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-xl opacity-80 max-w-md">{feature.desc}</p>
                      <p className="mt-4 text-sm opacity-60">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#06392f] text-[#FAF5EE] py-10 text-center border-t border-[#6c7d36]">
        <p className="mb-2">&copy; 2024 Company XA. All rights reserved.</p>
        <p className="text-sm opacity-50">Powered by React, Three.js, Gemini API</p>
        <div className="mt-4 flex justify-center gap-4">
           <a href="https://discord.gg/ufx5c4pg6" className="hover:text-[#6c7d36]">Discord</a>
           <span>|</span>
           <a href="#" className="hover:text-[#6c7d36]">Terms</a>
           <span>|</span>
           <a href="#" className="hover:text-[#6c7d36]">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;