import React from 'react';
import { Loader2 } from 'lucide-react';
import { ActionButton, StatusBadge } from '../../components/UIComponents';
import type { MenuTreeNode } from './api';

export const SystemBanner: React.FC<{
  tone: 'success' | 'error';
  message: string;
}> = ({ tone, message }) => {
  const className =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${className}`}>{message}</div>;
};

export const BlockingMask: React.FC<{
  active: boolean;
  label: string;
}> = ({ active, label }) => {
  if (!active) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
        <Loader2 className="animate-spin text-primary" size={20} />
        <span className="text-sm font-black text-slate-700">{label}</span>
      </div>
    </div>
  );
};

export const EmptyRow: React.FC<{
  colSpan: number;
  message: string;
}> = ({ colSpan, message }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
      {message}
    </td>
  </tr>
);

export const PaginationBar: React.FC<{
  current: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}> = ({ current, pages, total, onPageChange }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
      共 {total} 条，当前第 {current} / {Math.max(pages, 1)} 页
    </div>
    <div className="flex items-center gap-2">
      <ActionButton variant="outline" size="sm" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>
        上一页
      </ActionButton>
      <ActionButton variant="outline" size="sm" disabled={pages <= 0 || current >= pages} onClick={() => onPageChange(current + 1)}>
        下一页
      </ActionButton>
    </div>
  </div>
);

function MenuTreeChecklistNode({
  node,
  checkedIds,
  onToggle,
  depth,
}: {
  node: MenuTreeNode;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  return (
    <div className="space-y-2">
      <label
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
        style={{ marginLeft: depth * 16 }}
      >
        <input
          type="checkbox"
          checked={checkedIds.has(node.id)}
          onChange={() => onToggle(node.id)}
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
        />
        <span className="text-sm font-bold text-slate-700">{node.title}</span>
        {checkedIds.has(node.id) ? <StatusBadge variant="info">已选</StatusBadge> : null}
      </label>
      {node.children.map((child) => (
        <MenuTreeChecklistNode key={child.id} node={child} checkedIds={checkedIds} onToggle={onToggle} depth={depth + 1} />
      ))}
    </div>
  );
}

export const MenuTreeChecklist: React.FC<{
  nodes: MenuTreeNode[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}> = ({ nodes, checkedIds, onToggle }) => (
  <div className="space-y-3">
    {nodes.map((node) => (
      <MenuTreeChecklistNode key={node.id} node={node} checkedIds={checkedIds} onToggle={onToggle} depth={0} />
    ))}
  </div>
);
