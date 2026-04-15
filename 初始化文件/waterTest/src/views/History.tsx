import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  FileDown,
  Calendar,
  User,
  Activity,
  BarChart3,
  Upload,
  Link2,
  AlertTriangle,
  Settings2,
  Info,
  Wand2,
  Loader2,
  Edit2,
  Trash2,
  Plus,
  Check,
  Search,
  RotateCcw,
} from 'lucide-react';
import { TestBatch, BenchRecord, PlatformTestRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  SearchInput,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  StatusBadge,
  ActionButton,
  Modal,
} from '../components/UIComponents';

interface BenchSheet {
  id: string;
  name: string;
  fileName?: string;
  uploadedAt?: string;
  rows: BenchRecord[];
}

interface AlignedRow {
  meterNo: string;
  platform?: PlatformTestRecord;
  bench?: BenchRecord;
}

const mockBatches: TestBatch[] = [
  {
    id: '1',
    batchNo: 'BATCH-20240317-001',
    productionOrderNo: 'BA-20240317-001',
    meterName: '户用远传水表（有阀门/磁采集）',
    remark: '',
    startTime: '2024-03-17 08:30:00',
    endTime: '2024-03-17 10:45:00',
    totalCount: 100,
    passedCount: 98,
    failedCount: 2,
    operator: '张三',
    status: 'completed',
  },
  {
    id: '2',
    batchNo: 'BATCH-20240316-005',
    productionOrderNo: 'BA-20240316-002',
    meterName: '户用远传水表（无阀门/磁采集）',
    remark: '加急批次',
    startTime: '2024-03-16 14:00:00',
    endTime: '2024-03-16 16:30:00',
    totalCount: 200,
    passedCount: 195,
    failedCount: 5,
    operator: '李四',
    status: 'completed',
  },
  {
    id: '3',
    batchNo: 'BATCH-20240316-004',
    productionOrderNo: 'BA-20240315-008',
    meterName: '大口径产测表（有阀门/磁采集）',
    remark: '',
    startTime: '2024-03-16 09:00:00',
    endTime: '2024-03-16 11:30:00',
    totalCount: 150,
    passedCount: 148,
    failedCount: 2,
    operator: '王五',
    status: 'completed',
  },
];

const benchPoolByBatch: Record<string, BenchRecord[]> = {
  '1': [
    { id: 'b1-1', meterNo: '202403170001', setFlow: 100, actualFlow: 99.5, temperature: 20, density: 1.0, standardValue: 100, relativeErrorPct: -0.5 },
    { id: 'b1-1b', meterNo: '202403170001', setFlow: 100, actualFlow: 100.8, temperature: 20.5, density: 1.0, standardValue: 100, relativeErrorPct: 0.8 },
    { id: 'b1-2', meterNo: '202403170002', setFlow: 50, actualFlow: 49.8, temperature: 20, density: 1.0, standardValue: 50, relativeErrorPct: -0.4 },
    { id: 'b1-3', meterNo: '202403170003', setFlow: 30, actualFlow: 29.9, temperature: 19.8, density: 1.0, standardValue: 30, relativeErrorPct: -0.333 },
    { id: 'b1-4', meterNo: '202403170004', setFlow: 160, actualFlow: 161.2, temperature: 21, density: 1.0, standardValue: 160, relativeErrorPct: 0.75 },
  ],
  '2': [
    { id: 'b2-1', meterNo: '202403160001', setFlow: 100, actualFlow: 100.1, temperature: 21, density: 1.0, standardValue: 100, relativeErrorPct: 0.1 },
    { id: 'b2-2', meterNo: '202403160002', setFlow: 60, actualFlow: 59.7, temperature: 20.5, density: 1.0, standardValue: 60, relativeErrorPct: -0.5 },
    { id: 'b2-3', meterNo: '202403160003', setFlow: 80, actualFlow: 80.6, temperature: 21.2, density: 1.0, standardValue: 80, relativeErrorPct: 0.75 },
  ],
  '3': [
    { id: 'b3-1', meterNo: '202403150088', setFlow: 80, actualFlow: 79.5, temperature: 20, density: 1.0, standardValue: 80, relativeErrorPct: -0.625 },
    { id: 'b3-2', meterNo: '202403150089', setFlow: 120, actualFlow: 119.4, temperature: 19.6, density: 1.0, standardValue: 120, relativeErrorPct: -0.5 },
    { id: 'b3-3', meterNo: '202403150090', setFlow: 40, actualFlow: 40.3, temperature: 20.8, density: 1.0, standardValue: 40, relativeErrorPct: 0.75 },
  ],
};

const platformByBatch: Record<string, PlatformTestRecord[]> = {
  '1': [
    { id: 'p1', taskNo: 'TEST-20240317-01', meterNo: '202403170001', imei: '861234567890121', simNo: '89860123456789012341', timestamp: '2024-03-17 11:00:00', result: '全功能通过', status: 'passed', tester: '李四', remark: '无', boundBenchId: null },
    { id: 'p2', taskNo: 'TEST-20240317-02', meterNo: '202403170002', imei: '861234567890122', simNo: '89860123456789012342', timestamp: '2024-03-17 11:05:00', result: '全功能通过', status: 'passed', tester: '李四', remark: '无', boundBenchId: null },
  ],
  '2': [
    { id: 'p3', taskNo: 'TEST-20240316-01', meterNo: '202403160001', imei: '861234567890200', simNo: '89860123456789012000', timestamp: '2024-03-16 15:00:00', result: '全功能通过', status: 'passed', tester: '王五', remark: '无', boundBenchId: null },
  ],
  '3': [
    { id: 'p4', taskNo: 'TEST-20240316-02', meterNo: '202403150088', imei: '861234567890199', simNo: '89860123456789011999', timestamp: '2024-03-16 10:00:00', result: '全功能通过', status: 'passed', tester: '赵六', remark: '无', boundBenchId: null },
  ],
};

function benchById(records: BenchRecord[], id: string | null | undefined): BenchRecord | undefined {
  if (!id) return undefined;
  return records.find((b) => b.id === id);
}

