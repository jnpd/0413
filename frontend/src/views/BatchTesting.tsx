import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  History,
  ImagePlus,
  Lock,
  LockOpen,
  Plus,
  Save,
  Search,
  Settings2,
  Timer,
  Trash2,
  X,
} from 'lucide-react';
import {
  ActionButton,
  Modal,
  SearchInput,
  StatusBadge,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/UIComponents';
import type { TestConditionImageArchive, TestStandards } from '../types';

// ------------------- 口径：阀门/测试/合格 -------------------
type ValveStatus = 0 | 1 | 2; // 0-关，1-开，2-故障
type TestStatus = 0 | 1 | 2; // 0-待测试，1-已测试，2-测试中
type PassStatusValue = 0 | 1 | null; // 0-不合格，1-合格；测试中时为 null
type JudgeStatus = 'pending' | 'passed' | 'failed';

type BatchAction =
  | '数据上报'
  | '开阀'
  | '关阀'
  | '写表底'
  | '写表号'
  | '读取上报周期'
  | '设置上报周期'
  | '读取ip地址'
  | '写IP地址'
  | '程序升级'
  | '查看原始数据'
  | '写表时间'
  | '批量合格'
  | '保存历史';

interface BatchRecord {
  id: string;
  batchNo: string;
  productionOrderNo: string;
  meterNo: string; // 水表表号（关联仓库表）
  meterName: string; // 表具名称（关联表具档案）
  imei: string; // IMEI
  iccid: string; // ICCID卡号
  commCardNo: string; // 通讯卡号
  protocol: string; // 通讯协议

  reportTime: string; // 上报时间
  reading: string; // 正向累积流量（m，小数点后三位，与判定逻辑一致）
  presetBase: string; // 预置表底数
  batteryVoltage: string; // 电池电压（单位V，小数点后一位）
  valveStatus: ValveStatus; // 阀门状态（0/1/2）
  testStatus: TestStatus; // 测试状态（0/1/2）
  passStatus: PassStatusValue; // 合格状态（0/1；测试中时为 null）
  /** 人工标记合格（演示）：优先于自动判定展示为合格；数据上报后清除 */
  manualPass?: boolean;

  operatorRecord: string; // 操作人员记录
  /** 写表时间：向设备写入表内时钟后的记录时间（演示） */
  writeMeterTime: string;
  createdAt: string; // 创建时间
  updatedAt: string; // 记录更新时间

  mainIp: string; // 主IP
  backupIp: string; // 副IP

  /** 正向瞬时流量（m³/h，演示） */
  forwardInstantFlow: string;
  /** 反向累积流量（m，三位小数口径与 reading 一致） */
  reverseTotalFlow: string;
  /** 反向瞬时流量（m³/h） */
  reverseInstantFlow: string;
  magneticSignal: string;
  /** 环境温度（℃） */
  ambientTemp: string;
  /** 压力（MPa 等，演示文本） */
  pressure: string;
  csq: string;
  rsrp: string;
  rsrq: string;
  reportSuccessCount: number;
  reportTotalCount: number;
}

interface EvalRecord extends BatchRecord {
  judgeStatus: JudgeStatus;
  judgeDetail: string; // 内部：用于关键字检索/演示说明
}

interface BatchMeta {
  productionOrderNo: string;
  createdAt: string;
  meterName: string; // 表具名称
}

type ExtraBatchMeta = {
  batchNo: string;
  productionOrderNo: string;
  createdAt: string;
  meterName: string;
};

interface BatchTestingViewProps {
  initialBatchNo?: string | null;
  extraBatchMeta?: ExtraBatchMeta | null;
}

interface WarehouseDevice {
  id: string;
  meterNo: string;
  productionOrderNo: string;
  imei: string;
  iccid: string;
  commCardNo: string;
  protocol: string;
  presetBase: string;
  valveStatus: ValveStatus;
  batteryVoltage: string; // string，保留一位小数
}

const baseBatchMeta: Record<string, BatchMeta> = {
  'BATCH-20260318-003': { productionOrderNo: 'WO-20260318-001', createdAt: '2026-03-18 09:10:00', meterName: '户用远传水表（有阀门/磁采集）' },
  'BATCH-20260318-002': { productionOrderNo: 'WO-20260318-001', createdAt: '2026-03-18 08:00:00', meterName: '户用远传水表（无阀门/磁采集）' },
  'BATCH-20260317-006': { productionOrderNo: 'WO-20260317-002', createdAt: '2026-03-17 17:40:00', meterName: '大口径产测表（有阀门/磁采集）' },
};

const warehouseDevices: WarehouseDevice[] = [
  {
    id: 'w1',
    meterNo: '20260318000009',
    productionOrderNo: 'WO-20260318-001',
    imei: '861234567890129',
    iccid: '89860123456789012349',
    commCardNo: 'SIM-8986012345678901',
    protocol: 'CJT188',
    presetBase: '0.000',
    valveStatus: 1,
    batteryVoltage: '3.6',
  },
  {
    id: 'w2',
    meterNo: '',
    productionOrderNo: 'WO-20260318-001',
    imei: '861234567890130',
    iccid: '',
    commCardNo: 'SIM-8986012345678902',
    protocol: 'CJT188',
    presetBase: '0.300',
    valveStatus: 0,
    batteryVoltage: '3.5',
  },
  {
    id: 'w3',
    meterNo: '20260318000010',
    productionOrderNo: 'WO-20260318-002',
    imei: '861234567890131',
    iccid: '89860123456789012351',
    commCardNo: 'SIM-8986012345678903',
    protocol: 'SR',
    presetBase: '1.000',
    valveStatus: 2,
    batteryVoltage: '3.1',
  },
];

const operatorDefault = '演示操作员';

type TelemetryPick = Pick<
  BatchRecord,
  | 'forwardInstantFlow'
  | 'reverseTotalFlow'
  | 'reverseInstantFlow'
  | 'magneticSignal'
  | 'ambientTemp'
  | 'pressure'
  | 'csq'
  | 'rsrp'
  | 'rsrq'
  | 'reportSuccessCount'
  | 'reportTotalCount'
>;

const batchTelemetryDefaults = (overrides: Partial<TelemetryPick> = {}): TelemetryPick => ({
  forwardInstantFlow: '0.000',
  reverseTotalFlow: '0.000',
  reverseInstantFlow: '0.000',
  magneticSignal: '正常',
  ambientTemp: '24.5',
  pressure: '0.32',
  csq: '22',
  rsrp: '-88',
  rsrq: '-11',
  reportSuccessCount: 40,
  reportTotalCount: 42,
  ...overrides,
});

const initialRecords: BatchRecord[] = [
  {
    id: '1',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-001',
    meterNo: '20260318000001',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890121',
    iccid: '89860123456789012341',
    commCardNo: 'SIM-8986012345678900',
    protocol: 'CJT188',
    reportTime: '2026-03-18 09:30:00',
    reading: '0.000',
    presetBase: '0.000',
    batteryVoltage: '3.6',
    valveStatus: 1,
    testStatus: 1,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 09:12:00',
    updatedAt: '2026-03-18 09:30:00',
    mainIp: '172.16.10.11',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.085',
      reverseTotalFlow: '0.000',
      magneticSignal: '强',
      ambientTemp: '25.1',
      pressure: '0.36',
      csq: '26',
      rsrp: '-80',
      rsrq: '-9',
      reportSuccessCount: 52,
      reportTotalCount: 54,
    }),
  },
  {
    id: '2',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-001',
    meterNo: '20260318000002',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890122',
    iccid: '89860123456789012342',
    commCardNo: 'SIM-8986012345678904',
    protocol: 'CJT188',
    reportTime: '2026-03-18 09:35:00',
    reading: '0.356',
    presetBase: '0.300',
    batteryVoltage: '3.6',
    valveStatus: 0,
    testStatus: 1,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 09:18:00',
    updatedAt: '2026-03-18 09:35:00',
    mainIp: '172.16.10.11',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.092',
      reverseTotalFlow: '0.002',
      ambientTemp: '24.8',
      pressure: '0.34',
      csq: '24',
      rsrp: '-84',
      rsrq: '-10',
      reportSuccessCount: 48,
      reportTotalCount: 49,
    }),
  },
  {
    id: '3',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-002',
    meterNo: '20260318000003',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890123',
    iccid: '89860123456789012343',
    commCardNo: 'SIM-8986012345678905',
    protocol: 'SR',
    reportTime: '2026-03-18 09:42:00',
    reading: '0.210',
    presetBase: '1.000',
    batteryVoltage: '3.1',
    valveStatus: 2,
    testStatus: 1,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 09:22:00',
    updatedAt: '2026-03-18 09:42:00',
    mainIp: '172.16.10.11',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.110',
      reverseTotalFlow: '0.015',
      reverseInstantFlow: '0.001',
      magneticSignal: '弱',
      ambientTemp: '26.0',
      pressure: '0.38',
      csq: '18',
      rsrp: '-95',
      rsrq: '-14',
      reportSuccessCount: 36,
      reportTotalCount: 40,
    }),
  },
  {
    id: '4',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-002',
    meterNo: '',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890124',
    iccid: '',
    commCardNo: 'SIM-8986012345678906',
    protocol: 'CJT188',
    reportTime: '-',
    reading: '-',
    presetBase: '0.300',
    batteryVoltage: '-',
    valveStatus: 1,
    testStatus: 0,
    passStatus: null,
    operatorRecord: '',
    writeMeterTime: '',
    createdAt: '2026-03-18 09:25:00',
    updatedAt: '2026-03-18 09:25:00',
    mainIp: '',
    backupIp: '',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '—',
      reverseTotalFlow: '—',
      reverseInstantFlow: '—',
      magneticSignal: '—',
      ambientTemp: '—',
      pressure: '—',
      csq: '—',
      rsrp: '—',
      rsrq: '—',
      reportSuccessCount: 0,
      reportTotalCount: 3,
    }),
  },
  {
    id: '5',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-001',
    meterNo: '20260318000005',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890126',
    iccid: '89860123456789012346',
    commCardNo: 'SIM-8986012345678907',
    protocol: 'CJT188',
    reportTime: '2026-03-18 09:50:00',
    reading: '0.100',
    presetBase: '0.000',
    batteryVoltage: '2.9',
    valveStatus: 1,
    testStatus: 1,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 09:28:00',
    updatedAt: '2026-03-18 09:50:00',
    mainIp: '172.16.10.11',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.078',
      reverseTotalFlow: '0.000',
      csq: '21',
      rsrp: '-90',
      reportSuccessCount: 44,
      reportTotalCount: 45,
    }),
  },
  {
    id: '6',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-001',
    meterNo: '20260318000006',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890127',
    iccid: '89860123456789012347',
    commCardNo: 'SIM-8986012345678908',
    protocol: 'CJT188',
    reportTime: '2026-03-18 09:52:00',
    reading: '0.000',
    presetBase: '0.300',
    batteryVoltage: '3.6',
    valveStatus: 2,
    testStatus: 2,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 09:29:00',
    updatedAt: '2026-03-18 09:52:00',
    mainIp: '172.16.10.11',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.065',
      magneticSignal: '异常',
      pressure: '0.30',
      reportSuccessCount: 38,
      reportTotalCount: 41,
    }),
  },
  {
    id: '7',
    batchNo: 'BATCH-20260318-003',
    productionOrderNo: 'WO-20260318-001',
    meterNo: '20260318000007',
    meterName: baseBatchMeta['BATCH-20260318-003'].meterName,
    imei: '861234567890128',
    iccid: '89860123456789012348',
    commCardNo: 'SIM-8986012345678909',
    protocol: 'CJT188',
    reportTime: '2026-03-18 09:54:00',
    reading: '0.000',
    presetBase: '0.000',
    batteryVoltage: '4.0',
    valveStatus: 1,
    testStatus: 1,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 09:32:00',
    updatedAt: '2026-03-18 09:54:00',
    mainIp: '172.16.10.13',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.055',
      reverseTotalFlow: '0.008',
      csq: '28',
      rsrp: '-78',
      rsrq: '-7',
      reportSuccessCount: 60,
      reportTotalCount: 60,
    }),
  },
  {
    id: '8',
    batchNo: 'BATCH-20260318-002',
    productionOrderNo: 'WO-20260318-001',
    meterNo: '20260318000008',
    meterName: baseBatchMeta['BATCH-20260318-002'].meterName,
    imei: '861234567890125',
    iccid: '89860123456789012345',
    commCardNo: 'SIM-8986012345678910',
    protocol: '恩乐曼',
    reportTime: '2026-03-18 08:20:00',
    reading: '1.200',
    presetBase: '1.000',
    batteryVoltage: '3.7',
    valveStatus: 1,
    testStatus: 1,
    passStatus: null,
    operatorRecord: operatorDefault,
    writeMeterTime: '',
    createdAt: '2026-03-18 08:10:00',
    updatedAt: '2026-03-18 08:20:00',
    mainIp: '172.16.10.11',
    backupIp: '172.16.10.12',
    ...batchTelemetryDefaults({
      forwardInstantFlow: '0.210',
      reverseTotalFlow: '0.020',
      ambientTemp: '23.2',
      pressure: '0.31',
      csq: '20',
      rsrp: '-92',
      rsrq: '-13',
      reportSuccessCount: 120,
      reportTotalCount: 122,
    }),
  },
];

