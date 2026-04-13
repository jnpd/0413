import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Filter, Plus, Trash2 } from 'lucide-react';
import {
  ActionButton,
  ColumnSettings,
  Modal,
  SearchInput,
  StatusBadge,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/UIComponents';
import { loadArchiveCatalog, saveArchiveCatalog } from '../utils/archiveStore';

type SortKey = 'name' | 'model' | 'caliber' | 'remark' | 'createdAt';

interface ArchiveRecord {
  id: string;
  name: string;
  model: string;
  caliber: string;
  remark: string;
  createdAt: string;
}

interface ArchiveFormState {
  name: string;
  model: string;
  caliber: string;
  remark: string;
}

const MODEL_OPTIONS = ['LXSG-15', 'LXSG-20', 'LXSG-25', 'WS-15A'];

const initialRecords: ArchiveRecord[] = [
  {
    id: 'a1',
    name: '户用远传水表（DN15）',
    model: 'LXSG-15',
    caliber: 'DN15',
    remark: '',
    createdAt: '2026-03-18 08:30:00',
  },
  {
    id: 'a2',
    name: '户用远传水表（DN20）',
    model: 'LXSG-20',
    caliber: 'DN20',
    remark: '',
    createdAt: '2026-03-18 09:15:00',
  },
  {
    id: 'a3',
    name: '大口径产测表（DN25）',
    model: 'LXSG-25',
    caliber: 'DN25',
    remark: '',
    createdAt: '2026-03-18 10:05:00',
  },
];

const emptyForm: ArchiveFormState = {
  name: '',
  model: MODEL_OPTIONS[0],
  caliber: 'DN15',
  remark: '',
};

const getNowLabel = () => new Date().toLocaleString('zh-CN', { hour12: false });

export const ArchiveView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [records, setRecords] = useState<ArchiveRecord[]>(() => loadArchiveCatalog(initialRecords));
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState<ArchiveFormState>(emptyForm);
  const [columns, setColumns] = useState([
    { id: 'name', label: '表具名称', visible: true },
    { id: 'model', label: '表具型号', visible: true },
    { id: 'caliber', label: '表具口径', visible: true },
    { id: 'remark', label: '备注', visible: true },
    { id: 'createdAt', label: '创建时间', visible: true },
  ]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' | null }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const toggleColumn = (id: string) => {
    setColumns((prev) => prev.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)));
  };

  const isVisible = (id: string) => columns.find((item) => item.id === id)?.visible;

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    saveArchiveCatalog(records);
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((item) =>
      [
        item.name,
        item.model,
        item.caliber,
        item.remark,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [keyword, records]);

  const sortedRecords = useMemo(() => {
    if (!sortConfig.direction) return filteredRecords;
    const next = [...filteredRecords];
    next.sort((left, right) => {
      const leftValue = left[sortConfig.key] || '';
      const rightValue = right[sortConfig.key] || '';
      const compared = String(leftValue).localeCompare(String(rightValue), 'zh-CN');
      return sortConfig.direction === 'asc' ? compared : compared * -1;
    });
    return next;
  }, [filteredRecords, sortConfig]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (item: ArchiveRecord) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      model: item.model,
      caliber: item.caliber,
      remark: item.remark,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const normalizeName = (value: string) => value.trim().toLowerCase();

  const handleSave = () => {
    const name = form.name.trim();
    const model = form.model.trim();
    const caliber = form.caliber.trim();
    const remark = form.remark.trim();

    if (!name) {
      alert('请填写表具名称');
      return;
    }
    if (!model) {
      alert('请填写表具型号');
      return;
    }
    if (!caliber) {
      alert('请填写表具口径');
      return;
    }

    const duplicated = records.some((item) => normalizeName(item.name) === normalizeName(name) && item.id !== editingId);
    if (duplicated) {
      alert('表具名称不可重复，请调整后再保存');
      return;
    }

    if (editingId) {
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name,
                model,
                caliber,
                remark,
              }
            : item
        )
      );
    } else {
      setRecords((prev) => [
        {
          id: Date.now().toString(),
          name,
          model,
          caliber,
          remark,
          createdAt: getNowLabel(),
        },
        ...prev,
      ]);
    }

    closeModal();
  };

  return (
    <div className="p-4 space-y-4 bg-slate-50/50 min-h-full">
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[320px]">
          <SearchInput
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索表具名称、型号、口径或备注..."
          />
        </div>
        <div className="flex items-center gap-2">
          <ColumnSettings columns={columns} onToggle={toggleColumn} />
          <ActionButton icon={Plus} onClick={openCreate}>
            新增档案
          </ActionButton>
        </div>
      </div>

      <TableContainer>
        <TableHead>
          <tr>
            {isVisible('name') && (
              <TableHeader sortable sortDirection={sortConfig.key === 'name' ? sortConfig.direction : null} onSort={() => handleSort('name')}>
                表具名称
              </TableHeader>
            )}
            {isVisible('model') && (
              <TableHeader sortable sortDirection={sortConfig.key === 'model' ? sortConfig.direction : null} onSort={() => handleSort('model')}>
                表具型号
              </TableHeader>
            )}
            {isVisible('caliber') && (
              <TableHeader sortable sortDirection={sortConfig.key === 'caliber' ? sortConfig.direction : null} onSort={() => handleSort('caliber')}>
                表具口径
              </TableHeader>
            )}
            {isVisible('remark') && (
              <TableHeader sortable sortDirection={sortConfig.key === 'remark' ? sortConfig.direction : null} onSort={() => handleSort('remark')}>
                备注
              </TableHeader>
            )}
            {isVisible('createdAt') && (
              <TableHeader sortable sortDirection={sortConfig.key === 'createdAt' ? sortConfig.direction : null} onSort={() => handleSort('createdAt')}>
                创建时间
              </TableHeader>
            )}
            <TableHeader className="text-right">操作</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {sortedRecords.map((item) => (
            <TableRow key={item.id}>
              {isVisible('name') && <TableCell className="text-slate-900 font-bold">{item.name}</TableCell>}
              {isVisible('model') && <TableCell className="font-mono text-slate-700 font-bold">{item.model}</TableCell>}
              {isVisible('caliber') && <TableCell className="text-slate-700 font-medium">{item.caliber}</TableCell>}
              {isVisible('remark') && <TableCell className="text-slate-500">{item.remark || '—'}</TableCell>}
              {isVisible('createdAt') && <TableCell className="text-slate-500 text-xs whitespace-nowrap">{item.createdAt}</TableCell>}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <ActionButton variant="ghost" size="sm" icon={Edit2} onClick={() => openEdit(item)} />
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="text-rose-400 hover:text-rose-600"
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </TableContainer>

      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">当前共 {sortedRecords.length} 条表具档案字段</p>
        <div className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-2 text-xs text-primary font-bold">
          创建时间由系统自动生成，供仓库/测试/包装统一引用
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? '编辑表具档案' : '新增表具档案'}
        footer={
          <>
            <ActionButton variant="outline" onClick={closeModal}>
              取消
            </ActionButton>
            <ActionButton onClick={handleSave}>确定保存</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                表具名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="例如：户用远传水表（DN15）"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                表具型号 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.model}
                onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
                placeholder="例如：LXSG-15"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                表具口径 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.caliber}
                onChange={(event) => setForm((prev) => ({ ...prev, caliber: event.target.value }))}
                placeholder="例如：DN15"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">备注</label>
              <textarea
                value={form.remark}
                onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                placeholder="例如：适用于某项目版本/特性说明（可选）"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary min-h-[44px] resize-y"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
            创建时间由系统自动生成，当前页面维护完成后将同步作为仓库、批量测试和包装页的基础字段口径。
          </div>
        </div>
      </Modal>
    </div>
  );
};
