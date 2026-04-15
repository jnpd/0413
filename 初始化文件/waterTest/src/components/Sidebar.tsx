import React, { useState } from 'react';
import { 
  Database, 
  Warehouse, 
  Activity, 
  Clock as HistoryIcon, 
  Layers,
  Package, 
  Bell, 
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
} from 'lucide-react';
import { ViewType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface MenuItem {
  id: ViewType;
  label: string;
  icon: any;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: '生产系统',
    items: [
      { id: 'archive', label: '表具档案', icon: Database },
       { id: 'batch-management', label: '批次管理', icon: Layers },
      { id: 'warehouse', label: '仓库管理', icon: Warehouse },
      { id: 'testing', label: '批量测试', icon: Activity },
      { id: 'history', label: '批量测试历史', icon: HistoryIcon },
      { id: 'packaging', label: '包装管理', icon: Package },
    ]
  },
  {
    label: '公告模块',
    items: [
      { id: 'announcement', label: '公告管理', icon: Bell },
    ]
  },
  {
    label: '系统管理',
    items: [
      { id: 'enterprise', label: '账户管理', icon: Building2 },
      { id: 'user-account', label: '人员管理', icon: Users },
      { id: 'role-management', label: '角色管理', icon: ShieldCheck },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['生产系统', '公告模块', '系统管理']);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="w-64 bg-gradient-to-br from-[#001529] via-[#002140] to-[#000d1a] text-white h-screen flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.3)] border-r border-white/5">
      {/* Background Decorative Layer */}
      <div className="absolute inset-0 bg-[url('/assets/carbon-fibre.svg')] bg-[length:160px_160px] opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-black/20 pointer-events-none" />
      
      <div className="p-4 flex items-center gap-3 border-b border-white/5 relative">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center font-black text-xl shadow-xl shadow-primary/20 border border-white/20 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
          W
        </div>
        <div className="flex flex-col">
          <span className="font-black text-base tracking-tight leading-none">乐源智慧水务</span>
          <span className="text-[10px] font-bold text-secondary/80 uppercase tracking-[0.15em] mt-1.5">Smart Water OS</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide relative">
        {menuGroups.map(group => (
          <div key={group.label} className="mb-2">
            <button 
              onClick={() => toggleGroup(group.label)}
              className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] hover:text-secondary transition-colors group/header"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-secondary/50 group-hover/header:bg-secondary transition-colors" />
                {group.label}
              </div>
              <div className="p-1 rounded bg-white/5 group-hover/header:bg-white/10 transition-colors">
                {expandedGroups.includes(group.label) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {expandedGroups.includes(group.label) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden mt-1"
                >
                  {group.items.map(item => {
                    const isActive = currentView === item.id;

                    return (
                      <div key={item.id} className="px-3">
                        <button
                          onClick={() => onViewChange(item.id)}
                          className={`w-full px-4 py-2 flex items-center gap-3 transition-all duration-300 rounded-xl group relative mb-0.5 ${
                            isActive
                              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                            <item.icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                          </div>
                          <span className="flex-1 text-left text-[13px] font-bold tracking-tight">{item.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
      
    </div>
  );
};