const defaultStandards: TestStandards = {
  batteryVoltageLowerLimit: '3.6',
  csqLowerLimit: '13',
  magneticSignalLowerLimit: '130',
  batteryMax: '3.9',
  mainIp: '172.16.10.11',
  backupIp: '172.16.10.12',
  readingPrecision: '3',
  valveRule: '阀门状态需为开/关（0/1），不允许故障（2）',
  conditionImageArchives: [],
};

const STANDARDS_STORAGE_KEY = 'waterTest.testStandards.v1';
const MAX_CONDITION_ARCHIVE_IMAGES = 8;
const MAX_CONDITION_IMAGE_BYTES = 800 * 1024;

const getNowLabel = () => new Date().toLocaleString('zh-CN', { hour12: false });

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });

function loadStandardsFromStorage(): TestStandards {
  try {
    const raw = localStorage.getItem(STANDARDS_STORAGE_KEY);
    if (!raw) return { ...defaultStandards };
    const p = JSON.parse(raw) as Partial<TestStandards> & { batteryMin?: string };
    const archives: TestConditionImageArchive[] = Array.isArray(p.conditionImageArchives)
      ? p.conditionImageArchives.filter((x) => x && typeof x.id === 'string' && typeof x.dataUrl === 'string')
      : [];
    const batteryVoltageLowerLimit =
      typeof p.batteryVoltageLowerLimit === 'string'
        ? p.batteryVoltageLowerLimit
        : typeof p.batteryMin === 'string'
          ? p.batteryMin
          : defaultStandards.batteryVoltageLowerLimit;
    return {
      ...defaultStandards,
      ...p,
      batteryVoltageLowerLimit,
      csqLowerLimit: typeof p.csqLowerLimit === 'string' ? p.csqLowerLimit : defaultStandards.csqLowerLimit,
      magneticSignalLowerLimit:
        typeof p.magneticSignalLowerLimit === 'string'
          ? p.magneticSignalLowerLimit
          : defaultStandards.magneticSignalLowerLimit,
      conditionImageArchives: archives,
    };
  } catch {
    return { ...defaultStandards };
  }
}

