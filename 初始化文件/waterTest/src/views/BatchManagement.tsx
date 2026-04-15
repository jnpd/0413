import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2, TestTube } from 'lucide-react';
import {
  ActionButton,
  Modal,
  SearchInput,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/UIComponents';

interface BatchManagementRecord {
  id: string;
  batchNo: string;
  productionOrderNo: string;
  remark: string;
  createdAt: string;
}

interface BatchFormState {
  batchNo: string;
  productionOrderNo: string;
  remark: string;
}

interface BatchManagementProps {
  onCreateTestBatch: (meta: { batchNo: string; productionOrderNo: string; createdAt: string }) => void;
  onGoToTest: (batchNo: string) => void;
}

const initialRecords: BatchManagementRecord[] = [
  {
    id: 'b1',
    batchNo: '2603-002-P001',
    productionOrderNo: '2603-002',
    remark: '',
    createdAt: '2026-03-18 09:10:00',
  },
  {
    id: 'b2',
    batchNo: '2603-002-P002',
    productionOrderNo: '2603-002',
    remark: '',
    createdAt: '2026-03-18 08:00:00',
  },
  {
    id: 'b3',
    batchNo: '2603-003-P001',
    productionOrderNo: '2603-003',
    remark: '该批次包含特殊采集节奏，需重点关注判定详情',
    createdAt: '2026-03-17 17:40:00',
  },
];

const emptyForm: BatchFormState = {
  batchNo: '',
  productionOrderNo: '',
  remark: '',
};

const pad3 = (value: number) => String(value).padStart(3, '0');

const extractSeqFromBatchNo = (batchNo: string) => {
  const match = batchNo.match(/-P?(\d{3})$/);
  return match?.[1] ?? null;
};

const generateNextBatchNoFrom = (list: BatchManagementRecord[], filingNo: string) => {
  const prefix = `${filingNo}-`;
  const matches = list.map((item) => item.batchNo).filter((no) => no.startsWith(prefix));
  const maxSeq = matches.reduce((acc, no) => {
    const tail = no.slice(prefix.length);
    const seq = tail.startsWith('P') ? Number(tail.slice(1)) : Number(tail);
    return Number.isFinite(seq) ? Math.max(acc, seq) : acc;
  }, 0);
  return `${prefix}P${pad3(maxSeq + 1)}`;
};

const generateUniqueBatchNoFrom = (list: BatchManagementRecord[], filingNo: string) => {
  const nextFilingNo = filingNo.trim();
  const prefix = `${nextFilingNo}-`;
  let candidate = generateNextBatchNoFrom(list, nextFilingNo);
  let guard = 0;
  while (list.some((r) => r.batchNo === candidate) && guard < 500) {
    const raw = candidate.startsWith(prefix) ? candidate.slice(prefix.length) : '';
    const seq = raw.startsWith('P') ? Number(raw.slice(1)) : Number(raw);
    candidate = `${prefix}P${pad3((Number.isFinite(seq) ? seq : 0) + 1)}`;
    guard += 1;
  }
  return candidate;
};

export const BatchManagementView: React.FC<BatchManagementProps> = ({ onCreateTestBatch, onGoToTest }) => {
  const [records, setRecords] = useState<BatchManagementRecord[]>(initialRecords);
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BatchFormState>(emptyForm);
  const [isBatchNoManual, setIsBatchNoManual] = useState(false);
  const isBatchNoManualRef = useRef(false);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordsRef = useRef(records);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    isBatchNoManualRef.current = isBatchNoManual;
  }, [isBatchNoManual]);

  const filingNoPattern = /^\d{4}-\d{3}$/;

  const scheduleAutoGenerateBatchNo = (filingNoRaw: string) => {
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current);
    const filingNo = filingNoRaw.trim();
    if (!filingNoPattern.test(filingNo)) {
      setForm((prev) => ({ ...prev, batchNo: '' }));
      return;
    }

    generateTimerRef.current = setTimeout(() => {
      if (isBatchNoManualRef.current) return;
      const candidate = generateUniqueBatchNoFrom(recordsRef.current, filingNo);
      setForm((prev) => ({ ...prev, batchNo: candidate }));
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (generateTimerRef.current) clearTimeout(generateTimerRef.current);
    };
  }, []);

  const [filingModal, setFilingModal] = useState<{ open: boolean; oldNo: string; newNo: string }>({
    open: false,
    oldNo: '',
    newNo: '',
  });

  const filteredRecords = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((item) =>
      [item.batchNo, item.productionOrderNo, item.remark, item.createdAt]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [keyword, records]);

  const groupedByFiling = useMemo(() => {
    const map = new Map<string, BatchManagementRecord[]>();
    for (const item of filteredRecords) {
      const key = item.productionOrderNo;
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    const groups = Array.from(map.entries()).map(([filingNo, items]) => ({
      filingNo,
      items: [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)),
    }));
    groups.sort((a, b) => {
      const ta = a.items[0]?.createdAt ?? '';
      const tb = b.items[0]?.createdAt ?? '';
      return ta < tb ? 1 : ta > tb ? -1 : a.filingNo.localeCompare(b.filingNo);
    });
    return groups;
  }, [filteredRecords]);

  const [expandedFilings, setExpandedFilings] = useState<Set<string>>(() => new Set());

  const toggleFiling = useCallback((filingNo: string) => {
    setExpandedFilings((prev) => {
      const next = new Set(prev);
      if (next.has(filingNo)) next.delete(filingNo);
      else next.add(filingNo);
      return next;
    });
  }, []);

  const aggregateGroup = (items: BatchManagementRecord[]) => {
    const realBatches = items.filter((i) => i.batchNo);
    const latestCreated = realBatches.reduce(
      (best, i) => (i.createdAt > best ? i.createdAt : best),
      items[0]?.createdAt ?? ''
    );
    return { batchCount: realBatches.length, latestCreated };
  };

  const openCreate = () => {
    setEditingId(null);
    setIsBatchNoManual(false);
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current);
    setForm({ ...emptyForm });
    setIsModalOpen(true);
  };

  const quickAddBatchUnderFiling = useCallback(
    (filingNo: string) => {
      const nextFilingNo = filingNo.trim();
      const batchNo = generateUniqueBatchNoFrom(recordsRef.current, nextFilingNo);
      const createdAt = new Date().toLocaleString('zh-CN', { hour12: false });
      const newRecord: BatchManagementRecord = {
        id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        batchNo,
        productionOrderNo: nextFilingNo,
        remark: '',
        createdAt,
      };

      setRecords((prev) => [newRecord, ...prev]);
      setExpandedFilings((prev) => {
        const next = new Set(prev);
        next.add(nextFilingNo);
        return next;
      });

      // onCreateTestBatch({
      //   batchNo: newRecord.batchNo,
      //   productionOrderNo: newRecord.productionOrderNo,
      //   createdAt: newRecord.createdAt,
      // });
    },
    [onCreateTestBatch]
  );

  const openEditFilingModal = (filingNo: string) => {
    setFilingModal({ open: true, oldNo: filingNo, newNo: filingNo });
  };

  const closeFilingModal = () => {
    setFilingModal({ open: false, oldNo: '', newNo: '' });
  };

  const saveFilingModal = () => {
    const nextNo = filingModal.newNo.trim();
    if (!nextNo) {
      alert('备货单号不能为空');
      return;
    }
    const oldNo = filingModal.oldNo;
    if (oldNo === nextNo) {
      closeFilingModal();
      return;
    }
    const proposed = records.map((r) => {
      if (r.productionOrderNo !== oldNo) return r;
      const seq = extractSeqFromBatchNo(r.batchNo);
      return { ...r, productionOrderNo: nextNo, batchNo: seq ? `${nextNo}-P${seq}` : r.batchNo };
    });
    const seen = new Set<string>();
    for (const r of proposed) {
      if (seen.has(r.batchNo)) {
        alert('保存失败：重命名备货单号导致测试批号冲突，请重试选择其他备货单号。');
        return;
      }
      seen.add(r.batchNo);
    }
    setRecords(proposed);
    setExpandedFilings((prev) => {
      const n = new Set(prev);
      if (n.has(oldNo)) {
        n.delete(oldNo);
        n.add(nextNo);
      }
      return n;
    });
    closeFilingModal();
  };

  const openEdit = (item: BatchManagementRecord) => {
    setEditingId(item.id);
    setIsBatchNoManual(false);
    setForm({
      batchNo: item.batchNo,
      productionOrderNo: item.productionOrderNo,
      remark: item.remark,
    });
    setIsModalOpen(true);
  };

  const removeRecord = (id: string) => setRecords((prev) => prev.filter((item) => item.id !== id));

  const removeFilingNo = (filingNo: string) => {
    const ok = window.confirm(`确认删除备货单号 ${filingNo} 下的全部测试批次？`);
    if (!ok) return;
    setRecords((prev) => prev.filter((r) => r.productionOrderNo !== filingNo));
    setExpandedFilings((prev) => {
      const n = new Set(prev);
      n.delete(filingNo);
      return n;
    });
  };

  const handleSave = () => {
    const productionOrderNo = form.productionOrderNo.trim();
    const remark = form.remark.trim();

    if (!productionOrderNo) {
      alert('备货单号为必填项');
      return;
    }
    if (!filingNoPattern.test(productionOrderNo)) {
      alert('备货单号格式不正确（示例：2603-001），请检查后重试。');
      return;
    }

    if (!editingId) {
      const existsFilingPlaceholder = recordsRef.current.some(
        (r) => r.productionOrderNo === productionOrderNo && !r.batchNo
      );
      if (existsFilingPlaceholder) {
        alert('该备货单号已存在，请勿重复新增。');
        return;
      }

      const nextRecord: BatchManagementRecord = {
        id: Date.now().toString(),
        batchNo: '',
        productionOrderNo,
        remark,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      };

      setRecords((prev) => [nextRecord, ...prev]);
      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      return;
    }

    let batchNo = form.batchNo.trim();

    if (!batchNo) return alert('请填写测试批号');

    const dup = recordsRef.current.some((r) => r.batchNo === batchNo && r.id !== editingId);
    if (dup) {
      alert('保存失败：测试批号重复，请修改后再保存');
      return;
    }

    const nextRecord: BatchManagementRecord = {
      id: editingId || Date.now().toString(),
      batchNo,
      productionOrderNo,
      remark,
      createdAt:
        editingId
          ? records.find((item) => item.id === editingId)?.createdAt ||
            new Date().toLocaleString('zh-CN', { hour12: false })
          : new Date().toLocaleString('zh-CN', { hour12: false }),
    };

    if (editingId) {
      setRecords((prev) => prev.map((item) => (item.id === editingId ? nextRecord : item)));
    } else {
      setRecords((prev) => [nextRecord, ...prev]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current);
    setForm(emptyForm);

    if (!editingId) {
      onCreateTestBatch({
        batchNo: nextRecord.batchNo,
        productionOrderNo: nextRecord.productionOrderNo,
        createdAt: nextRecord.createdAt,
      });
    }
  };

  return (
    <div className="p-4 space-y-4 bg-slate-50/50 min-h-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <SearchInput
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索测试批号、备货单号..."
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton icon={Plus} onClick={openCreate}>
              新增备货单号
            </ActionButton>
          </div>
        </div>

        <TableContainer className="border-0 rounded-none shadow-none">
          <TableHead>
            <tr>
              <TableHeader className="w-10 px-2" />
              <TableHeader className="whitespace-nowrap min-w-[180px]">备货单号</TableHeader>
              <TableHeader className="whitespace-nowrap min-w-[200px]">批次号</TableHeader>
              <TableHeader className="whitespace-nowrap">设备总数</TableHeader>
              <TableHeader className="whitespace-nowrap">合格</TableHeader>
              <TableHeader className="whitespace-nowrap">异常</TableHeader>
              <TableHeader className="whitespace-nowrap">待测</TableHeader>
              <TableHeader className="whitespace-nowrap">备注</TableHeader>
              <TableHeader className="whitespace-nowrap">创建时间</TableHeader>
              <TableHeader className="text-right whitespace-nowrap">操作</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {groupedByFiling.length === 0 ? (
              <TableRow>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-400 text-sm">
                  暂无数据，请调整搜索条件或新增批次
                </td>
              </TableRow>
            ) : (
              groupedByFiling.map(({ filingNo, items }) => {
                const expanded = expandedFilings.has(filingNo);
                const agg = aggregateGroup(items);
                // 当前演示数据尚未接入“设备测试状态”统计，这里默认全部为“待测”
                const deviceTotal = agg.batchCount;
                const passedCount = 0;
                const failedCount = 0;
                const pendingCount = deviceTotal;
                const latestBatchNo = items.filter((x) => x.batchNo)[0]?.batchNo;
                return (
                  <React.Fragment key={filingNo}>
                    <TableRow
                      className="bg-slate-50/90 hover:bg-slate-100/90 cursor-pointer transition-colors"
                      onClick={() => toggleFiling(filingNo)}
                    >
                      <TableCell className="w-10 px-2 align-middle">
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          aria-expanded={expanded}
                          aria-label={expanded ? '收起' : '展开'}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFiling(filingNo);
                          }}
                        >
                          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap">{filingNo}</TableCell>
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">{''}</TableCell>
                      <TableCell className="font-mono text-slate-700 whitespace-nowrap">{deviceTotal}</TableCell>
                      <TableCell className="font-mono text-emerald-700 whitespace-nowrap">{passedCount}</TableCell>
                      <TableCell className="font-mono text-rose-700 whitespace-nowrap">{failedCount}</TableCell>
                      <TableCell className="font-mono text-slate-700 whitespace-nowrap">{pendingCount}</TableCell>
                      <TableCell className="text-slate-400 whitespace-nowrap">
                        <span className="font-medium text-xs">（点击行展开查看明细）</span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs whitespace-nowrap">最近 {agg.latestCreated}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1 flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            icon={Plus}
                            title="新增测试批次号（自动跳转批量测试，可在明细行继续编辑补充）"
                            onClick={() => quickAddBatchUnderFiling(filingNo)}
                          >
                            新增批次
                          </ActionButton>
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            icon={Edit2}
                            title="修改备货单号（本组下全部批次同步变更）"
                            onClick={() => openEditFilingModal(filingNo)}
                          >
                            编辑
                          </ActionButton>
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="text-rose-400 hover:text-rose-600"
                            title="删除备货单号（会删除该组全部测试批次）"
                            onClick={() => removeFilingNo(filingNo)}
                          >
                            删除
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded &&
                      items.filter((x) => x.batchNo).map((item) => {
                        return (
                          <TableRow key={item.id} className="bg-white hover:bg-slate-50/80">
                            <TableCell className="w-10 px-2 bg-slate-50/50 border-l-2 border-primary/30" />
                            <TableCell className="font-mono font-black text-slate-800 whitespace-nowrap pl-2">
                              {item.productionOrderNo}
                            </TableCell>
                            <TableCell className="text-slate-400 whitespace-nowrap">{item.batchNo}</TableCell>
                            <TableCell className="text-slate-400 whitespace-nowrap">—</TableCell>
                            <TableCell className="text-slate-400 whitespace-nowrap">—</TableCell>
                            <TableCell className="text-slate-400 whitespace-nowrap">—</TableCell>
                            <TableCell className="text-slate-400 whitespace-nowrap">—</TableCell>
                            <TableCell className="text-slate-500 whitespace-nowrap">{item.remark || '—'}</TableCell>
                            <TableCell className="text-slate-500 text-xs whitespace-nowrap">{item.createdAt}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <ActionButton
                                  variant="ghost"
                                  size="sm"
                                  icon={TestTube}
                                  className="text-primary hover:text-primary/80"
                                  onClick={() => onGoToTest(item.batchNo)}
                                >
                                  去测试
                                </ActionButton>
                                <ActionButton variant="ghost" size="sm" icon={Edit2} onClick={() => openEdit(item)} />
                                <ActionButton
                                  variant="ghost"
                                  size="sm"
                                  icon={Trash2}
                                  className="text-rose-400 hover:text-rose-600"
                                  onClick={() => removeRecord(item.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </TableContainer>
      </div>

      <Modal
        isOpen={filingModal.open}
        onClose={closeFilingModal}
        title="编辑备货单号"
        footer={
          <>
            <ActionButton variant="outline" onClick={closeFilingModal}>
              取消
            </ActionButton>
            <ActionButton onClick={saveFilingModal}>确定保存</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">当前备货单号</label>
            <input
              readOnly
              value={filingModal.oldNo}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              新备货单号（必填） <span className="text-rose-500">*</span>
            </label>
            <input
              value={filingModal.newNo}
              onChange={(e) => setFilingModal((m) => ({ ...m, newNo: e.target.value }))}
              placeholder="请输入新的备货单号"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
            />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            保存后，该组下的<strong>全部测试批号</strong>前缀将更新为新备货单号（后缀序号保持不变）；若新单号下已有其他批次，列表中会合并为同一组展示。
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setIsBatchNoManual(false);
          if (generateTimerRef.current) clearTimeout(generateTimerRef.current);
          setForm(emptyForm);
        }}
        title={editingId ? '编辑批次' : '新增备货单号'}
        footer={
          <>
            <ActionButton
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                if (generateTimerRef.current) clearTimeout(generateTimerRef.current);
                setForm(emptyForm);
              }}
            >
              取消
            </ActionButton>
            <ActionButton onClick={handleSave}>确定保存</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          {editingId ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  备货单号 <span className="text-rose-500">*</span>
                </label>
                <input
                  readOnly={!!editingId}
                  value={form.productionOrderNo}
                  onChange={(event) => {
                    const next = event.target.value;
                    setIsBatchNoManual(false);
                    isBatchNoManualRef.current = false;
                    setForm((prev) => ({ ...prev, productionOrderNo: next, batchNo: '' }));
                    scheduleAutoGenerateBatchNo(next);
                  }}
                  placeholder="例如：2603-001"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">测试批号</label>
                <input
                  value={form.batchNo}
                  onChange={(event) => {
                    const next = event.target.value;
                    setIsBatchNoManual(true);
                    isBatchNoManualRef.current = true;
                    setForm((prev) => ({ ...prev, batchNo: next }));
                  }}
                  placeholder="可手动修改测试批号（保存前需全局唯一）"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  备货单号 <span className="text-rose-500">*</span>
                </label>
                <input
                  readOnly={!!editingId}
                  value={form.productionOrderNo}
                  onChange={(event) => {
                    const next = event.target.value;
                    setIsBatchNoManual(false);
                    isBatchNoManualRef.current = false;
                    setForm((prev) => ({ ...prev, productionOrderNo: next, batchNo: '' }));
                    scheduleAutoGenerateBatchNo(next);
                  }}
                  placeholder="例如：2603-001"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">备注（可选）</label>
            <textarea
              value={form.remark}
              onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
              placeholder="例如：该批次包含特殊采集节奏/注意事项"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary min-h-[80px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