function normMeter(no: string, trim: boolean) {
  const s = trim ? no.trim() : no;
  return s;
}

function getBenchRowsByBatch(base: BenchRecord[], batchId: string): BenchRecord[] {
  return base.map((r, idx) => ({ ...r, id: `bench-${batchId}-${idx + 1}` }));
}

function makeBenchSheet(batchId: string, seedRows: BenchRecord[], name: string, fileName?: string): BenchSheet {
  const stamp = Date.now();
  return {
    id: `sheet-${batchId}-${stamp}-${Math.floor(Math.random() * 1000)}`,
    name,
    fileName,
    uploadedAt: new Date().toLocaleString('zh-CN'),
    rows: seedRows.map((r, idx) => ({ ...r, id: `bench-${batchId}-${stamp}-${idx + 1}` })),
  };
}

function buildAlignedRows(platform: PlatformTestRecord[], benchRows: BenchRecord[]): AlignedRow[] {
  const platformMap = new Map<string, PlatformTestRecord[]>();
  const benchMap = new Map<string, BenchRecord[]>();
  platform.forEach((p) => {
    const k = p.meterNo;
    platformMap.set(k, [...(platformMap.get(k) || []), p]);
  });
  benchRows.forEach((b) => {
    const k = b.meterNo;
    benchMap.set(k, [...(benchMap.get(k) || []), b]);
  });
  const keys = Array.from(new Set([...platformMap.keys(), ...benchMap.keys()])).sort();
  const out: AlignedRow[] = [];
  keys.forEach((k) => {
    const pList = platformMap.get(k) || [];
    const bList = benchMap.get(k) || [];
    const max = Math.max(pList.length, bList.length);
    for (let i = 0; i < max; i += 1) {
      out.push({ meterNo: k, platform: pList[i], bench: bList[i] });
    }
  });
  return out;
}

/** 将多选检验台记录的行合并为匹配用数据（重排 id 避免冲突） */
function mergeBenchRowsFromSheets(sheets: BenchSheet[], selectedIds: string[]): BenchRecord[] {
  const out: BenchRecord[] = [];
  for (const sid of selectedIds) {
    const sh = sheets.find((s) => s.id === sid);
    if (!sh) continue;
    sh.rows.forEach((r, idx) => {
      out.push({ ...r, id: `merged-${sh.id}-${idx}-${r.id}` });
    });
  }
  return out;
}

const emptyBenchRecord = (): BenchRecord => ({
  id: `bench-${Date.now()}`,
  meterNo: '',
  setFlow: 0,
  actualFlow: 0,
  temperature: 20,
  density: 1,
  standardValue: 0,
  relativeErrorPct: 0,
});

function batchPendingCount(b: TestBatch) {
  return Math.max(0, b.totalCount - b.passedCount - b.failedCount);
}

function batchProgressPct(b: TestBatch) {
  if (!b.totalCount) return 0;
  return Math.min(100, Math.max(0, Math.round(((b.passedCount + b.failedCount) / b.totalCount) * 100)));
}

/** 检验台自动配置：按表号绑定，同表号多行按策略选一条 */
function autoBindBenchToPlatform(
  platform: PlatformTestRecord[],
  bench: BenchRecord[],
  strategy: 'minError' | 'first' | 'last',
  trimMeterNo: boolean
): { nextPlatform: PlatformTestRecord[]; matched: number; unmatchedPlatform: number } {
  const usedBench = new Set<string>();
  let matched = 0;
  let unmatchedPlatform = 0;
  const next = platform.map((p) => {
    const key = normMeter(p.meterNo, trimMeterNo);
    const candidates = bench.filter(
      (b) => normMeter(b.meterNo, trimMeterNo) === key && !usedBench.has(b.id)
    );
    if (candidates.length === 0) {
      unmatchedPlatform += 1;
      return { ...p, boundBenchId: null as string | null };
    }
    let pick: BenchRecord;
    if (strategy === 'first') pick = candidates[0];
    else if (strategy === 'last') pick = candidates[candidates.length - 1];
    else
      pick = [...candidates].sort(
        (a, b) => Math.abs(a.relativeErrorPct) - Math.abs(b.relativeErrorPct)
      )[0];
    usedBench.add(pick.id);
    matched += 1;
    return { ...p, boundBenchId: pick.id };
  });
  return { nextPlatform: next, matched, unmatchedPlatform };
}

