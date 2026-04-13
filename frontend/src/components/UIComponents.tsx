import React from 'react';
import { Search, LucideIcon, X, ArrowUp, ArrowDown, ArrowUpDown, Settings2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Search Input ---
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export const SearchInput: React.FC<SearchInputProps> = ({ icon: Icon = Search, ...props }) => {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
      <input
        {...props}
        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
      />
    </div>
  );
};

// --- Table Components ---
export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        {children}
      </table>
    </div>
  </div>
);

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 font-bold border-b border-slate-100">
    {children}
  </thead>
);

export const TableHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}> = ({ children, className = "", sortable, sortDirection, onSort }) => (
  <th 
    className={`px-4 py-3 text-[11px] uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors group/th' : ''} ${className}`}
    onClick={sortable ? onSort : undefined}
  >
    <div className="flex items-center gap-2">
      {children}
      {sortable && (
        <div className="text-slate-300 group-hover/th:text-slate-400 transition-colors">
          {sortDirection === 'asc' ? <ArrowUp size={12} className="text-primary" /> : 
           sortDirection === 'desc' ? <ArrowDown size={12} className="text-primary" /> : 
           <ArrowUpDown size={12} />}
        </div>
      )}
    </div>
  </th>
);

// --- Column Settings ---
interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnSettingsProps {
  columns: Column[];
  onToggle: (id: string) => void;
}

export const ColumnSettings: React.FC<ColumnSettingsProps> = ({ columns, onToggle }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <ActionButton 
        variant="outline" 
        icon={Settings2} 
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'bg-slate-100 border-slate-300' : ''}
      >
        列设置
      </ActionButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">显示/隐藏列</p>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {columns.map(col => (
                  <button
                    key={col.id}
                    onClick={() => onToggle(col.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <span className={`text-sm font-bold ${col.visible ? 'text-slate-900' : 'text-slate-400'}`}>
                      {col.label}
                    </span>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      col.visible ? 'bg-primary border-primary text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {col.visible && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <tr 
    onClick={onClick}
    className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <td className={`px-4 py-3 ${className}`}>
    {children}
  </td>
);

// --- Status Badge ---
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export const StatusBadge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant }> = ({ children, variant = 'neutral' }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-primary/10 text-primary border-primary/20',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- Action Button ---
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  size = 'md',
  className = "",
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-200",
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs rounded-lg",
    md: "px-3 py-2 text-sm rounded-xl",
    lg: "px-5 py-2.5 text-base rounded-2xl",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
      {children}
    </button>
  );
};

// --- Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md' 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100`}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
