import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Printer,
  QrCode,
  Save,
  Scan,
  Trash2,
} from 'lucide-react';
import {
  ActionButton,
  Modal,
  SearchInput,
  StatusBadge,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/UIComponents';

interface PackagingRecord {
  id: string;
  productionOrderNo: string;
  boxNo: string;
  testBatchBarcodeInfo: string;
  meterNos: string[];
  meterName: string;
  meterType: string; // LYNB-1
  caliber: string;
  inspector: string;
  packagingTime: string;
  packagingRemark: string;
  createdAt: string;
}

const NB_METER_NAME = '无阀无磁NB水表';
const NB_METER_TYPE = 'LYNB-1';
const METER_OPTIONS = [
  { name: '无阀无磁NB水表', type: 'LYNB-1', caliber: 'DN20' },
  { name: '有阀无磁NB水表', type: 'LYNB-2', caliber: 'DN15' },
  { name: '有阀有磁NB水表', type: 'LYNB-3', caliber: 'DN25' },
] as const;

const WORK_ORDER_META: Record<string, { caliber: string; expectedMeterNos: string[] }> = {
  'WO-20260318-001': {
    caliber: 'DN15',
    expectedMeterNos: [
      '20260318000001',
      '20260318000002',
      '20260318000003',
      '20260318000004',
      '20260318000005',
      '20260318000006',
      '20260318000007',
      '20260318000008',
      '20260318000009',
      '20260318000010',
    ],
  },
  'WO-20260318-002': {
    caliber: 'DN20',
    expectedMeterNos: [
      '20260318000011',
      '20260318000012',
      '20260318000013',
      '20260318000014',
      '20260318000015',
      '20260318000016',
      '20260318000017',
      '20260318000018',
      '20260318000019',
      '20260318000020',
    ],
  },
  'WO-20260317-006': {
    caliber: 'DN25',
    expectedMeterNos: [
      '20260317000001',
      '20260317000002',
      '20260317000003',
      '20260317000004',
      '20260317000005',
      '20260317000006',
      '20260317000007',
      '20260317000008',
      '20260317000009',
      '20260317000010',
    ],
  },
};

const WORK_ORDER_OPTIONS = Object.keys(WORK_ORDER_META);

const initialRecords: PackagingRecord[] = [
  {
    id: 'p1',
    productionOrderNo: 'WO-20260318-001',
    boxNo: 'BX-20260318-001',
    testBatchBarcodeInfo: 'BATCH-20260318-001|BARCODE-BATCH-20260318-001',
    meterNos: WORK_ORDER_META['WO-20260318-001'].expectedMeterNos,
    meterName: NB_METER_NAME,
    meterType: NB_METER_TYPE,
    caliber: 'DN15',
    inspector: '赵六',
    packagingTime: '2026-03-18 15:20:00',
    packagingRemark: '',
    createdAt: '2026-03-18 15:21:00',
  },
  {
    id: 'p2',
    productionOrderNo: 'WO-20260318-002',
    boxNo: 'BX-20260318-002',
    testBatchBarcodeInfo: 'BATCH-20260318-002|BARCODE-BATCH-20260318-002',
    meterNos: WORK_ORDER_META['WO-20260318-002'].expectedMeterNos,
    meterName: NB_METER_NAME,
    meterType: NB_METER_TYPE,
    caliber: 'DN20',
    inspector: '张三',
    packagingTime: '2026-03-18 16:05:00',
    packagingRemark: '',
    createdAt: '2026-03-18 16:06:00',
  },
];

const getNextBoxNo = (records: PackagingRecord[]) => {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const maxSeq = records.reduce((acc, item) => {
    const matched = item.boxNo.match(/(\d{3})$/);
    if (!matched) return acc;
    return Math.max(acc, Number(matched[1]));
  }, 0);
  return `BX-${datePart}-${String(maxSeq + 1).padStart(3, '0')}`;
};

const getNowLabel = () => new Date().toLocaleString('zh-CN', { hour12: false });

const makeTestBatchBarcodeInfo = (testBatchNo: string) => `${testBatchNo}|BARCODE-${testBatchNo}`;

const makeBarcodeSvgDataUrl = (value: string) => {
  const bars = value
    .split('')
    .map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const width = (code % 3) + 1;
      const x = 12 + idx * 4;
      const h = 34 + (code % 2) * 8;
      const y = 50 - h;
      return `<rect x="${x}" y="${y}" width="${width}" height="${h}" fill="#0f172a" />`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="72" viewBox="0 0 420 72">
  <rect width="420" height="72" fill="#ffffff"/>
  ${bars}
  <text x="12" y="66" font-size="10" font-family="monospace" fill="#334155">${value}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getNextTestBatchNo = (records: PackagingRecord[], productionOrderNo: string) => {
  const today = new Date();
  const todayPart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const prefix = `BATCH-${todayPart}-`;

  const related = records.filter((r) => r.productionOrderNo === productionOrderNo && r.testBatchBarcodeInfo.includes(prefix));
  const maxSeq = related.reduce((acc, r) => {
    const m = r.testBatchBarcodeInfo.match(new RegExp(`${prefix}(\\d{3})\\|BARCODE-`));
    if (!m) return acc;
    const seq = Number(m[1]);
    return Number.isFinite(seq) ? Math.max(acc, seq) : acc;
  }, 0);

  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
};

export const PackagingView: React.FC = () => {
  const [records, setRecords] = useState<PackagingRecord[]>(initialRecords);
  const [keyword, setKeyword] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [expandedBoxes, setExpandedBoxes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(WORK_ORDER_OPTIONS[0]);
  const [selectedMeterName, setSelectedMeterName] = useState(METER_OPTIONS[0].name);
  const [scanValue, setScanValue] = useState('');
  const [scannedMeterNos, setScannedMeterNos] = useState<string[]>([]);
  const [isMeterTableExpanded, setIsMeterTableExpanded] = useState(true);
  const [lastSavedRecord, setLastSavedRecord] = useState<PackagingRecord | null>(null);

  const expectedMeters = WORK_ORDER_META[selectedWorkOrder].expectedMeterNos;
  const selectedMeterMeta = useMemo(
    () => METER_OPTIONS.find((item) => item.name === selectedMeterName) || METER_OPTIONS[0],
    [selectedMeterName]
  );
  const previewBoxNo = useMemo(() => getNextBoxNo(records), [records]);
  const previewTestBatchBarcodeInfo = useMemo(
    () => makeTestBatchBarcodeInfo(getNextTestBatchNo(records, selectedWorkOrder)),
    [records, selectedWorkOrder]
  );
  const packagingProgress = expectedMeters.length ? Math.min(100, Math.round((scannedMeterNos.length / expectedMeters.length) * 100)) : 0;

  const filteredRecords = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((item) =>
      [
        item.productionOrderNo,
        item.boxNo,
        item.testBatchBarcodeInfo,
        item.meterName,
        item.meterType,
        item.caliber,
        item.inspector,
        item.packagingTime,
        item.packagingRemark,
        item.createdAt,
        item.meterNos.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [keyword, records]);

  const groupedRecords = useMemo(() => {
    return filteredRecords.reduce<Record<string, PackagingRecord[]>>((acc, item) => {
      if (!acc[item.productionOrderNo]) acc[item.productionOrderNo] = [];
      acc[item.productionOrderNo].push(item);
      return acc;
    }, {});
  }, [filteredRecords]);

  const orderKeys = useMemo(() => Object.keys(groupedRecords), [groupedRecords]);

  const meterToBoxOrderHint = useMemo(() => {
    const normalized = keyword.trim();
    if (!normalized) return null;
    const byMeter = records.find((item) => item.meterNos.some((meterNo) => meterNo.includes(normalized)));
    if (byMeter) {
      const meterHit = byMeter.meterNos.find((meterNo) => meterNo.includes(normalized)) || normalized;
      return {
        type: 'meter',
        meterNo: meterHit,
        boxNo: byMeter.boxNo,
        productionOrderNo: byMeter.productionOrderNo,
      };
    }
    const byBox = records.find((item) => item.boxNo.includes(normalized));
    if (byBox) {
      return {
        type: 'box',
        boxNo: byBox.boxNo,
        productionOrderNo: byBox.productionOrderNo,
      };
    }
    return null;
  }, [keyword, records]);

  const handleOpenModal = () => {
    setSelectedWorkOrder(WORK_ORDER_OPTIONS[0]);
    setSelectedMeterName(METER_OPTIONS[0].name);
    setScanValue('');
    setScannedMeterNos([]);
    setIsMeterTableExpanded(true);
    setLastSavedRecord(null);
    setIsModalOpen(true);
  };

  const handleScanSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = scanValue.trim();
    if (!value) return;
    if (scannedMeterNos.includes(value)) {
      alert('该水表表号已扫码，请勿重复录入');
      return;
    }
    if (scannedMeterNos.length >= 10) {
      alert('当前箱号已满 10 个水表表号');
      return;
    }
    setScannedMeterNos((prev) => [...prev, value]);
    setIsMeterTableExpanded(true);
    setScanValue('');
  };

  const handleWorkOrderChange = (value: string) => {
    setSelectedWorkOrder(value);
    setScannedMeterNos([]);
    setScanValue('');
    setIsMeterTableExpanded(true);
    setLastSavedRecord(null);
  };

  const updateScannedMeterNoAt = (index: number, value: string) => {
    const trimmed = value.trim();
    setScannedMeterNos((prev) => {
      const next = [...prev];
      next[index] = trimmed;
      return next;
    });
  };

  const removeScannedMeterNoAt = (index: number) => {
    setScannedMeterNos((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPackagingRecord = (): PackagingRecord => {
    const now = getNowLabel();
    const nextTestBatchNo = getNextTestBatchNo(records, selectedWorkOrder);
    const testBatchBarcodeInfo = makeTestBatchBarcodeInfo(nextTestBatchNo);
    const inspector = '当前登录检验员';

    return {
      id: Date.now().toString(),
      productionOrderNo: selectedWorkOrder,
      boxNo: getNextBoxNo(records),
      testBatchBarcodeInfo,
      meterNos: [...scannedMeterNos], // 保存后需要重置输入框，因此做副本
      meterName: selectedMeterMeta.name,
      meterType: selectedMeterMeta.type,
      caliber: selectedMeterMeta.caliber,
      inspector,
      packagingTime: now,
      packagingRemark: '',
      createdAt: now,
    };
  };

  const savePackagingRecord = () => {
    if (scannedMeterNos.length !== 10) {
      alert('请录入满 10 个水表表号后保存');
      return;
    }

    const record = buildPackagingRecord();
    setRecords((prev) => [record, ...prev]);
    setLastSavedRecord(record);
  };

  const printPackagingLabel = (record: PackagingRecord) => {
    alert(`已触发打印标签（演示）：${record.boxNo}`);
  };

  const printAfterSave = () => {
    if (!lastSavedRecord) {
      alert('请先保存记录后再打印');
      return;
    }
    printPackagingLabel(lastSavedRecord);
  };

  const resetForNextBox = () => {
    setScannedMeterNos([]);
    setScanValue('');
    setIsMeterTableExpanded(true);
  };

  const savePrintThenNextBox = () => {
    if (scannedMeterNos.length !== 10) {
      alert('请录入满 10 个水表表号后再进入下一箱');
      return;
    }

    // 逻辑顺序：先保存 -> 再打印 -> 再重置输入并显示下一箱号（预览由 records 自动累积+1）
    const record = buildPackagingRecord();
    setRecords((prev) => [record, ...prev]);
    setLastSavedRecord(record);
    printPackagingLabel(record);
    resetForNextBox();
  };

  const toggleOrderExpand = (productionOrderNo: string) => {
    setExpandedOrders((prev) => (prev.includes(productionOrderNo) ? prev.filter((x) => x !== productionOrderNo) : [...prev, productionOrderNo]));
  };

  const toggleBoxExpand = (boxNo: string) => {
    setExpandedBoxes((prev) => (prev.includes(boxNo) ? prev.filter((x) => x !== boxNo) : [...prev, boxNo]));
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50/50 min-h-screen relative">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Package size={22} />
          </div>
          <h3 className="text-lg font-black text-slate-900">包装管理</h3>
          {/* <StatusBadge variant="info">按字段清单最终核对版</StatusBadge> */}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[320px]">
            <SearchInput
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="支持链路检索：表号→箱号→备货单号，或箱号→备货单号"
            />
          </div>
          <ActionButton icon={Plus} onClick={handleOpenModal}>
            新增包装记录
          </ActionButton>
          <ActionButton variant="outline" icon={Printer}>
            打印标签
          </ActionButton>
        </div>

        {meterToBoxOrderHint && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
            {meterToBoxOrderHint.type === 'meter' ? (
              <span>
                链路定位：表号 <span className="font-mono font-bold">{meterToBoxOrderHint.meterNo}</span> 属于箱号{' '}
                <span className="font-mono font-bold">{meterToBoxOrderHint.boxNo}</span>，对应备货单号{' '}
                <span className="font-mono font-bold">{meterToBoxOrderHint.productionOrderNo}</span>。
              </span>
            ) : (
              <span>
                链路定位：箱号 <span className="font-mono font-bold">{meterToBoxOrderHint.boxNo}</span> 对应备货单号{' '}
                <span className="font-mono font-bold">{meterToBoxOrderHint.productionOrderNo}</span>。
              </span>
            )}
          </div>
        )}

        <TableContainer>
          <TableHead>
            <tr>
              <TableHeader className="whitespace-nowrap">层级</TableHeader>
              <TableHeader className="whitespace-nowrap">备货单号</TableHeader>
              <TableHeader className="whitespace-nowrap">箱号</TableHeader>
              <TableHeader className="whitespace-nowrap">条码信息（条形码图片）</TableHeader>
              <TableHeader className="whitespace-nowrap">水表表号</TableHeader>
              <TableHeader className="whitespace-nowrap">表具名称</TableHeader>
              <TableHeader className="whitespace-nowrap">表具类型</TableHeader>
              <TableHeader className="whitespace-nowrap">表具口径</TableHeader>
              <TableHeader className="whitespace-nowrap">检验员</TableHeader>
              <TableHeader className="whitespace-nowrap">包装时间</TableHeader>
              <TableHeader className="whitespace-nowrap">备注</TableHeader>
              <TableHeader className="text-right whitespace-nowrap">操作</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {orderKeys.map((orderNo) => {
              const orderRows = groupedRecords[orderNo];
              const orderExpanded = expandedOrders.includes(orderNo);
              const firstRow = orderRows[0];
              return (
                <React.Fragment key={orderNo}>
                  <TableRow className="bg-slate-50/70">
                    <TableCell className="whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleOrderExpand(orderNo)}
                        className="text-xs font-black text-slate-700 flex items-center gap-1"
                      >
                        {orderExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        L1
                      </button>
                    </TableCell>
                    <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap">{orderNo}</TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">共 {orderRows.length} 箱</TableCell>
                    <TableCell>
                      <img
                        src={makeBarcodeSvgDataUrl(firstRow.testBatchBarcodeInfo)}
                        alt="条码"
                        className="h-8 w-44 rounded border border-slate-200 bg-white"
                      />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">共 {orderRows.reduce((acc, item) => acc + item.meterNos.length, 0)} 表</TableCell>
                    <TableCell className="text-slate-700 font-bold whitespace-nowrap">{firstRow.meterName}</TableCell>
                    <TableCell className="text-slate-700 font-bold whitespace-nowrap">{firstRow.meterType}</TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{firstRow.caliber}</TableCell>
                    <TableCell className="text-slate-700 whitespace-nowrap">{firstRow.inspector}</TableCell>
                    <TableCell className="text-slate-500 text-xs whitespace-nowrap">{firstRow.packagingTime}</TableCell>
                    <TableCell className="text-slate-600 text-xs whitespace-nowrap">{firstRow.packagingRemark || '—'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">—</TableCell>
                  </TableRow>

                  {orderExpanded &&
                    orderRows.map((boxRow) => {
                      const boxExpanded = expandedBoxes.includes(boxRow.boxNo);
                      return (
                        <React.Fragment key={boxRow.id}>
                          <TableRow>
                            <TableCell className="whitespace-nowrap pl-8">
                              <button
                                type="button"
                                onClick={() => toggleBoxExpand(boxRow.boxNo)}
                                className="text-xs font-black text-primary flex items-center gap-1"
                              >
                                {boxExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                L2
                              </button>
                            </TableCell>
                            <TableCell className="font-mono text-slate-500 whitespace-nowrap">{boxRow.productionOrderNo}</TableCell>
                            <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap">{boxRow.boxNo}</TableCell>
                            <TableCell>
                              <img
                                src={makeBarcodeSvgDataUrl(boxRow.testBatchBarcodeInfo)}
                                alt="条码"
                                className="h-8 w-44 rounded border border-slate-200 bg-white"
                              />
                            </TableCell>
                            <TableCell className="font-mono text-slate-700 whitespace-nowrap">
                              {boxRow.meterNos[0]} <span className="text-slate-400">等 {boxRow.meterNos.length} 个</span>
                            </TableCell>
                            <TableCell className="text-slate-700 font-bold whitespace-nowrap">{boxRow.meterName}</TableCell>
                            <TableCell className="text-slate-700 font-bold whitespace-nowrap">{boxRow.meterType}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{boxRow.caliber}</TableCell>
                            <TableCell className="text-slate-700 whitespace-nowrap">{boxRow.inspector}</TableCell>
                            <TableCell className="text-slate-500 text-xs whitespace-nowrap">{boxRow.packagingTime}</TableCell>
                            <TableCell className="text-slate-600 text-xs whitespace-nowrap">{boxRow.packagingRemark || '—'}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <button type="button" className="text-xs font-bold text-primary hover:underline">
                                打印
                              </button>
                            </TableCell>
                          </TableRow>

                          {boxExpanded &&
                            boxRow.meterNos.map((meterNo) => (
                              <TableRow key={`${boxRow.id}-${meterNo}`} className="bg-slate-50/40">
                                <TableCell className="whitespace-nowrap pl-14">
                                  <span className="text-xs font-black text-emerald-700">L3</span>
                                </TableCell>
                                <TableCell className="font-mono text-slate-400 whitespace-nowrap">{boxRow.productionOrderNo}</TableCell>
                                <TableCell className="font-mono text-slate-500 whitespace-nowrap">{boxRow.boxNo}</TableCell>
                                <TableCell>
                                  <img
                                    src={makeBarcodeSvgDataUrl(`${boxRow.testBatchBarcodeInfo}-${meterNo.slice(-4)}`)}
                                    alt="条码"
                                    className="h-8 w-44 rounded border border-slate-200 bg-white"
                                  />
                                </TableCell>
                                <TableCell className="font-mono font-bold text-slate-900 whitespace-nowrap">{meterNo}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{boxRow.meterName}</TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">{boxRow.meterType}</TableCell>
                                <TableCell className="text-slate-500 whitespace-nowrap">{boxRow.caliber}</TableCell>
                                <TableCell className="text-slate-500 whitespace-nowrap">{boxRow.inspector}</TableCell>
                                <TableCell className="text-slate-500 text-xs whitespace-nowrap">{boxRow.packagingTime}</TableCell>
                                <TableCell className="text-slate-500 text-xs whitespace-nowrap">{boxRow.packagingRemark || '—'}</TableCell>
                                <TableCell className="text-right whitespace-nowrap">—</TableCell>
                              </TableRow>
                            ))}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </TableContainer>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新增包装记录"
        size="xl"
        footer={
          <>
            <ActionButton variant="outline" icon={Save} onClick={savePackagingRecord}>
              保存记录
            </ActionButton>
            <ActionButton variant="outline" icon={Printer} onClick={printAfterSave}>
              打印标签（保存后）
            </ActionButton>
            <ActionButton onClick={() => setIsModalOpen(false)}>确定</ActionButton>
            <ActionButton variant="outline" icon={ChevronRight} onClick={savePrintThenNextBox}>
              下一箱（保存+打印）
            </ActionButton>
          </>
        }
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">包装进度</p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    已录入 {scannedMeterNos.length} / 10 个水表表号
                  </p>
                </div>
                <div className="w-36">
                  <div className="flex-1 h-3 bg-white/70 rounded-full overflow-hidden border border-primary/10">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${packagingProgress}%` }} />
                  </div>
                  <p className="text-right text-xs font-black text-primary mt-1">{packagingProgress}%</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">系统自动生成：检验员、包装时间、记录创建时间。水表表号按当前箱号顺序录入。</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">备货单号（固定规则生成）</label>
              <select
                value={selectedWorkOrder}
                onChange={(event) => handleWorkOrderChange(event.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-slate-50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              >
                {WORK_ORDER_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">箱号（固定规则生成）</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-900">{previewBoxNo}</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">测试批号条码信息（自动生成）</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-mono font-bold text-slate-900">
              <img src={makeBarcodeSvgDataUrl(previewTestBatchBarcodeInfo)} alt="条码预览" className="h-10 w-full rounded border border-slate-200 bg-white object-cover" />
              <p className="mt-2 text-xs text-slate-500 break-all">{previewTestBatchBarcodeInfo}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">表具名称</label>
              <select
                value={selectedMeterName}
                onChange={(event) => setSelectedMeterName(event.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-slate-50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              >
                {METER_OPTIONS.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">表具类型（自动获取）</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 whitespace-nowrap">{selectedMeterMeta.type}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">表具口径（自动获取）</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 whitespace-nowrap">{selectedMeterMeta.caliber}</div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">检验员（系统生成）</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 whitespace-nowrap">当前登录检验员</div>
            </div>
          </div>
          </div>
          <div className="space-y-4">
          <form onSubmit={handleScanSubmit} className="flex gap-2">
            <Scan className="text-primary shrink-0 mt-3" size={22} />
            <input
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              placeholder="扫码或输入水表表号，按顺序绑定到当前箱号"
              className="flex-1 border-2 border-slate-100 focus:border-primary rounded-xl px-4 py-3 font-mono font-bold outline-none"
            />
            <ActionButton type="submit" icon={QrCode}>
              绑定
            </ActionButton>
          </form>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsMeterTableExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left text-sm font-bold text-slate-700"
            >
              <span>水表表号清单（默认展开，可编辑/删除）</span>
              <span className="flex items-center gap-2">
                共 10 个
                {isMeterTableExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </button>
            {isMeterTableExpanded && (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase">
                  <tr>
                    <th className="text-left py-2 px-3">序号</th>
                    <th className="text-left py-2 px-3">标准表号</th>
                    <th className="text-left py-2 px-3">已录入表号</th>
                    <th className="text-left py-2 px-3">状态</th>
                    <th className="text-left py-2 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {expectedMeters.map((meterNo, index) => {
                    const bound = scannedMeterNos[index];
                    const matched = bound && bound === meterNo;
                    const mismatched = bound && bound !== meterNo;
                    return (
                      <tr key={meterNo} className={mismatched ? 'bg-rose-50' : matched ? 'bg-emerald-50/50' : ''}>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{meterNo}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          <input
                            value={bound || ''}
                            onChange={(event) => updateScannedMeterNoAt(index, event.target.value)}
                            placeholder="可编辑表号"
                            className="w-full min-w-[180px] border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {!bound ? (
                            <span className="text-xs text-slate-400">待扫码</span>
                          ) : mismatched ? (
                            <span className="text-xs font-bold text-rose-600">不一致</span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <Check size={14} /> 一致
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => removeScannedMeterNoAt(index)}
                            disabled={!bound}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:underline"
                          >
                            <Trash2 size={12} />
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
