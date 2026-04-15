import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Loader2, ArrowRight, Droplets, Cpu, Activity, TriangleAlert } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { PasswordLoginInput } from '../auth/sessionTypes';

const loginWavePaths = [
  "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,144C960,117,1056,107,1152,128C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
] as const;

interface LoginProps {
  onLogin: (input: PasswordLoginInput) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const LoginView: React.FC<LoginProps> = ({ onLogin, loading = false, error }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  
  // Mouse parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);
  
  const bgX = useTransform(dx, [-500, 500], [20, -20]);
  const bgY = useTransform(dy, [-500, 500], [20, -20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin({
      username,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Immersive Tech Background */}
      <motion.div 
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 z-0"
      >
        {/* Animated Water Waves (SVG) */}
        <div className="absolute bottom-0 left-0 w-full opacity-20">
          <svg className="w-full h-96" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              d={loginWavePaths[0]}
              initial={{ d: loginWavePaths[0] }}
              animate={{ 
                d: loginWavePaths
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              fill="#3b82f6"
            />
          </svg>
        </div>

        {/* Digital Grid */}
        <div className="absolute inset-0 bg-[url('/assets/carbon-fibre.svg')] bg-[length:160px_160px] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-primary/40" />
        
        {/* Flowing Data Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent w-full"
              style={{ top: `${20 * (i + 1)}%` }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear", delay: i }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5
            }}
            animate={{ 
              y: [null, "-100%"],
              opacity: [0, 0.5, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: Math.random() * 10 + 15, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Glassmorphism Container */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(227,86,0,0.12)] overflow-hidden relative group">
          {/* Animated Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E35600]/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          {/* Header Section */}
          <div className="p-10 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#E35600] to-transparent" />
            
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-[#E35600]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E35600]/20 relative group/icon"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 180 }}
                className="relative z-10"
              >
                <Droplets className="text-[#E35600]" size={44} />
              </motion.div>
              <div className="absolute inset-0 rounded-full border-2 border-[#E35600]/10 animate-[ping_3s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-[#E35600]/5 animate-[ping_4s_linear_infinite_1s]" />
              
              {/* Liquid Fill Effect Mockup */}
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[#E35600]/5 rounded-b-full blur-xl" />
            </motion.div>
            
            <div className="mb-8">
              <motion.h1 
                initial={{ letterSpacing: "0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.05em", opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-3xl font-black text-white tracking-tight mb-2"
              >
                乐源智慧水务
              </motion.h1>
              <div className="flex items-center justify-center gap-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  className="h-[1px] bg-gradient-to-r from-transparent to-[#E35600]/50" 
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  className="h-[1px] bg-gradient-to-l from-transparent to-[#E35600]/50" 
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-8">
            <div className="space-y-5">
              <motion.div 
                whileHover={{ x: 5 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <label className="text-[11px] font-bold text-primary/70 tracking-widest flex items-center gap-2">
                    <Activity size={12} className="animate-pulse" />
                    账号 / USERNAME
                  </label>
                  <Cpu size={12} className="text-primary/30" />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full pl-12 pr-4 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-medium text-sm"
                    placeholder="请输入登录账号"
                    autoComplete="username"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ x: 5 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <label className="text-[11px] font-bold text-primary/70 tracking-widest flex items-center gap-2">
                    <Shield size={12} />
                    密码 / PASSWORD
                  </label>
                  <Lock size={12} className="text-primary/30" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full pl-12 pr-4 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 outline-none transition-all font-medium text-sm"
                    placeholder="请输入登录密码"
                    autoComplete="current-password"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </motion.div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 flex items-start gap-3">
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-rose-300" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-xs">
              <motion.label 
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 text-white cursor-pointer select-none"
              >
                <input 
                  type="checkbox" 
                  className="rounded border-2 border-white/40 bg-white/10 text-primary w-4 h-4 accent-white focus:ring-2 focus:ring-white/30 focus:ring-offset-0" 
                />
                <span className="font-medium text-white/95 hover:text-white transition-colors">记住密码</span>
              </motion.label>
              <motion.a 
                whileHover={{ scale: 1.05, color: 'var(--primary-color)' }}
                href="#" 
                className="text-primary/80 transition-colors font-medium"
              >
                忘记密码?
              </motion.a>
            </div>

            <button 
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group disabled:opacity-70 shadow-[0_10px_30px_-10px_rgba(0,85,150,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <span className="tracking-[0.2em] font-black text-sm uppercase">进入生产系统</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