export const HistoryView: React.FC = () => {
  const [detailBatch, setDetailBatch] = useState<TestBatch | null>(null);
  const [listSelected, setListSelected] = useState<TestBatch | null>(mockBatches[0]);
  const [benchImport, setBenchImport] = useState<Record<string, BenchSheet[]>>(() => ({}));
  const [activeBenchSheetByBatch, setActiveBenchSheetByBatch] = useState<Record<string, string | null>>(() => ({}));
  const [platformState, setPlatformState] = useState<Record<string, PlatformTestRecord[]>>(() => {
    const o: Record<string, PlatformTestRecord[]> = {};
    Object.keys(platformByBatch).forEach((k) => {
      o[k] = platformByBatch[k].map((r) => ({ ...r }));
    });
    return o;
  });
  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [tableNoSearch, setTableNoSearch] = useState('');
  const [appliedListSearch, setAppliedListSearch] = useState('');
  const [appliedTableNoSearch, setAppliedTableNoSearch] = useState('');
  const [sheetModal, setSheetModal] = useState<{
    open: boolean;
    isNew: boolean;
    sheetId: string | null;
    draftName: string;
  }>({ open: false, isNew: true, sheetId: null, draftName: '' });
  const [benchConfigOpen, setBenchConfigOpen] = useState(false);
  const [configBatchId, setConfigBatchId] = useState(mockBatches[0].id);
  const [configStrategy, setConfigStrategy] = useState<'minError' | 'first' | 'last'>('minError');
  const [configTrimMeterNo, setConfigTrimMeterNo] = useState(true);
  const [configRunning, setConfigRunning] = useState(false);
  /** 配置检验台：检验台记录模糊搜索与多选 */
  const [configBenchSearch, setConfigBenchSearch] = useState('');
  const [configSelectedSheetIds, setConfigSelectedSheetIds] = useState<string[]>([]);
  const [configResult, setConfigResult] = useState<{
    matched: number;
    unmatchedPlatform: number;
    benchRows: number;
  } | null>(null);

  const filteredBatches = useMemo(() => {
    const q = appliedListSearch.trim().toLowerCase();
    const tableNeedle = appliedTableNoSearch.replace(/\s+/g, '');

    return mockBatches.filter((b) => {
      const qOk = !q
        ? true
        : [b.batchNo, b.productionOrderNo, b.meterName, b.remark, b.operator].join(' ').toLowerCase().includes(q);

      const tableOk = !tableNeedle
        ? true
        : (platformByBatch[b.id] || []).some((p) => p.meterNo.replace(/\s+/g, '').includes(tableNeedle)) ||
          (benchPoolByBatch[b.id] || []).some((r) => r.meterNo.replace(/\s+/g, '').includes(tableNeedle));

      return qOk && tableOk;
    });
  }, [appliedListSearch, appliedTableNoSearch]);

  useEffect(() => {
    // 仅在主列表页生效：避免搜索变化时右侧仍显示“不在当前筛选结果里的批次”
    if (detailBatch) return;
    if (!listSelected) return;
    if (!filteredBatches.some((b) => b.id === listSelected.id)) setListSelected(null);
  }, [detailBatch, filteredBatches, listSelected]);

  /** 与批次管理一致：按备货单号聚合，组内按开始时间倒序 */
  const groupedHistory = useMemo(() => {
    const map = new Map<string, TestBatch[]>();
    for (const b of filteredBatches) {
      const k = b.productionOrderNo;
      const list = map.get(k);
      if (list) list.push(b);
      else map.set(k, [b]);
    }
    const groups = Array.from(map.entries()).map(([filingNo, items]) => ({
      filingNo,
      items: [...items].sort((a, b) => (a.startTime < b.startTime ? 1 : a.startTime > b.startTime ? -1 : 0)),
    }));
    groups.sort((a, b) => {
      const ta = a.items[0]?.startTime ?? '';
      const tb = b.items[0]?.startTime ?? '';
      return ta < tb ? 1 : ta > tb ? -1 : a.filingNo.localeCompare(b.filingNo);
    });
    return groups;
  }, [filteredBatches]);

  const [expandedHistoryFilings, setExpandedHistoryFilings] = useState<Set<string>>(() => new Set());

  const toggleHistoryFiling = useCallback((filingNo: string) => {
    setExpandedHistoryFilings((prev) => {
      const next = new Set(prev);
      if (next.has(filingNo)) next.delete(filingNo);
      else next.add(filingNo);
      return next;
    });
  }, []);

  const aggregateHistoryGroup = (items: TestBatch[]) => {
    const totalCount = items.reduce((s, i) => s + i.totalCount, 0);
    const passedCount = items.reduce((s, i) => s + i.passedCount, 0);
    const failedCount = items.reduce((s, i) => s + i.failedCount, 0);
    const pendingCount = items.reduce((s, i) => s + batchPendingCount(i), 0);
    const progress = totalCount ? Math.min(100, Math.round(((passedCount + failedCount) / totalCount) * 100)) : 0;
    const latestStart = items.reduce((best, i) => (i.startTime > best ? i.startTime : best), items[0]?.startTime ?? '');
    return { totalCount, passedCount, failedCount, pendingCount, progress, batchCount: items.length, latestStart };
  };

  const filteredConfigSheets = useMemo(() => {
    const sheets = benchImport[configBatchId] || [];
    const q = configBenchSearch.trim().toLowerCase();
    if (!q) return sheets;
    return sheets.filter((s) =>
      [s.name, s.fileName || '', s.uploadedAt || ''].join(' ').toLowerCase().includes(q)
    );
  }, [benchImport, configBatchId, configBenchSearch]);

  useEffect(() => {
    if (!benchConfigOpen) return;
    const sheets = benchImport[configBatchId] || [];
    setConfigSelectedSheetIds((prev) => {
      const next = prev.filter((id) => sheets.some((s) => s.id === id));
      if (next.length > 0) return next;
      return sheets.map((s) => s.id);
    });
    setConfigBenchSearch('');
  }, [benchConfigOpen, configBatchId, benchImport]);

  const currentSheets = listSelected ? benchImport[listSelected.id] || [] : [];

  const updateBindingForBatch = (batchId: string, platformId: string, benchId: string) => {
    setPlatformState((prev) => ({
      ...prev,
      [batchId]: (prev[batchId] || []).map((p) =>
        p.id === platformId ? { ...p, boundBenchId: benchId || null } : p
      ),
    }));
  };

  const simulateExcelImport = () => {
    if (!listSelected) return;
    const batchId = listSelected.id;
    const base = getBenchRowsByBatch(benchPoolByBatch[batchId] || [], batchId);
    const name = `检验台-${(benchImport[batchId] || []).length + 1}`;
    const sheet = makeBenchSheet(batchId, base, name, '演示导入.xlsx');
    setBenchImport((prev) => ({
      ...prev,
      [batchId]: [...(prev[batchId] || []), sheet],
    }));
    setActiveBenchSheetByBatch((prev) => ({ ...prev, [batchId]: sheet.id }));
    alert('已模拟导入一条检验台 Excel 数据');
  };

  const loadBenchForBatch = (batchId: string) => {
    const base = getBenchRowsByBatch(benchPoolByBatch[batchId] || [], batchId);
    if (base.length === 0) return 0;
    const name = `检验台-${(benchImport[batchId] || []).length + 1}`;
    const sheet = makeBenchSheet(batchId, base, name, '演示导入.xlsx');
    setBenchImport((prev) => ({
      ...prev,
      [batchId]: [...(prev[batchId] || []), sheet],
    }));
    setActiveBenchSheetByBatch((prev) => ({ ...prev, [batchId]: sheet.id }));
    return base.length;
  };

  const runBenchAutoConfig = async () => {
    const batchId = configBatchId;
    const sheetList = benchImport[batchId] || [];
    if (configSelectedSheetIds.length === 0) {
      alert('请至少选择一条检验台记录');
      return;
    }
    let bench = mergeBenchRowsFromSheets(sheetList, configSelectedSheetIds);
    if (bench.length === 0) {
      alert('所选检验台记录暂无行数据，请先上传 Excel 或使用演示数据');
      setConfigResult({ matched: 0, unmatchedPlatform: (platformState[batchId] || []).length, benchRows: 0 });
      return;
    }
    const plat = platformState[batchId] || [];
    if (plat.length === 0 || bench.length === 0) {
      setConfigResult({ matched: 0, unmatchedPlatform: plat.length, benchRows: bench.length });
      return;
    }
    setConfigRunning(true);
    setConfigResult(null);
    await new Promise((r) => setTimeout(r, 900));
    const { nextPlatform, matched, unmatchedPlatform } = autoBindBenchToPlatform(
      plat,
      bench,
      configStrategy,
      configTrimMeterNo
    );
    setPlatformState((prev) => ({ ...prev, [batchId]: nextPlatform }));
    setConfigResult({ matched, unmatchedPlatform, benchRows: bench.length });
    setConfigRunning(false);
    setListSelected(mockBatches.find((b) => b.id === batchId) || listSelected);
  };

  const openDetail = (b: TestBatch) => setDetailBatch(b);
  const detailPlatform = detailBatch ? platformState[detailBatch.id] || [] : [];
  const detailSheetList = detailBatch ? benchImport[detailBatch.id] || [] : [];
  const detailActiveSheetId = detailBatch ? activeBenchSheetByBatch[detailBatch.id] : null;
  const detailBenchList = detailSheetList.find((s) => s.id === detailActiveSheetId)?.rows || [];

  const bindModalPlatform = detailBatch ? platformState[detailBatch.id] || [] : [];
  const bindModalBench = detailBenchList;

  const updateDetailBinding = (platformId: string, benchId: string) => {
    if (!detailBatch) return;
    setPlatformState((prev) => ({
      ...prev,
      [detailBatch.id]: (prev[detailBatch.id] || []).map((p) =>
        p.id === platformId ? { ...p, boundBenchId: benchId || null } : p
      ),
    }));
  };

  const openAddSheet = () => setSheetModal({ open: true, isNew: true, sheetId: null, draftName: '' });

  const openEditSheet = (sheet: BenchSheet) =>
    setSheetModal({ open: true, isNew: false, sheetId: sheet.id, draftName: sheet.name });

  const saveSheetDraft = () => {
    if (!listSelected) return;
    const name = sheetModal.draftName.trim();
    if (!name) {
      alert('请填写检验台名称');
      return;
    }
    if (sheetModal.isNew) {
      const nextSheet: BenchSheet = {
        id: `sheet-${listSelected.id}-${Date.now()}`,
        name,
        rows: [],
      };
      setBenchImport((prev) => ({ ...prev, [listSelected.id]: [nextSheet, ...(prev[listSelected.id] || [])] }));
      setActiveBenchSheetByBatch((prev) => ({ ...prev, [listSelected.id]: nextSheet.id }));
    } else if (sheetModal.sheetId) {
      setBenchImport((prev) => ({
        ...prev,
        [listSelected.id]: (prev[listSelected.id] || []).map((s) =>
          s.id === sheetModal.sheetId ? { ...s, name } : s
        ),
      }));
    }
    setSheetModal({ open: false, isNew: true, sheetId: null, draftName: '' });
  };

  const deleteSheet = (sheetId: string) => {
    if (!listSelected) return;
    if (!confirm('确定删除该检验台记录及其 Excel 数据？')) return;
    let nextActive: string | null = null;
    setBenchImport((prev) => {
      const next = (prev[listSelected.id] || []).filter((s) => s.id !== sheetId);
      nextActive = next[0]?.id || null;
      return { ...prev, [listSelected.id]: next };
    });
    setActiveBenchSheetByBatch((prev) => ({ ...prev, [listSelected.id]: nextActive }));
    setPlatformState((prev) => ({
      ...prev,
      [listSelected.id]: (prev[listSelected.id] || []).map((p) => ({ ...p, boundBenchId: null })),
    }));
  };

  const toggleConfigSheetSelect = useCallback((id: string) => {
    setConfigSelectedSheetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAllFilteredConfigSheets = useCallback(() => {
    setConfigSelectedSheetIds((prev) => {
      const next = new Set(prev);
      filteredConfigSheets.forEach((s) => next.add(s.id));
      return Array.from(next);
    });
  }, [filteredConfigSheets]);

  const clearFilteredConfigSheets = useCallback(() => {
    const drop = new Set(filteredConfigSheets.map((s) => s.id));
    setConfigSelectedSheetIds((prev) => prev.filter((id) => !drop.has(id)));
  }, [filteredConfigSheets]);

  const uploadSheetExcel = (sheetId: string, file?: File | null) => {
    if (!listSelected || !file) return;
    const baseRows = getBenchRowsByBatch(benchPoolByBatch[listSelected.id] || [], listSelected.id);
    setBenchImport((prev) => ({
      ...prev,
      [listSelected.id]: (prev[listSelected.id] || []).map((s) =>
        s.id === sheetId
          ? {
              ...s,
              fileName: file.name,
              uploadedAt: new Date().toLocaleString('zh-CN'),
              rows: baseRows,
            }
          : s
      ),
    }));
    setActiveBenchSheetByBatch((prev) => ({ ...prev, [listSelected.id]: sheetId }));
  };

  /* ---------- 批次详情页 ---------- */
  if (detailBatch) {
    return (
      <div className="p-4 space-y-4 bg-slate-50/50 min-h-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ActionButton variant="ghost" onClick={() => setDetailBatch(null)} icon={ArrowLeft} className="font-black text-slate-600">
            返回批量测试历史
          </ActionButton>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={Link2} onClick={() => setBindModalOpen(true)}>
              绑定检验台数据
            </ActionButton>
            <ActionButton icon={FileDown}>导出详情</ActionButton>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 relative overflow-hidden">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">批次编号</p>
            <p className="font-mono font-black text-lg text-slate-900">{detailBatch.batchNo}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">测试时间</p>
            <p className="font-bold text-slate-700">{detailBatch.startTime}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">操作员</p>
            <p className="font-bold text-slate-700">{detailBatch.operator}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">合格率</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-emerald-600">
                {((detailBatch.passedCount / detailBatch.totalCount) * 100).toFixed(1)}%
              </p>
              <BarChart3 className="text-emerald-500" size={20} />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-2 px-1">
          <Info size={14} className="text-primary shrink-0" />
          绑定结果：每只水表展示平台记录 + 已绑定的检验台字段（设定流量、实际流量、温度等）。表号不一致时行背景标红。
        </p>

        <TableContainer>
          <TableHead>
            <tr>
              <TableHeader>测试任务号</TableHeader>
              <TableHeader>表号(平台)</TableHeader>
              <TableHeader>IMEI</TableHeader>
              <TableHeader>测试时间</TableHeader>
              <TableHeader>合格状态</TableHeader>
              <TableHeader>设定流量</TableHeader>
              <TableHeader>实际流量</TableHeader>
              <TableHeader>温度</TableHeader>
              <TableHeader>密度</TableHeader>
              <TableHeader>标准值</TableHeader>
              <TableHeader>相对误差%</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {detailPlatform.map((meter) => {
              const b = benchById(detailBenchList, meter.boundBenchId);
              const mismatch = b && b.meterNo !== meter.meterNo;
              const tableNeedle = appliedTableNoSearch.replace(/\s+/g, '');
              const searchedMatch = !!tableNeedle && meter.meterNo.replace(/\s+/g, '').includes(tableNeedle);
              return (
                <TableRow
                  key={meter.id}
                  className={`${mismatch ? 'bg-rose-50' : ''} ${searchedMatch ? 'ring-2 ring-primary/30' : ''}`.trim()}
                >
                  <TableCell className="font-mono text-slate-500 text-xs">{meter.taskNo}</TableCell>
                  <TableCell className="font-mono font-black text-slate-900">{meter.meterNo}</TableCell>
                  <TableCell className="font-mono text-slate-400 text-[10px]">{meter.imei}</TableCell>
                  <TableCell className="text-slate-500 text-xs">{meter.timestamp}</TableCell>
                  <TableCell>
                    <StatusBadge variant={meter.status === 'passed' ? 'success' : 'error'}>
                      {meter.status === 'passed' ? '合格' : '异常'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="font-mono">{b ? b.setFlow : '—'}</TableCell>
                  <TableCell className="font-mono">{b ? b.actualFlow : '—'}</TableCell>
                  <TableCell className="font-mono">{b ? b.temperature : '—'}</TableCell>
                  <TableCell className="font-mono">{b ? b.density : '—'}</TableCell>
                  <TableCell className="font-mono">{b ? b.standardValue : '—'}</TableCell>
                  <TableCell className={`font-mono ${b && b.relativeErrorPct > 0 ? 'text-rose-600' : b ? 'text-emerald-600' : ''}`}>
                    {b ? b.relativeErrorPct : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </TableContainer>

        <AnimatePresence>
          {bindModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setBindModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div>
                    <h3 className="font-black text-slate-900">绑定检验台数据</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      检验台数据多来自线下 Excel，与平台采集记录请手动选择匹配，避免同表多次测试导致自动匹配错误。
                    </p>
                  </div>
                  <button type="button" onClick={() => setBindModalOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800">
                    关闭
                  </button>
                </div>
                <div className="overflow-auto p-4 flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 text-[11px] uppercase border-b border-slate-100">
                        <th className="py-2 pr-2">平台表号</th>
                        <th className="py-2 pr-2">选择检验台记录</th>
                        <th className="py-2">预览</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bindModalPlatform.map((p) => {
                        const candidates = bindModalBench.filter((r) => r.meterNo === p.meterNo);
                        const other = bindModalBench.filter((r) => r.meterNo !== p.meterNo);
                        const sel = benchById(bindModalBench, p.boundBenchId);
                        return (
                          <tr key={p.id} className="border-b border-slate-50">
                            <td className="py-3 font-mono font-bold text-slate-900">{p.meterNo}</td>
                            <td className="py-3 pr-2">
                              <select
                                value={p.boundBenchId || ''}
                                onChange={(e) => updateDetailBinding(p.id, e.target.value)}
                                className="w-full max-w-md border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white"
                              >
                                <option value="">— 未绑定 —</option>
                                <optgroup label="表号一致">
                                  {candidates.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.id} | 设定{c.setFlow} 实际{c.actualFlow} 误差{c.relativeErrorPct}%
                                    </option>
                                  ))}
                                </optgroup>
                                {other.length > 0 && (
                                  <optgroup label="其他表号（强制指定）">
                                    {other.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.meterNo} | 设定{c.setFlow} 实际{c.actualFlow}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>
                            </td>
                            <td className="py-3 text-xs text-slate-500 font-mono">
                              {sel
                                ? `流量 ${sel.actualFlow}/${sel.setFlow} 温${sel.temperature}℃`
                                : '未选择'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                  <ActionButton variant="outline" onClick={() => setBindModalOpen(false)}>
                    完成
                  </ActionButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ---------- 主视图：批量测试历史表 + 侧栏摘要 + 配置检验台弹窗 ---------- */
  return (
    <div className="p-4 min-h-full bg-slate-50/50 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">批量测试历史</h3>
            {/* <p className="text-xs text-slate-500 mt-0.5">
              测试历史以批次快照为主视图；检验台数据通过「配置检验台」自动匹配，必要时在详情中手动调整
            </p> */}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            placeholder="搜索表号(平台，14位)…"
            value={tableNoSearch}
            onChange={(e) => setTableNoSearch(e.target.value)}
            className="w-52 min-w-[180px]"
          />
          <SearchInput
            placeholder="搜索备货单号、测试批号、表具名称..."
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            className="w-56 min-w-[200px]"
          />
          <ActionButton
            variant="primary"
            icon={Search}
            onClick={() => {
              setAppliedListSearch(listSearch);
              setAppliedTableNoSearch(tableNoSearch);
              setExpandedHistoryFilings(new Set());
              setListSelected(null);
            }}
            className="min-w-[92px]"
          >
            搜索
          </ActionButton>
          <ActionButton
            variant="danger"
            icon={RotateCcw}
            onClick={() => {
              setListSearch('');
              setTableNoSearch('');
              setAppliedListSearch('');
              setAppliedTableNoSearch('');
              setExpandedHistoryFilings(new Set());
              setListSelected(mockBatches[0]);
            }}
            className="min-w-[92px]"
          >
            重置
          </ActionButton>
          <ActionButton variant="outline" icon={Calendar}>
            时间筛选
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 items-stretch">
        {/* 左侧：按备货单聚合展开，约占 70% 宽度（xl 横排时与右侧 7:3） */}
        <div className="w-full min-w-0 flex flex-col gap-3 min-h-[420px] xl:flex-[7]">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <TableContainer className="border-0 rounded-none shadow-none">
              <TableHead>
                <tr>
                  <TableHeader className="w-10 px-2" />
                  <TableHeader className="whitespace-nowrap min-w-[200px]">备货单号</TableHeader>
                  <TableHeader className="whitespace-nowrap min-w-[160px]">表具名称 / 批次摘要</TableHeader>
                  <TableHeader className="whitespace-nowrap">备注</TableHeader>
                  <TableHeader className="whitespace-nowrap text-center">设备总数</TableHeader>
                  <TableHeader className="whitespace-nowrap text-center">合格</TableHeader>
                  <TableHeader className="whitespace-nowrap text-center">异常</TableHeader>
                  <TableHeader className="whitespace-nowrap text-center">待测</TableHeader>
                  <TableHeader className="whitespace-nowrap min-w-[140px]">测试进度</TableHeader>
                  <TableHeader className="text-right whitespace-nowrap">操作</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {groupedHistory.length === 0 ? (
                  <TableRow>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400 text-sm">
                      暂无数据，请调整搜索条件
                    </td>
                  </TableRow>
                ) : (
                  groupedHistory.map(({ filingNo, items }) => {
                    const expanded = expandedHistoryFilings.has(filingNo);
                    const agg = aggregateHistoryGroup(items);
                    return (
                      <React.Fragment key={filingNo}>
                        <TableRow
                          className="bg-slate-50/90 hover:bg-slate-100/90 cursor-pointer transition-colors"
                          onClick={() => toggleHistoryFiling(filingNo)}
                        >
                          <TableCell className="w-10 px-2 align-middle">
                            <button
                              type="button"
                              className="p-1 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                              aria-expanded={expanded}
                              aria-label={expanded ? '收起' : '展开'}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHistoryFiling(filingNo);
                              }}
                            >
                              {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          </TableCell>
                          <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap">{filingNo}</TableCell>
                          <TableCell className="text-slate-700 font-bold min-w-[200px]">
                            <span className="text-primary">共 {agg.batchCount} 条历史批次</span>
                            <span className="text-slate-400 font-medium text-xs ml-2">（点击行展开）</span>
                          </TableCell>
                          <TableCell className="text-slate-400 whitespace-nowrap">—</TableCell>
                          <TableCell className="text-center font-black text-slate-800">{agg.totalCount}</TableCell>
                          <TableCell className="text-center font-black text-emerald-600">{agg.passedCount}</TableCell>
                          <TableCell className="text-center font-black text-rose-600">{agg.failedCount}</TableCell>
                          <TableCell className="text-center font-black text-amber-700">{agg.pendingCount}</TableCell>
                          <TableCell className="min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${agg.progress}%` }} />
                              </div>
                              <span className="text-xs font-black text-slate-600 w-9 text-right">{agg.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap text-slate-400">—</TableCell>
                        </TableRow>
                        {expanded &&
                          items.map((batch) => {
                            const pending = batchPendingCount(batch);
                            const progress = batchProgressPct(batch);
                            return (
                              <TableRow
                                key={batch.id}
                                onClick={() => setListSelected(batch)}
                                className={`bg-white hover:bg-slate-50/80 cursor-pointer border-b border-slate-50 ${
                                  listSelected?.id === batch.id ? 'bg-primary/5' : ''
                                }`}
                              >
                                <TableCell className="w-10 px-2 bg-slate-50/50 border-l-2 border-primary/30" />
                                <TableCell className="font-mono font-black text-slate-800 whitespace-nowrap pl-2">
                                  <span className="text-slate-400 font-medium text-xs mr-2">测试批号</span>
                                  {batch.batchNo}
                                </TableCell>
                                <TableCell className="text-slate-800 font-bold min-w-[160px]">{batch.meterName}</TableCell>
                                <TableCell className="text-slate-500 text-xs max-w-[140px] truncate" title={batch.remark || ''}>
                                  {batch.remark || '—'}
                                </TableCell>
                                <TableCell className="text-center font-black text-slate-800">{batch.totalCount}</TableCell>
                                <TableCell className="text-center font-black text-emerald-600">{batch.passedCount}</TableCell>
                                <TableCell className="text-center font-black text-rose-600">{batch.failedCount}</TableCell>
                                <TableCell className="text-center font-black text-amber-700">{pending}</TableCell>
                                <TableCell className="min-w-[140px]">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-slate-600 w-9 text-right">{progress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfigBatchId(batch.id);
                                        setConfigResult(null);
                                        setBenchConfigOpen(true);
                                      }}
                                      className="text-slate-600 font-bold text-xs hover:underline inline-flex items-center gap-1"
                                    >
                                      <Settings2 size={14} className="text-slate-500" />
                                      配置检验台
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openDetail(batch)}
                                      className="text-primary font-bold text-xs hover:underline inline-flex items-center gap-0.5"
                                    >
                                      详情 <ChevronRight size={14} />
                                    </button>
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
        </div>

        {/* 右侧：检验台数据（约占 30%；不展示测试批号，仅上下文备货单+表具） */}
        <div className="w-full min-w-0 flex flex-col gap-3 min-h-[480px] xl:flex-[3]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden min-h-[460px]">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/80">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">检验台数据</p>
                
              </div>
              {listSelected && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="inline-flex items-center">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (!listSelected) return;
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const base = getBenchRowsByBatch(
                          benchPoolByBatch[listSelected.id] || [],
                          listSelected.id
                        );
                        const name = file.name.replace(/\.(xlsx|xls|csv)$/i, '') || file.name;
                        const sheet = makeBenchSheet(listSelected.id, base, name, file.name);
                        setBenchImport((prev) => ({
                          ...prev,
                          [listSelected.id]: [...(prev[listSelected.id] || []), sheet],
                        }));
                        setActiveBenchSheetByBatch((prev) => ({
                          ...prev,
                          [listSelected.id]: sheet.id,
                        }));
                        e.target.value = '';
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-50">
                      <Upload size={14} />
                      上传 Excel
                    </span>
                  </label>
                  <ActionButton size="sm" variant="outline" icon={Plus} onClick={openAddSheet}>
                    新增空记录
                  </ActionButton>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-2">
              {!listSelected ? (
                <p className="text-sm text-slate-400 text-center py-16">点击左侧某一行批次，查看并维护检验台数据</p>
              ) : (benchImport[listSelected.id] || []).length === 0 ? (
                <p className="text-sm text-amber-700 font-bold text-center py-12 px-4">
                  暂无检验台记录，可点击右上角「上传 Excel」生成一条记录，或「新增空记录」仅录入名称
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[320px]">
                    <thead className="text-slate-500 font-bold border-b border-slate-100 bg-slate-50/80">
                      <tr>
                        <th className="py-2 px-2 text-left">名称</th>
                        <th className="py-2 px-2 text-left">Excel 文件</th>
                        <th className="py-2 px-2 text-left">行数</th>
                        <th className="py-2 px-2 text-left">上传时间</th>
                        <th className="py-2 px-2 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(benchImport[listSelected.id] || []).map((sheet) => (
                        <tr
                          key={sheet.id}
                          className={`border-b border-slate-50 hover:bg-slate-50/80 ${
                            activeBenchSheetByBatch[listSelected.id] === sheet.id ? 'bg-primary/5' : ''
                          }`}
                          onClick={() =>
                            setActiveBenchSheetByBatch((prev) => ({ ...prev, [listSelected.id]: sheet.id }))
                          }
                        >
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              className="text-left text-sm font-bold text-slate-900 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditSheet(sheet);
                              }}
                            >
                              {sheet.name}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-xs text-slate-600">
                            {sheet.fileName || <span className="text-amber-600">未上传</span>}
                          </td>
                          <td className="py-2 px-2 font-mono">{sheet.rows.length}</td>
                          <td className="py-2 px-2 text-xs text-slate-500">
                            {sheet.uploadedAt || '—'}
                          </td>
                          <td className="py-2 px-2 text-right whitespace-nowrap">
                            <ActionButton
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              className="text-rose-400 hover:text-rose-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSheet(sheet.id);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={sheetModal.open}
        onClose={() => setSheetModal({ open: false, isNew: true, sheetId: null, draftName: '' })}
        title={sheetModal.isNew ? '新增检验台记录' : '编辑检验台记录'}
        size="md"
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setSheetModal({ open: false, isNew: true, sheetId: null, draftName: '' })}>
              取消
            </ActionButton>
            <ActionButton onClick={saveSheetDraft}>保存</ActionButton>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            检验台名称 <span className="text-rose-500">*</span>
          </label>
          <input
            value={sheetModal.draftName}
            onChange={(e) => setSheetModal((m) => ({ ...m, draftName: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
            placeholder="例如：A线检验台-上午场"
          />
        </div>
      </Modal>

      <AnimatePresence>
        {benchConfigOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !configRunning && setBenchConfigOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/15 text-primary">
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">配置检验台</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">导入检验台数据并按规则自动与平台表号匹配绑定</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                    目标批次
                  </label>
                  <select
                    value={configBatchId}
                    onChange={(e) => {
                      setConfigBatchId(e.target.value);
                      setConfigResult(null);
                    }}
                    disabled={configRunning}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold font-mono"
                  >
                    {mockBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.productionOrderNo} · {b.batchNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-500 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  左侧为当前批次<strong>平台表号</strong>列表，右侧可<strong>多选</strong>检验台记录（支持模糊搜索名称/文件名），合并行数据参与匹配；中间点击「匹配」按表号自动绑定，下方展示匹配结果。
                </div>

                {(() => {
                  const plat = platformState[configBatchId] || [];
                  const sheets = benchImport[configBatchId] || [];
                  const benchMerged = mergeBenchRowsFromSheets(sheets, configSelectedSheetIds);
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                      {/* 左：平台表号 */}
                      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[260px]">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                          <h4 className="font-black text-slate-800 text-sm">批次平台表号</h4>
                          <p className="text-[10px] text-slate-500">作为匹配左侧数据源</p>
                        </div>
                        <div className="overflow-auto flex-1 max-h-[320px]">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr className="text-slate-500 border-b border-slate-100">
                                <th className="py-2 px-2 text-left">表号</th>
                                <th className="py-2 px-2 text-left">任务号</th>
                                <th className="py-2 px-2 text-left">状态</th>
                              </tr>
                            </thead>
                            <tbody>
                              {plat.length === 0 ? (
                                <tr>
                                  <td colSpan={3} className="py-8 text-center text-slate-400">
                                    暂无平台记录
                                  </td>
                                </tr>
                              ) : (
                                plat.map((p) => (
                                  <tr key={p.id} className="border-b border-slate-50">
                                    <td className="py-2 px-2 font-mono font-bold">{p.meterNo}</td>
                                    <td className="py-2 px-2 font-mono text-slate-600">{p.taskNo}</td>
                                    <td className="py-2 px-2">
                                      <StatusBadge variant={p.status === 'passed' ? 'success' : 'error'}>
                                        {p.status === 'passed' ? '合格' : '异常'}
                                      </StatusBadge>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 中：匹配按钮 */}
                      <div className="flex flex-col items-center justify-center gap-3 py-4 lg:px-2">
                        <button
                          type="button"
                          disabled={configRunning || configSelectedSheetIds.length === 0}
                          onClick={runBenchAutoConfig}
                          className="flex flex-col items-center justify-center gap-2 min-w-[110px] px-4 py-5 rounded-2xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60"
                        >
                          {configRunning ? <Loader2 className="animate-spin" size={28} /> : <Link2 size={28} strokeWidth={2.5} />}
                          {configRunning ? '匹配中…' : '匹配'}
                        </button>
                        <p className="text-[11px] text-slate-500 text-center px-1">
                          按表号一键匹配，内部使用“误差最小优先 + 去空格”规则
                        </p>
                      </div>

                      {/* 右：检验台数据（多选 + 模糊搜索 + 合并预览） */}
                      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[260px]">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h4 className="font-black text-slate-800 text-sm">检验台数据</h4>
                            <span className="text-[11px] font-bold text-slate-500">
                              已选 {configSelectedSheetIds.length} 条 / 合并 {benchMerged.length} 行
                            </span>
                          </div>
                          <SearchInput
                            placeholder="搜索检验台名称、文件名…"
                            value={configBenchSearch}
                            onChange={(e) => setConfigBenchSearch(e.target.value)}
                            disabled={configRunning}
                            className="w-full min-w-0"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={configRunning || filteredConfigSheets.length === 0}
                              onClick={selectAllFilteredConfigSheets}
                              className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                            >
                              全选当前筛选
                            </button>
                            <button
                              type="button"
                              disabled={configRunning || filteredConfigSheets.length === 0}
                              onClick={clearFilteredConfigSheets}
                              className="text-xs font-bold text-slate-500 hover:underline disabled:opacity-50"
                            >
                              清除当前筛选
                            </button>
                          </div>
                          <div className="max-h-[140px] overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-2 bg-white">
                            {sheets.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-4">该批次暂无检验台记录，请先在列表页上传</p>
                            ) : filteredConfigSheets.length === 0 ? (
                              <p className="text-xs text-amber-700 text-center py-4">无匹配记录，请调整搜索词</p>
                            ) : (
                              filteredConfigSheets.map((s) => {
                                const checked = configSelectedSheetIds.includes(s.id);
                                return (
                                  <label
                                    key={s.id}
                                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 cursor-pointer text-xs ${
                                      checked ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'
                                }`}
                                  >
                                    <span className="mt-0.5 w-4 h-4 rounded border border-slate-300 flex items-center justify-center shrink-0 bg-white">
                                      {checked && <Check size={12} className="text-primary" strokeWidth={3} />}
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={checked}
                                      disabled={configRunning}
                                      onChange={() => toggleConfigSheetSelect(s.id)}
                                    />
                                    <span className="flex-1 min-w-0">
                                      <span className="font-bold text-slate-900">{s.name}</span>
                                      <span className="block text-slate-500 truncate">
                                        {s.fileName || '未上传文件'} · {s.rows.length} 行
                                      </span>
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">合并预览（参与匹配）</p>
                        </div>
                        <div className="overflow-auto flex-1 max-h-[320px]">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr className="text-slate-600 border-b border-slate-100">
                                <th className="py-2 px-2 text-left">表号</th>
                                <th className="py-2 px-2 text-left">设定流量</th>
                                <th className="py-2 px-2 text-left">实际流量</th>
                                <th className="py-2 px-2 text-left">温度</th>
                                <th className="py-2 px-2 text-left">误差%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {configSelectedSheetIds.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-slate-400">
                                    请至少勾选一条检验台记录
                                  </td>
                                </tr>
                              ) : benchMerged.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-slate-400">
                                    所选记录暂无行数据
                                  </td>
                                </tr>
                              ) : (
                                benchMerged.map((row) => (
                                  <tr key={row.id} className="border-b border-slate-50">
                                    <td className="py-2 px-2 font-mono font-bold">{row.meterNo}</td>
                                    <td className="py-2 px-2 font-mono">{row.setFlow}</td>
                                    <td className="py-2 px-2 font-mono">{row.actualFlow}</td>
                                    <td className="py-2 px-2 font-mono">{row.temperature}</td>
                                    <td
                                      className={`py-2 px-2 font-mono ${
                                        row.relativeErrorPct > 0 ? 'text-rose-600' : 'text-emerald-700'
                                      }`}
                                    >
                                      {row.relativeErrorPct}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 批次结果 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-black text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart3 size={16} className="text-primary" />
                    批次结果
                  </p>
                  {configResult ? (
                    <ul className="text-xs text-slate-700 space-y-1 font-medium">
                      <li>
                        成功匹配绑定：<span className="font-black text-emerald-700">{configResult.matched}</span> 条
                      </li>
                      <li>
                        检验台数据行数：<span className="font-black">{configResult.benchRows}</span> 行
                      </li>
                      <li>
                        平台未匹配到检验台：<span className="font-black text-amber-700">{configResult.unmatchedPlatform}</span> 条
                      </li>
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">点击中间「匹配」后在此展示统计结果。</p>
                  )}
                </div>

              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end bg-slate-50/80">
                <ActionButton variant="outline" disabled={configRunning} onClick={() => setBenchConfigOpen(false)}>
                  关闭
                </ActionButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
