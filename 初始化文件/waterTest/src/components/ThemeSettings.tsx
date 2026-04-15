import React, { useState, useEffect } from 'react';
import { Settings, X, Check, Palette, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const primaryColors = [
  { name: '默认主色', value: '#E35600' },
  { name: '默认蓝', value: '#2563eb' },
  { name: '极客蓝', value: '#1d4ed8' },
  { name: '酱紫', value: '#7c3aed' },
  { name: '中国红', value: '#dc2626' },
  { name: '活力橙', value: '#ea580c' },
  { name: '极光绿', value: '#059669' },
  { name: '深海蓝', value: '#0f172a' },
];

const radiusOptions = [
  { name: '直角', value: '0px' },
  { name: '小', value: '0.5rem' },
  { name: '中', value: '1rem' },
  { name: '大', value: '1.5rem' },
  { name: '圆润', value: '2rem' },
];

export const ThemeSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#E35600');
  const [borderRadius, setBorderRadius] = useState('1rem');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--border-radius', borderRadius);
  }, [borderRadius]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-l-2xl shadow-2xl z-50 hover:pr-5 transition-all group"
      >
        <Settings className="animate-spin-slow group-hover:scale-110 transition-transform" size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[70] border-l border-slate-100 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Palette className="text-blue-600" size={20} />
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">界面配置</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Primary Color */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Palette size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">主题颜色</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {primaryColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setPrimaryColor(color.value)}
                        className="w-8 h-8 rounded-lg relative flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: color.value }}
                      >
                        {primaryColor === color.value && (
                          <Check size={14} className="text-white" strokeWidth={4} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Box size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">圆角设置</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {radiusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBorderRadius(option.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          borderRadius === option.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar Style */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Box size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">侧边栏风格</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 rounded-2xl border-2 border-blue-600 bg-slate-900 flex flex-col gap-2">
                      <div className="w-full h-2 bg-white/10 rounded" />
                      <div className="w-2/3 h-2 bg-white/10 rounded" />
                      <span className="text-[10px] font-bold text-white mt-2">深色模式</span>
                    </button>
                    <button className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2 opacity-50 cursor-not-allowed">
                      <div className="w-full h-2 bg-slate-100 rounded" />
                      <div className="w-2/3 h-2 bg-slate-100 rounded" />
                      <span className="text-[10px] font-bold text-slate-400 mt-2">浅色模式 (敬请期待)</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => {
                    setPrimaryColor('#E35600');
                    setBorderRadius('1rem');
                  }}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  重置配置
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