function persistStandardsToStorage(next: TestStandards) {
  try {
    localStorage.setItem(STANDARDS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    alert('本地存档空间不足：请减少条件图片数量或缩小单张图片后再保存参数。');
  }
}

const okPrecision = (value: string, precision: number) => new RegExp(`^\\d+(\\.\\d{${precision}})$`).test(value);
const okOneDecimal = (value: string) => new RegExp(`^\\d+(\\.\\d{1})$`).test(value);

const valveMeta: Record<ValveStatus, { label: string; badge: 'success' | 'warning' | 'error' | 'neutral' }> = {
  0: { label: '关', badge: 'neutral' },
  1: { label: '开', badge: 'success' },
  2: { label: '故障', badge: 'error' },
};

const testMeta: Record<TestStatus, { label: string; badge: 'success' | 'warning' | 'error' | 'neutral' }> = {
  0: { label: '待测试', badge: 'warning' },
  1: { label: '已测试', badge: 'success' },
  2: { label: '测试中', badge: 'warning' },
};

/** 列表单元格：单行展示，横向滚动由表格外层容器承担 */
const fmtM3 = (v: string) => (v === '-' || v === '—' ? '—' : `${v} m³`);

/** 异常列文字色（PRD：深红标红） */
const ANOMALY_TEXT_CLASS = 'text-[#CF1322] font-bold';

function parseMagneticNumeric(raw: string): number | null {
  const s = raw.trim();
  if (!s || s === '—' || s === '-') return null;
  if (s === '异常') return 0;
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

function getAnomalyFlags(record: BatchRecord, standards: TestStandards) {
  const minV = Number(standards.batteryVoltageLowerLimit);
  const minCsq = Number(standards.csqLowerLimit);
  const minMag = Number(standards.magneticSignalLowerLimit);

  let battery = false;
  if (record.batteryVoltage !== '-' && okOneDecimal(record.batteryVoltage)) {
    const v = Number(record.batteryVoltage);
    if (Number.isFinite(minV) && Number.isFinite(v) && v < minV) battery = true;
  }

  let csq = false;
  const csqRaw = String(record.csq).trim();
  if (csqRaw && csqRaw !== '—' && csqRaw !== '-') {
    const c = Number(csqRaw);
    if (Number.isFinite(minCsq) && Number.isFinite(c) && c < minCsq) csq = true;
  }

  let magnetic = false;
  const magN = parseMagneticNumeric(record.magneticSignal);
  if (magN !== null && Number.isFinite(minMag) && magN < minMag) magnetic = true;

  return { battery, csq, magnetic };
}

const evalRecord = (record: BatchRecord, standards: TestStandards): EvalRecord => {
  if (record.testStatus === 0) {
    return {
      ...record,
      judgeStatus: 'pending',
      passStatus: null,
      judgeDetail: '待执行机电同步校准与数据上报',
    };
  }
  if (record.testStatus === 2) {
    return {
      ...record,
      judgeStatus: 'pending',
      passStatus: null,
      judgeDetail: '机电同步校准完成，等待数据上报',
    };
  }

  if (record.manualPass) {
    return {
      ...record,
      judgeStatus: 'passed',
      passStatus: 1,
      judgeDetail: '人工标记合格',
    };
  }

  const issues: string[] = [];
  const precision = Number(standards.readingPrecision) || 3;
  if (!record.meterNo) issues.push('水表表号未写入');
  if (record.reading === '-' || !okPrecision(record.reading, precision)) issues.push(`正向累积流量需保留 ${precision} 位小数`);
  if (record.batteryVoltage === '-' || !okOneDecimal(record.batteryVoltage) || !Number.isFinite(Number(record.batteryVoltage))) issues.push('电池电压未上报或精度不符合（需保留 1 位小数）');

  // PRD：电池电压下限等三项仅用于列表列标红，不参与自动合格/不合格
  if (record.batteryVoltage !== '-' && okOneDecimal(record.batteryVoltage)) {
    const voltage = Number(record.batteryVoltage);
    if (voltage > Number(standards.batteryMax)) issues.push(`电压 ${record.batteryVoltage}V 高于 ${standards.batteryMax}V`);
  }

  if (record.valveStatus === 2) issues.push('阀门状态异常（2-故障）');

  if (!record.mainIp || !record.backupIp) issues.push('主IP / 副IP 未配置完整');
  else {
    if (record.mainIp !== standards.mainIp) issues.push('主IP 与合格标准不一致');
    if (record.backupIp !== standards.backupIp) issues.push('副IP 与合格标准不一致');
  }

  const passed = issues.length === 0;
  return {
    ...record,
    judgeStatus: passed ? 'passed' : 'failed',
    passStatus: passed ? 1 : 0,
    judgeDetail: passed ? '满足当前测试合格标准参数' : issues.join('；'),
  };
};

const nextMeterNo = (records: BatchRecord[]) => {
  const now = new Date();
  const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const maxSeq = records.filter((item) => item.meterNo.startsWith(prefix)).length;
  return `${prefix}${String(maxSeq + 1).padStart(6, '0')}`;
};

export const BatchTestingView: React.FC<BatchTestingViewProps> = ({ initialBatchNo, extraBatchMeta }) => {
  const [currentBatch, setCurrentBatch] = useState(() => initialBatchNo ?? 'BATCH-20260318-003');
  const [records, setRecords] = useState<BatchRecord[]>(initialRecords);
  const [standards, setStandards] = useState<TestStandards>(() => loadStandardsFromStorage());
  const [draftStandards, setDraftStandards] = useState<TestStandards>(() => loadStandardsFromStorage());
  const conditionImageInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const mergedBatchMeta = useMemo(() => {
    if (!extraBatchMeta) return baseBatchMeta;
    return {
      ...baseBatchMeta,
      [extraBatchMeta.batchNo]: {
        productionOrderNo: extraBatchMeta.productionOrderNo,
        createdAt: extraBatchMeta.createdAt,
        meterName: extraBatchMeta.meterName,
      },
    };
  }, [extraBatchMeta]);

  useEffect(() => {
    persistStandardsToStorage(standards);
  }, [standards]);

  const pickConditionImages = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = '';
    if (!files?.length) return;

    const toAdd: TestConditionImageArchive[] = [];
    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        alert(`「${file.name}」不是图片文件，已跳过`);
        continue;
      }
      if (file.size > MAX_CONDITION_IMAGE_BYTES) {
        alert(`「${file.name}」超过 ${Math.round(MAX_CONDITION_IMAGE_BYTES / 1024)}KB，已跳过`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        toAdd.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          fileName: file.name,
          dataUrl,
          uploadedAt: getNowLabel(),
        });
      } catch {
        alert(`读取「${file.name}」失败`);
      }
    }
    if (!toAdd.length) return;

    setDraftStandards((prev) => {
      const room = Math.max(0, MAX_CONDITION_ARCHIVE_IMAGES - prev.conditionImageArchives.length);
      const merged = [...prev.conditionImageArchives, ...toAdd.slice(0, room)];
      if (toAdd.length > room) {
        alert(`最多保留 ${MAX_CONDITION_ARCHIVE_IMAGES} 张，已自动截断超出部分`);
      }
      return { ...prev, conditionImageArchives: merged };
    });
  }, []);

  // 筛选：不改变输入/逻辑（仅做收缩/展开）
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'all' | JudgeStatus>('all');
  const [orderNo, setOrderNo] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [action, setAction] = useState<BatchAction | null>(null);
  const [actionForm, setActionForm] = useState({ mainIp: defaultStandards.mainIp, backupIp: defaultStandards.backupIp, presetBase: '' });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [isStandardsOpen, setIsStandardsOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // 扫码枪是按键输入：新增设备弹窗打开时自动聚焦，回车后直接匹配并加入批次
  useEffect(() => {
    if (!isAddOpen) return;
    const t = window.setTimeout(() => scanInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isAddOpen]);

  const current = useMemo(
    () => records.filter((item) => item.batchNo === currentBatch).map((item) => evalRecord(item, standards)),
    [records, currentBatch, standards]
  );

  // 新建批次后从外部传入的 batchNo：切换当前批次并清空已选项
  useEffect(() => {
    if (!initialBatchNo) return;
    setCurrentBatch(initialBatchNo);
    setSelectedIds([]);
  }, [initialBatchNo]);

  const currentMeta = mergedBatchMeta[currentBatch];

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return current.filter((item) => {
      const okOrder = !orderNo || item.productionOrderNo.toLowerCase().includes(orderNo.toLowerCase());
      const okKw = !kw
        ? true
        : [
            item.meterNo,
            item.meterName,
            item.imei,
            item.iccid,
            item.commCardNo,
            item.reportTime,
            item.reading,
            item.presetBase,
            item.valveStatus,
            item.batteryVoltage,
            item.testStatus,
            item.passStatus ?? '',
            item.operatorRecord,
            item.writeMeterTime,
            item.createdAt,
            item.updatedAt,
            item.mainIp,
            item.backupIp,
            item.protocol,
            item.judgeDetail,
            item.forwardInstantFlow,
            item.reverseTotalFlow,
            item.reverseInstantFlow,
            item.magneticSignal,
            item.ambientTemp,
            item.pressure,
            item.csq,
            item.rsrp,
            item.rsrq,
            item.reportSuccessCount,
            item.reportTotalCount,
          ]
            .join(' ')
            .toLowerCase()
            .includes(kw);
      const okStatus = status === 'all' || item.judgeStatus === status;
      return okOrder && okKw && okStatus;
    });
  }, [current, orderNo, keyword, status]);

  const stats = useMemo(
    () => [
      { label: '总数', value: current.length, icon: Activity, tone: 'text-slate-700 bg-slate-50' },
      { label: '合格', value: current.filter((item) => item.judgeStatus === 'passed').length, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
      { label: '不合格', value: current.filter((item) => item.judgeStatus === 'failed').length, icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50' },
      { label: '测试中', value: current.filter((item) => item.judgeStatus === 'pending').length, icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
    ],
    [current]
  );

  const toggle = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((item) => item.id));

  const applyManualPass = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      const now = getNowLabel();
      setRecords((prev) =>
        prev.map((item) =>
          ids.includes(item.id) && item.batchNo === currentBatch
            ? { ...item, manualPass: true, operatorRecord: operatorDefault, updatedAt: now }
            : item
        )
      );
    },
    [currentBatch]
  );

  const openAction = (value: BatchAction) => {
    if (value === '保存历史') {
      const count = records.filter((item) => item.batchNo === currentBatch).length;
      if (count === 0) return alert('当前批次无设备，无法保存历史');
      const imgN = standards.conditionImageArchives.length;
      return alert(
        `已保存历史快照：${currentBatch}（共 ${count} 台）` +
          (imgN ? `；已关联当前「测试合格标准」下的条件图片存档 ${imgN} 张（正式环境需随快照一并落库）` : '')
      );
    }
    if (value === '批量合格') {
      if (selectedIds.length === 0) return alert('请先选择需要标记为合格的水表');
      applyManualPass(selectedIds);
      return alert(`已将所选 ${selectedIds.length} 台标记为合格（演示：结果由人工确认）`);
    }
    if (selectedIds.length === 0) return alert(`请先选择需要执行“${value}”的水表`);
    setAction(value);
    setActionForm({ mainIp: standards.mainIp, backupIp: standards.backupIp, presetBase: '' });
  };

  const addWarehouseDeviceToBatch = useCallback(
    (target: WarehouseDevice, opts?: { closeAfterAdd?: boolean }) => {
      const meta = mergedBatchMeta[currentBatch];
      if (!meta) {
        alert('当前批次元信息缺失，请先选择有效批次');
        return false;
      }

      // 规则：设备只能绑定唯一备货单号；但允许加入多个测试批次
      const existedOrderNos = Array.from(
        new Set(
          records
            .filter((r) => r.imei === target.imei || (target.meterNo && r.meterNo === target.meterNo))
            .map((r) => r.productionOrderNo)
            .filter(Boolean)
        )
      );
      const hasOtherOrderNo = existedOrderNos.some((orderNo) => orderNo !== meta.productionOrderNo);
      if (hasOtherOrderNo) {
        alert(`该设备已绑定备货单号 ${existedOrderNos[0]}，不允许再绑定到 ${meta.productionOrderNo}`);
        return false;
      }

      let didAdd = false;
      setRecords((prev) => {
        const exists = prev.some(
          (r) =>
            r.batchNo === currentBatch &&
            ((target.meterNo && r.meterNo === target.meterNo) || r.imei === target.imei)
        );
        if (exists) return prev;

        didAdd = true;
        const now = getNowLabel();
        return [
          {
            id: Date.now().toString(),
            batchNo: currentBatch,
            productionOrderNo: meta.productionOrderNo,
            meterNo: target.meterNo,
            meterName: meta.meterName,
            imei: target.imei,
            iccid: target.iccid,
            commCardNo: target.commCardNo,
            protocol: target.protocol,
            reportTime: '-',
            reading: '-',
            presetBase: target.presetBase,
            batteryVoltage: target.batteryVoltage,
            valveStatus: target.valveStatus,
            testStatus: 0,
            passStatus: null,
            operatorRecord: '',
            writeMeterTime: '',
            createdAt: now,
            updatedAt: now,
            mainIp: '',
            backupIp: '',
            ...batchTelemetryDefaults({
              forwardInstantFlow: '—',
              reverseTotalFlow: '—',
              reverseInstantFlow: '—',
              magneticSignal: '—',
              ambientTemp: '—',
              pressure: '—',
              csq: '—',
              rsrp: '—',
              rsrq: '—',
              reportSuccessCount: 0,
              reportTotalCount: 0,
            }),
          },
          ...prev,
        ];
      });

      if (!didAdd) {
        alert('设备已存在于当前批次');
        return false;
      }

      setSelectedWarehouseId(null);
      if (opts?.closeAfterAdd !== false) {
        setIsAddOpen(false);
      }
      return true;
    },
    [currentBatch, mergedBatchMeta, records]
  );

  useEffect(() => {
    if (!isMoreActionsOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = moreActionsRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsMoreActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isMoreActionsOpen]);

  const applyAction = () => {
    if (!action) return;
    if (action === '写IP地址' && (!actionForm.mainIp.trim() || !actionForm.backupIp.trim())) return alert('请同时填写主IP和副IP');
    if (action === '写表底' && !actionForm.presetBase.trim()) return alert('请填写表底值');

    const now = getNowLabel();
    const operator = operatorDefault;

    setRecords((prev) =>
      prev.map((item) => {
        if (!selectedIds.includes(item.id) || item.batchNo !== currentBatch) return item;

        if (action === '数据上报') {
          const nextReading = item.reading === '-' ? (item.presetBase && item.presetBase !== '-' ? item.presetBase : '0.000') : item.reading;
          const tel = (v: string, fallback: string) => (v === '—' || v === '-' ? fallback : v);
          return {
            ...item,
            reportTime: now,
            reading: nextReading,
            forwardInstantFlow: tel(item.forwardInstantFlow, '0.050'),
            reverseTotalFlow: tel(item.reverseTotalFlow, '0.000'),
            reverseInstantFlow: tel(item.reverseInstantFlow, '0.000'),
            magneticSignal: item.magneticSignal === '—' ? '正常' : item.magneticSignal,
            ambientTemp: tel(item.ambientTemp, '25.0'),
            pressure: tel(item.pressure, '0.33'),
            csq: tel(item.csq, '23'),
            rsrp: tel(item.rsrp, '-86'),
            rsrq: tel(item.rsrq, '-10'),
            reportSuccessCount: item.reportSuccessCount + 1,
            reportTotalCount: item.reportTotalCount + 1,
            testStatus: 1,
            passStatus: null,
            manualPass: false,
            operatorRecord: operator,
            updatedAt: now,
          };
        }
        if (action === '写表底') {
          return { ...item, presetBase: actionForm.presetBase.trim(), operatorRecord: operator, updatedAt: now };
        }
        if (action === '写IP地址') {
          return { ...item, mainIp: actionForm.mainIp.trim(), backupIp: actionForm.backupIp.trim(), operatorRecord: operator, updatedAt: now };
        }
        if (action === '写表号') {
          const generated = item.meterNo || nextMeterNo(records);
          return { ...item, meterNo: generated, operatorRecord: operator, updatedAt: now };
        }
        if (action === '开阀') {
          return { ...item, valveStatus: 1, operatorRecord: operator, updatedAt: now };
        }
        if (action === '关阀') {
          return { ...item, valveStatus: 0, operatorRecord: operator, updatedAt: now };
        }
        if (action === '写表时间') {
          return { ...item, writeMeterTime: now, operatorRecord: operator, updatedAt: now };
        }

        // 其余操作在当前演示数据模型中不直接影响记录字段：
        // 仍记录操作人员与更新时间，便于界面对齐字段“操作人员记录/记录更新时间”。
        return { ...item, operatorRecord: operator, updatedAt: now };
      })
    );
    setAction(null);
  };

  const addToBatch = () => {
    const target = warehouseDevices.find((item) => item.id === selectedWarehouseId);
    if (!target) return alert('请选择一台仓库设备');
    addWarehouseDeviceToBatch(target, { closeAfterAdd: true });
  };

  const findWarehouseDeviceByScan = (raw: string): WarehouseDevice | null => {
    const value = raw.trim();
    if (!value) return null;

    // 扫码枪可能会带空格/换行，统一清理
    const cleaned = value.replace(/\s+/g, '');

    return (
      warehouseDevices.find((d) => d.meterNo && d.meterNo === cleaned) ||
      warehouseDevices.find((d) => d.imei === cleaned) ||
      warehouseDevices.find((d) => d.iccid && d.iccid === cleaned) ||
      warehouseDevices.find((d) => d.commCardNo && d.commCardNo === cleaned) ||
      null
    );
  };

  const actionButtons: Array<{ action: BatchAction; label: string; icon: any; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }> = [
    { action: '数据上报', label: '数据上报', icon: Activity },
    { action: '开阀', label: '开阀', icon: LockOpen, variant: 'outline' },
    { action: '关阀', label: '关阀', icon: Lock, variant: 'outline' },
    { action: '写表底', label: '写表底', icon: Settings2, variant: 'outline' },
    { action: '写表号', label: '写表号', icon: Settings2, variant: 'outline' },
    { action: '读取上报周期', label: '读取上报周期', icon: Clock3, variant: 'outline' },
    { action: '设置上报周期', label: '设置上报周期', icon: Settings2, variant: 'outline' },
    { action: '读取ip地址', label: '读取ip地址', icon: Search, variant: 'outline' },
    { action: '写IP地址', label: '写IP地址', icon: Settings2, variant: 'outline' },
    { action: '程序升级', label: '程序升级', icon: History, variant: 'outline' },
    { action: '查看原始数据', label: '查看原始数据', icon: Search, variant: 'outline' },
    { action: '写表时间', label: '写表时间', icon: Timer, variant: 'outline' },
    { action: '批量合格', label: '批量合格', icon: CheckCircle2, variant: 'outline' },
    { action: '保存历史', label: '保存历史', icon: Save, variant: 'primary' },
  ];

  const moreActionButtons: Array<{ action: BatchAction; label: string; icon: any; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }> = [
    actionButtons.find((a) => a.action === '读取上报周期')!,
    actionButtons.find((a) => a.action === '设置上报周期')!,
    actionButtons.find((a) => a.action === '程序升级')!,
    actionButtons.find((a) => a.action === '查看原始数据')!,
  ];
  const mainActionButtons = actionButtons.filter(
    (a) => !['读取上报周期', '设置上报周期', '程序升级', '查看原始数据'].includes(a.action)
  );

  return (
    <div className="p-3 bg-slate-50/50 min-h-full">
      <div className="bg-white rounded-2xl shadow-sm p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-[320px]">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">当前备货单与批次</p>
              <div className="relative">
                <select
                  value={currentBatch}
                  onChange={(event) => {
                    setCurrentBatch(event.target.value);
                    setSelectedIds([]);
                  }}
                  className="appearance-none pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary min-w-[260px]"
                >
                  {Object.keys(mergedBatchMeta).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              <ActionButton variant="outline" icon={Plus} onClick={() => setIsAddOpen(true)}>
                新增设备
              </ActionButton>
              <ActionButton
                variant="outline"
                icon={Settings2}
                onClick={() => {
                  setDraftStandards(standards);
                  setIsStandardsOpen(true);
                }}
              >
                异常判定参数
              </ActionButton>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-bold">备货单号：{currentMeta?.productionOrderNo ?? '—'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold">创建时间：{currentMeta?.createdAt ?? '—'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-slate-600">
                异常标红：电压小于{standards.batteryVoltageLowerLimit}V · CSQ小于{standards.csqLowerLimit} · 无磁小于
                {standards.magneticSignalLowerLimit}
              </span>
              {standards.conditionImageArchives.length > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="font-bold text-emerald-700">
                    条件图片存档 {standards.conditionImageArchives.length} 张
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="max-w-full overflow-x-auto">
            <div className="flex flex-nowrap items-center gap-2">
              {stats.map((stat) => (
                <div key={stat.label} className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 flex items-center gap-2">
                  <div className={`inline-flex items-center justify-center w-7 h-7 rounded-xl ${stat.tone}`}>
                    <stat.icon size={13} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                    <div className="mt-1 text-base font-black text-slate-900">{stat.value}</div>
                  </div>
                </div>
              ))}
              <ActionButton
                variant="outline"
                icon={ChevronDown}
                className="transition-colors shrink-0"
                onClick={() => setIsFilterOpen((v) => !v)}
              >
                {isFilterOpen ? '收起' : '展开'}
              </ActionButton>
            </div>
          </div>
        </div>

        <div className={isFilterOpen ? 'rounded-2xl bg-white p-3 overflow-hidden' : 'rounded-2xl bg-white p-0 overflow-hidden'}>
          {isFilterOpen && (
            <>
              <div className="mt-2 flex flex-nowrap items-center gap-2 overflow-x-auto">
                <div className="space-y-0 min-w-[240px] shrink-0">
                  <label className="sr-only">备货单号</label>
                  <SearchInput value={orderNo} onChange={(event) => setOrderNo(event.target.value)} placeholder="按备货单号筛选" />
                </div>
                <div className="space-y-0 min-w-[380px] shrink-0">
                  <label className="sr-only">水表表号 / 关键字</label>
                  <SearchInput
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="支持表号、IMEI、流量、无磁信号、温压、CSQ/RSRP/RSRQ、主副IP、通讯协议等检索"
                  />
                </div>
                <div className="space-y-0 min-w-[180px] shrink-0">
                  <label className="sr-only">判定状态</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as 'all' | JudgeStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                  >
                    <option value="all">全部</option>
                    <option value="pending">测试中</option>
                    <option value="passed">合格</option>
                    <option value="failed">不合格</option>
                  </select>
                </div>
                <div className="flex items-center min-w-[180px] shrink-0">
                  <ActionButton icon={Search} size="sm" className="whitespace-nowrap" onClick={() => undefined}>
                    已按输入即时筛选
                  </ActionButton>
                </div>
              </div>
            </>
          )}
        </div>

        {/* <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">测试合格标准参数</p>
              <p className="mt-1 text-sm font-black text-slate-900">字段清单要求可手动配置并用于平台判定</p>
            </div>
            <ActionButton
              variant="outline"
              icon={Settings2}
              onClick={() => {
                setDraftStandards(standards);
                setIsStandardsOpen(true);
              }}
            >
              调整参数
            </ActionButton>
          </div>
          <div className="mt-3 grid lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">电压阈值</div>
              <div className="mt-1 text-sm font-black text-slate-900">
                {standards.batteryVoltageLowerLimit}V ~ {standards.batteryMax}V
              </div>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">主IP / 副IP</div>
              <div className="mt-1 text-xs font-mono text-slate-900">{standards.mainIp}</div>
              <div className="text-xs font-mono text-slate-500">{standards.backupIp}</div>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">表读数精度</div>
              <div className="mt-1 text-sm font-black text-slate-900">小数点后 {standards.readingPrecision} 位</div>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">阀门判定</div>
              <div className="mt-1 text-xs text-slate-700 leading-5">{standards.valveRule}</div>
            </div>
          </div>
        </div> */}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {mainActionButtons.map((a) => (
              <ActionButton
                key={a.action}
                variant={a.variant}
                size="sm"
                icon={a.icon}
                className={
                  a.action === '保存历史'
                    ? 'shadow-lg shadow-primary/35 ring-2 ring-primary/25 font-black'
                    : undefined
                }
                onClick={() => openAction(a.action)}
              >
                {a.label}
              </ActionButton>
            ))}
            <div ref={moreActionsRef} className="relative">
              <ActionButton
                variant="outline"
                size="sm"
                icon={ChevronDown}
                className="whitespace-nowrap transition-colors"
                onClick={() => setIsMoreActionsOpen((v) => !v)}
              >
                更多
              </ActionButton>
              {isMoreActionsOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-40">
                  <div className="flex flex-col gap-1">
                    {moreActionButtons.map((a) => (
                      <ActionButton
                        key={a.action}
                        variant="ghost"
                        size="sm"
                        icon={a.icon}
                        className="justify-start"
                        onClick={() => {
                          setIsMoreActionsOpen(false);
                          openAction(a.action);
                        }}
                      >
                        {a.label}
                      </ActionButton>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500">筛选 {filtered.length} 台 / 已选 {selectedIds.length} 台</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-left text-sm border-collapse">
            <TableHead>
              <tr>
                <TableHeader className="w-10 px-3 py-2 sticky left-0 z-10 bg-slate-50/95 backdrop-blur-sm border-r border-slate-100">
                  <div
                    onClick={toggleAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                      selectedIds.length === filtered.length && filtered.length > 0 ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white hover:border-primary/60'
                    }`}
                  >
                    {selectedIds.length === filtered.length && filtered.length > 0 && <Check size={10} strokeWidth={4} />}
                  </div>
                </TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[128px]">IMEI</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[200px]">表具名称</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[120px]">水表表号</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[140px]">上报时间</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap">阀门状态</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[88px]">电池电压</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[100px]">正向累积流量</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[100px]">反向累积流量</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[120px]">备货单号</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap">合格状态</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[72px]">无磁信号</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[200px]">主副 IP</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap">环境温度</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap">压力</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[140px]">CSQ / RSRP / RSRQ</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[120px]">上报成功/上报次数</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap">通讯协议</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[140px]">写表时间</TableHeader>
                <TableHeader className="px-3 py-2 whitespace-nowrap min-w-[88px]">操作人员</TableHeader>
                <TableHeader className="text-right px-3 py-2 whitespace-nowrap sticky right-0 z-10 bg-slate-50/95 backdrop-blur-sm border-l border-slate-100">
                  操作
                </TableHeader>
              </tr>
            </TableHead>

            <tbody>
              {filtered.map((item) => {
                const passVariant = item.passStatus === null ? 'warning' : item.passStatus === 1 ? 'success' : 'error';
                const rowSel = selectedIds.includes(item.id);
                const anomaly = getAnomalyFlags(item, standards);
                return (
                  <TableRow key={item.id} className={rowSel ? 'bg-primary/5' : ''}>
                    <TableCell
                      className={`px-3 py-2 sticky left-0 z-[1] border-r border-slate-50 ${rowSel ? 'bg-primary/5' : 'bg-white'}`}
                    >
                      <div
                        onClick={() => toggle(item.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                          selectedIds.includes(item.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white hover:border-primary/60'
                        }`}
                      >
                        {selectedIds.includes(item.id) && <Check size={10} strokeWidth={4} />}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-slate-800 whitespace-nowrap px-3 py-2">{item.imei}</TableCell>
                    <TableCell className="text-slate-800 font-bold whitespace-nowrap px-3 py-2">{item.meterName}</TableCell>
                    <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap px-3 py-2">{item.meterNo || '待写入'}</TableCell>
                    <TableCell className="text-slate-500 text-xs whitespace-nowrap px-3 py-2">{item.reportTime}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2">
                      <StatusBadge variant={valveMeta[item.valveStatus].badge}>{valveMeta[item.valveStatus].label}</StatusBadge>
                    </TableCell>
                    <TableCell
                      className={`font-mono whitespace-nowrap px-3 py-2 ${anomaly.battery ? ANOMALY_TEXT_CLASS : 'text-slate-700'}`}
                    >
                      {item.batteryVoltage === '-' || item.batteryVoltage === '—' ? '—' : `${item.batteryVoltage} V`}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 whitespace-nowrap px-3 py-2">{fmtM3(item.reading)}</TableCell>
                    <TableCell className="font-mono text-slate-700 whitespace-nowrap px-3 py-2">{fmtM3(item.reverseTotalFlow)}</TableCell>
                    <TableCell className="font-mono text-slate-600 whitespace-nowrap px-3 py-2">{item.productionOrderNo}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2">
                      {item.passStatus === null ? (
                        <StatusBadge variant={passVariant}>测试中</StatusBadge>
                      ) : (
                        <StatusBadge variant={passVariant}>{item.passStatus === 1 ? '合格' : '不合格'}</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap px-3 py-2 ${anomaly.magnetic ? ANOMALY_TEXT_CLASS : 'text-slate-700'}`}
                    >
                      {item.magneticSignal}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 text-xs whitespace-nowrap px-3 py-2">
                      {(item.mainIp || '—') + ' / ' + (item.backupIp || '—')}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 whitespace-nowrap px-3 py-2">
                      {item.ambientTemp === '—' ? '—' : `${item.ambientTemp} ℃`}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 whitespace-nowrap px-3 py-2">
                      {item.pressure === '—' ? '—' : `${item.pressure} MPa`}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 text-xs whitespace-nowrap px-3 py-2">
                      <span className={anomaly.csq ? ANOMALY_TEXT_CLASS : ''}>{item.csq}</span>
                      <span> / {item.rsrp} / {item.rsrq}</span>
                    </TableCell>
                    <TableCell className="font-mono text-slate-800 whitespace-nowrap px-3 py-2">
                      {item.reportSuccessCount}/{item.reportTotalCount}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 whitespace-nowrap px-3 py-2">{item.protocol}</TableCell>
                    <TableCell className="text-slate-500 text-xs whitespace-nowrap px-3 py-2 font-mono">
                      {item.writeMeterTime?.trim() ? item.writeMeterTime : '—'}
                    </TableCell>
                    <TableCell className="text-slate-700 whitespace-nowrap px-3 py-2">{item.operatorRecord || '—'}</TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap px-3 py-2 sticky right-0 z-[1] border-l border-slate-50 ${rowSel ? 'bg-primary/5' : 'bg-white'}`}
                    >
                      <div className="inline-flex items-center justify-end gap-1">
                        <ActionButton
                          variant="outline"
                          size="sm"
                          disabled={item.judgeStatus === 'passed'}
                          className="shrink-0 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => applyManualPass([item.id])}
                        >
                          合格
                        </ActionButton>
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          className="text-rose-400 hover:text-rose-600 shrink-0"
                          onClick={() => setRecords((prev) => prev.filter((row) => row.id !== item.id))}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedWarehouseId(null);
        }}
        title="扫描设备并绑定备货单/批次"
        size="lg"
        footer={
          <>
            <ActionButton
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setSelectedWarehouseId(null);
              }}
            >
              取消
            </ActionButton>
            <ActionButton onClick={addToBatch}>加入当前批次</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">目标备货单与测试批号</p>
            <p className="mt-2 font-black text-slate-900">{currentBatch}</p>
            <p className="mt-1 text-xs text-slate-500">
              备货单号：{currentMeta?.productionOrderNo ?? '—'}（同设备仅允许绑定唯一备货单号，可加入多个批次）
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">设备码扫码输入（回车自动绑定当前备货单与批次）</p>
            <input
              ref={scanInputRef}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                const raw = e.currentTarget.value;
                e.currentTarget.value = '';

                const target = findWarehouseDeviceByScan(raw);
                if (!target) return alert('未找到对应设备');
                addWarehouseDeviceToBatch(target, { closeAfterAdd: false });

                // 保持扫码效率：加入后继续聚焦
                window.setTimeout(() => scanInputRef.current?.focus(), 0);
              }}
              className="mt-2 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              placeholder="扫码后回车：如 20260318000009 / 861234567890129"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(action)}
        onClose={() => setAction(null)}
        title={action ? `批量操作：${action}` : '批量操作'}
        size="lg"
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setAction(null)}>
              取消
            </ActionButton>
            <ActionButton onClick={applyAction}>确认执行</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">执行范围</p>
            <p className="mt-2 text-sm font-black text-slate-900">当前批次：{currentBatch}</p>
            <p className="text-xs text-slate-500 mt-1">已选择 {selectedIds.length} 台水表</p>
          </div>
          {action === '写IP地址' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  主IP <span className="text-rose-500">*</span>
                </label>
                <input
                  value={actionForm.mainIp}
                  onChange={(event) => setActionForm((prev) => ({ ...prev, mainIp: event.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  副IP <span className="text-rose-500">*</span>
                </label>
                <input
                  value={actionForm.backupIp}
                  onChange={(event) => setActionForm((prev) => ({ ...prev, backupIp: event.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                />
              </div>
            </div>
          )}
          {action === '写表底' && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                表底值 <span className="text-rose-500">*</span>
              </label>
              <input
                value={actionForm.presetBase}
                onChange={(event) => setActionForm((prev) => ({ ...prev, presetBase: event.target.value }))}
                placeholder="例如：0.300"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          )}
          {action && action !== '写IP地址' && action !== '写表底' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <>演示：将对所选水表执行“{action}”，并记录操作人员与更新时间。</>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isStandardsOpen}
        onClose={() => setIsStandardsOpen(false)}
        title="配置测试数据异常判定参数"
        size="lg"
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setIsStandardsOpen(false)}>
              取消
            </ActionButton>
            <ActionButton
              onClick={() => {
                setStandards({ ...draftStandards });
                setIsStandardsOpen(false);
              }}
            >
              保存参数
            </ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            以下三项仅用于自动判定<strong>数据是否异常</strong>：异常时对应列表<strong>列文字标红</strong>（默认色 #CF1322）。
            <strong className="text-slate-800">与合格/不合格判定无关</strong>
            （合格仍由表号/流量精度/电压上限/阀门/IP 等规则或人工确认）。
          </p>
          <div className="grid sm:grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                电池电压下限（V，1 位小数）<span className="text-rose-500">*</span>
                <span className="text-slate-400 font-normal normal-case ml-1">默认 3.6，低于则电池电压列标红</span>
              </label>
              <input
                value={draftStandards.batteryVoltageLowerLimit}
                onChange={(event) =>
                  setDraftStandards((prev) => ({ ...prev, batteryVoltageLowerLimit: event.target.value }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                信号质量（CSQ）下限<span className="text-rose-500">*</span>
                <span className="text-slate-400 font-normal normal-case ml-1">默认 13，低于则 CSQ 数值标红</span>
              </label>
              <input
                value={draftStandards.csqLowerLimit}
                onChange={(event) => setDraftStandards((prev) => ({ ...prev, csqLowerLimit: event.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                无磁信号下限<span className="text-rose-500">*</span>
                <span className="text-slate-400 font-normal normal-case ml-1">默认 130，低于则无磁信号列标红（可解析为数字时）</span>
              </label>
              <input
                value={draftStandards.magneticSignalLowerLimit}
                onChange={(event) =>
                  setDraftStandards((prev) => ({ ...prev, magneticSignalLowerLimit: event.target.value }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          {/* <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-slate-800">条件图片存档</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                  留存与当前合格标准配套的现场佐证（如仪表/温压/参数界面屏拍等），用于质检与历史追溯。演示页存于浏览器本地；正式环境建议上传对象存储并在保存历史快照时一并关联。
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={conditionImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={pickConditionImages}
                />
                <ActionButton
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={ImagePlus}
                  onClick={() => conditionImageInputRef.current?.click()}
                  disabled={draftStandards.conditionImageArchives.length >= MAX_CONDITION_ARCHIVE_IMAGES}
                >
                  上传图片
                </ActionButton>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                  {draftStandards.conditionImageArchives.length}/{MAX_CONDITION_ARCHIVE_IMAGES}
                </span>
              </div>
            </div>
            {draftStandards.conditionImageArchives.length === 0 ? (
              <p className="text-xs text-slate-400">暂无存档，点击「上传图片」添加。</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {draftStandards.conditionImageArchives.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                  >
                    <a href={img.dataUrl} download={img.fileName} target="_blank" rel="noreferrer" className="block aspect-square bg-slate-100">
                      <img src={img.dataUrl} alt={img.fileName} className="w-full h-full object-cover" />
                    </a>
                    <button
                      type="button"
                      title="删除"
                      onClick={() =>
                        setDraftStandards((p) => ({
                          ...p,
                          conditionImageArchives: p.conditionImageArchives.filter((x) => x.id !== img.id),
                        }))
                      }
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                    <div className="px-2 py-1.5 border-t border-slate-100">
                      <p className="text-[10px] font-mono font-bold text-slate-800 truncate" title={img.fileName}>
                        {img.fileName}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">{img.uploadedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </Modal>
    </div>
  );
};
