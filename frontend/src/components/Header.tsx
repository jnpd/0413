import React from 'react';
import { User, Bell, Search, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  section: string;
}

export const Header: React.FC<HeaderProps> = ({ title, section }) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">{title}</h2>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
            <span>{section}</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary">{title}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="全局搜索功能、设备或任务..." 
            className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary w-80 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 mr-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">系统在线</span>
          </div>

          <button className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group">
            <Bell size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform">3</span>
          </button>
          <button className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <Settings size={20} />
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-2" />
          
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none group-hover:text-primary transition-colors">管理员</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 border border-white/20 group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>
            <LogOut size={18} className="text-slate-300 hover:text-rose-500 transition-colors ml-1" />
          </div>
        </div>
      </div>
    </header>
  );
};
