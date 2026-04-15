import React, { useEffect, useMemo, useState } from 'react';
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
  CircleHelp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import type { SidebarGroup, SidebarItem } from '../router/menuTypes';

interface SidebarProps {
  currentPath: string;
  groups: SidebarGroup[];
  onNavigate: (path: string) => void;
}

const itemIconMap: Array<{ match: (item: SidebarItem) => boolean; icon: LucideIcon }> = [
  { match: (item) => item.path.includes('/archive/'), icon: Database },
  { match: (item) => item.path.includes('/warehouse/'), icon: Warehouse },
  { match: (item) => item.path.includes('/batchManagement/'), icon: Layers },
  { match: (item) => item.path.includes('/batchTesting/index'), icon: Activity },
  { match: (item) => item.path.includes('/batchTestingHistory/'), icon: HistoryIcon },
  { match: (item) => item.path.includes('/Packaging/'), icon: Package },
  { match: (item) => item.path.includes('/notice/'), icon: Bell },
  { match: (item) => item.path.includes('/account/account-management/'), icon: Building2 },
  { match: (item) => item.path.includes('/account/user-account/'), icon: Users },
  { match: (item) => item.path.includes('/account/role-management/'), icon: ShieldCheck },
];

function resolveItemIcon(item: SidebarItem): LucideIcon {
  return itemIconMap.find((entry) => entry.match(item))?.icon ?? CircleHelp;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, groups, onNavigate }) => {
  const groupLabels = useMemo(() => groups.map((group) => group.label), [groups]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(groupLabels);

  useEffect(() => {
    setExpandedGroups(groupLabels);
  }, [groupLabels]);

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
        {groups.map(group => (
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
                    const isActive = currentPath === item.path;
                    const Icon = resolveItemIcon(item);

                    return (
                      <div key={item.key} className="px-3">
                        <button
                          onClick={() => onNavigate(item.path)}
                          className={`w-full px-4 py-2 flex items-center gap-3 transition-all duration-300 rounded-xl group relative mb-0.5 ${
                            isActive
                              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                            <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
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
