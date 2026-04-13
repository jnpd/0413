import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Edit2,
  FileUp,
  Package,
  Plus,
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
import { WATER_COMPANY_OPTIONS, WATER_PLANT_OPTIONS } from '../data/enterpriseOptions';

type ValveStatus = 'closed' | 'open' | 'fault';
type DeviceStatus = 'in_stock' | 'outbound';
type TestStatus = 'pending' | 'passed' | 'failed';
type Protocol = 'CJT188' | '恩乐曼' | 'SR';
type Carrier = '电信' | '移动' | '';

const PROTOCOL_OPTIONS: Protocol[] = ['CJT188', '恩乐曼', 'SR'];
const CARRIER_OPTIONS: Carrier[] = ['', '电信', '移动'];
// 来自批次管理页的“备货单号”（示例口径：productionOrderNo）
const BATCH_BILL_NO_OPTIONS = ['2603-002', '2603-003'];

const TABLE_NAME_OPTIONS = [
  '户用远传水表（DN15）',
  '户用远传水表（DN20）',
  '大口径产测表（DN25）',
] as const;

const TABLE_NAME_META: Record<
  string,
  { tableModel: string; tableCaliber: string }
> = {
  '户用远传水表（DN15）': { tableModel: 'LXSG-15', tableCaliber: 'DN15' },
  '户用远传水表（DN20）': { tableModel: 'LXSG-20', tableCaliber: 'DN20' },
  '大口径产测表（DN25）': { tableModel: 'LXSG-25', tableCaliber: 'DN25' },
};

interface WarehouseRecord {
  id: string;
  meterNo: string;
  inboundTime: string;
  outboundTime: string;
  forwardFlow: string;
  reverseFlow: string;
  tableName: string;
  tableModel: string;
  tableCaliber: string;
  billNo: string;
  waterCompanyId: string;
  waterCompanyName: string;
  waterPlantId: string;
  waterPlantName: string;
  mainIp: string;
  backupIp: string;
  boxNo: string;
  vendorCode: string;
  protocol: Protocol;
  carrier: Carrier;
  valveStatus: ValveStatus;
  batteryVoltage: string;
  imei: string;
  iccid: string;
  csq: string;
  rsrp: string;
  rsrq: string;
  deviceStatus: DeviceStatus;
  testStatus: TestStatus;
  outboundOperator: string;
  productionRemark: string;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseFormState {
  meterNo: string;
  tableName: string;
  tableModel: string;
  tableCaliber: string;
  billNo: string;
  waterCompanyId: string;
  waterPlantId: string;
  mainIp: string;
  backupIp: string;
  boxNo: string;
  vendorCode: string;
  imei: string;
  iccid: string;
  deviceStatus: DeviceStatus;
  protocol: Protocol;
  carrier: Carrier;
  outboundOperator: string;
  productionRemark: string;
}

const initialForm: WarehouseFormState = {
  meterNo: '',
  tableName: '',
  tableModel: '',
  tableCaliber: '',
  billNo: '',
  waterCompanyId: '',
  waterPlantId: '',
  mainIp: '',
  backupIp: '',
  boxNo: '',
  vendorCode: '',
  imei: '',
  iccid: '',
  deviceStatus: 'in_stock',
  protocol: 'CJT188',
  carrier: '',
  outboundOperator: '',
  productionRemark: '',
};

const initialRecords: WarehouseRecord[] = [
  {
    id: 'w1',
    meterNo: '20260318000001',
    inboundTime: '2026-03-18 09:10:11',
    outboundTime: '',
    forwardFlow: '0.000',
    reverseFlow: '0.000',
    tableName: '户用远传水表（DN15）',
    tableModel: 'LXSG-15',
    tableCaliber: 'DN15',
    billNo: 'WO-20260318-001',
    waterCompanyId: '1',
    waterCompanyName: '智慧水务有限公司',
    waterPlantId: '2',
    waterPlantName: '工业仪表制造厂',
    mainIp: '192.168.1.10',
    backupIp: '192.168.1.11',
    boxNo: 'BX-20260318-0001',
    vendorCode: 'NB-001',
    protocol: 'CJT188',
    carrier: '电信',
    valveStatus: 'open',
    batteryVoltage: '3.62',
    imei: '861234567890121',
    iccid: '89860123456789012341',
    csq: '22',
    rsrp: '-88',
    rsrq: '-10',
    deviceStatus: 'in_stock',
    testStatus: 'pending',
    outboundOperator: '',
    productionRemark: '',
    createdAt: '2026-03-18 09:10:11',
    updatedAt: '2026-03-18 09:10:11',
  },
  {
    id: 'w2',
    meterNo: '20260318000002',
    inboundTime: '2026-03-18 09:18:30',
    outboundTime: '',
    forwardFlow: '0.356',
    reverseFlow: '0.012',
    tableName: '户用远传水表（DN20）',
    tableModel: 'LXSG-20',
    tableCaliber: 'DN20',
    billNo: 'WO-20260318-002',
    waterCompanyId: '3',
    waterCompanyName: '清源供水有限公司',
    waterPlantId: '2',
    waterPlantName: '工业仪表制造厂',
    mainIp: '192.168.1.20',
    backupIp: '192.168.1.21',
    boxNo: 'BX-20260318-0002',
    vendorCode: 'QD-002',
    protocol: '恩乐曼',
    carrier: '移动',
    valveStatus: 'closed',
    batteryVoltage: '3.56',
    imei: '861234567890122',
    iccid: '89860123456789012342',
    csq: '24',
    rsrp: '-85',
    rsrq: '-9',
    deviceStatus: 'in_stock',
    testStatus: 'passed',
    outboundOperator: '',
    productionRemark: '样机批次，需跟踪返修率',
    createdAt: '2026-03-18 09:18:30',
    updatedAt: '2026-03-18 09:18:30',
  },
  {
    id: 'w3',
    meterNo: '20260317000013',
    inboundTime: '2026-03-17 16:42:09',
    outboundTime: '2026-03-18 10:05:00',
    forwardFlow: '1.204',
    reverseFlow: '0.034',
    tableName: '大口径产测表（DN25）',
    tableModel: 'LXSG-25',
    tableCaliber: 'DN25',
    billNo: 'WO-20260317-003',
    waterCompanyId: '1',
    waterCompanyName: '智慧水务有限公司',
    waterPlantId: '4',
    waterPlantName: '城东制表厂',
    mainIp: '192.168.2.10',
    backupIp: '192.168.2.11',
    boxNo: 'BX-20260317-0003',
    vendorCode: 'HZ-003',
    protocol: 'SR',
    carrier: '电信',
    valveStatus: 'fault',
    batteryVoltage: '2.96',
    imei: '861234567890123',
    iccid: '89860123456789012343',
    csq: '18',
    rsrp: '-103',
    rsrq: '-15',
    deviceStatus: 'outbound',
    testStatus: 'failed',
    outboundOperator: '张三',
    productionRemark: '故障出库，待质检复核',
    createdAt: '2026-03-17 16:42:09',
    updatedAt: '2026-03-18 10:05:00',
  },
];

const valveMeta: Record<ValveStatus, { label: string; badge: 'success' | 'warning' | 'error' }> = {
  open: { label: '开', badge: 'success' },
  closed: { label: '关', badge: 'neutral' as 'warning' },
  fault: { label: '故障', badge: 'error' },
};

const deviceMeta: Record<DeviceStatus, { label: string; badge: 'success' | 'warning' }> = {
  in_stock: { label: '在库', badge: 'success' },
  outbound: { label: '已出库', badge: 'warning' },
};

const testMeta: Record<TestStatus, { label: string; badge: 'success' | 'warning' | 'error' }> = {
  pending: { label: '0-待测', badge: 'warning' },
  passed: { label: '1-合格', badge: 'success' },
  failed: { label: '2-不合格', badge: 'error' },
};

const getNowLabel = () => new Date().toLocaleString('zh-CN', { hour12: false });

const makeAutoSnapshot = (seed: number, protocolInput: Protocol, carrierInput: Carrier) => {
  const reportCarrier: Carrier = carrierInput || (seed % 2 === 0 ? '电信' : '移动');
  const mainIp = `192.168.${seed % 5}.${10 + (seed % 70)}`;
  const backupIp = `192.168.${(seed % 5) + 1}.${11 + (seed % 70)}`;
  const makeIccid = (s: number) => {
    const tail = String(Math.abs(s)).padStart(16, '0').slice(-16);
    return `8986${tail}`; // 20 位（示例口径）
  };

  return {
  // 没有“预置表底数”时，用 seed 生成一个可展示的演示正向累积流量
  forwardFlow: ((seed % 120) / 100).toFixed(3),
  // 反向累积流量：上报数据口径待讨论，这里先按演示数据生成（三位小数）
  reverseFlow: (seed % 17 === 0 ? '0.000' : ((seed % 60) / 1000).toFixed(3)),
  valveStatus: (seed % 5 === 0 ? 'fault' : seed % 2 === 0 ? 'closed' : 'open') as ValveStatus,
  batteryVoltage: (3.2 + ((seed % 7) * 0.08)).toFixed(2),
  csq: String(18 + (seed % 8)),
  rsrp: String(-100 + (seed % 12)),
  rsrq: String(-14 + (seed % 4)),
  // 设备上报回写字段（以上报为准）
  mainIp,
  backupIp,
  iccid: makeIccid(seed),
  protocol: protocolInput,
  carrier: reportCarrier,
  };
};

export const WarehouseView: React.FC = () => {
  const [records, setRecords] = useState<WarehouseRecord[]>(initialRecords);
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WarehouseFormState>(initialForm);
  const billNoOptions = useMemo(() => {
    const fromRecords = records.map((r) => r.billNo).filter(Boolean);
    const all = Array.from(new Set([...BATCH_BILL_NO_OPTIONS, ...fromRecords]));
    return all.sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter((item) =>
      [
        item.meterNo,
        item.tableName,
        item.tableModel,
        item.tableCaliber,
        item.billNo,
        item.waterCompanyName,
        item.waterPlantName,
        item.mainIp,
        item.backupIp,
        item.boxNo,
        item.vendorCode,
        item.imei,
        item.iccid,
        item.inboundTime,
        item.outboundTime,
        item.forwardFlow,
        item.reverseFlow,
        item.protocol,
        item.carrier,
        item.outboundOperator,
        item.productionRemark,
        item.deviceStatus,
        item.testStatus,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [keyword, records]);

  const stats = useMemo(
    () => [
      {
        label: '在库设备',
        value: records.filter((item) => item.deviceStatus === 'in_stock').length.toString(),
        icon: Package,
        tone: 'bg-primary/10 text-primary',
      },
      {
        label: '已出库',
        value: records.filter((item) => item.deviceStatus === 'outbound').length.toString(),
        icon: ArrowUpRight,
        tone: 'bg-amber-50 text-amber-700',
      },
      {
        label: '待测',
        value: records.filter((item) => item.testStatus === 'pending').length.toString(),
        icon: Scan,
        tone: 'bg-slate-100 text-slate-700',
      },
      {
        label: '不合格',
        value: records.filter((item) => item.testStatus === 'failed').length.toString(),
        icon: Trash2,
        tone: 'bg-rose-50 text-rose-700',
      },
    ],
    [records]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: WarehouseRecord) => {
    setEditingId(item.id);
    setForm({
      meterNo: item.meterNo,
      tableName: item.tableName,
      tableModel: item.tableModel,
      tableCaliber: item.tableCaliber,
      billNo: item.billNo,
      waterCompanyId: item.waterCompanyId,
      waterPlantId: item.waterPlantId,
      mainIp: item.mainIp,
      backupIp: item.backupIp,
      boxNo: item.boxNo,
      vendorCode: item.vendorCode,
      imei: item.imei,
      iccid: item.iccid,
      deviceStatus: item.deviceStatus,
      protocol: item.protocol,
      carrier: item.carrier,
      outboundOperator: item.outboundOperator,
      productionRemark: item.productionRemark,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    const tableName = form.tableName.trim();
    const vendorCode = form.vendorCode.trim();
    const imei = form.imei.trim();
    const protocolInput = form.protocol;
    const carrierInput = form.carrier;
    const productionRemark = form.productionRemark.trim();
    const outboundOperator = form.outboundOperator.trim();
    const waterCompanyId = form.waterCompanyId.trim();
    const waterPlantId = form.waterPlantId.trim();
    const waterCompanyName = WATER_COMPANY_OPTIONS.find((item) => item.id === waterCompanyId)?.name || '';
    const waterPlantName = WATER_PLANT_OPTIONS.find((item) => item.id === waterPlantId)?.name || '';

    const meterNoInput = form.meterNo.trim();
    const generateMeterNo = () => {
      // 生成 14 位数字（演示口径）：以当前时间与 IMEI 末尾混合，避免为空时无法保存
      const base = imei ? Number(imei.slice(-6) || 0) : 0;
      const now = Date.now().toString().replace(/\D/g, '');
      const suffix = String(base).replace(/\D/g, '');
      const raw = (now + suffix).slice(-14);
      return /^\d{14}$/.test(raw) ? raw : String(Date.now()).slice(-14).padStart(14, '0');
    };

    let meterNo = meterNoInput;
    if (!meterNo) {
      // 新增时不在弹窗展示水表表号：自动生成并保证唯一
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = generateMeterNo();
        if (!records.some((item) => item.meterNo === candidate)) {
          meterNo = candidate;
          break;
        }
      }
    }
    if (!meterNo || !/^\d{14}$/.test(meterNo)) {
      alert('水表表号需为 14 位数字（系统生成失败）');
      return;
    }

    if (!tableName) {
      alert('请填写表具名称');
      return;
    }
    if (!imei) {
      alert('请输入 IMEI 码');
      return;
    }
    if (!protocolInput) {
      alert('请选择通讯协议');
      return;
    }
    if (!waterPlantId) {
      alert('请选择所属水厂');
      return;
    }
    if (!editingId && records.some((item) => item.meterNo === meterNo)) {
      alert('水表表号已存在，请稍后重试');
      return;
    }
    if (form.deviceStatus === 'outbound' && !outboundOperator) {
      alert('出库操作人员为必填项');
      return;
    }

    const billNo = form.billNo.trim();
    const boxNo = form.boxNo.trim();
    // 由于新增弹窗不再让用户维护型号/口径：这里从表具名称做演示推断（生产环境应由档案联动）
    let tableModel = form.tableModel.trim();
    let tableCaliber = form.tableCaliber.trim();
    if (!tableCaliber || !tableModel) {
      const match = tableName.match(/DN(\d{1,3})/i);
      const dn = match ? match[1] : '15';
      tableCaliber = `DN${dn}`;
      tableModel = `LXSG-${dn}`;
    }

    const nowLabel = getNowLabel();
    const seed = Number(meterNo.slice(-2)) || Date.now();
    const autoSnapshot = makeAutoSnapshot(seed, protocolInput, carrierInput);

    if (editingId) {
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                meterNo,
                tableName,
                tableModel,
                tableCaliber,
                billNo,
                waterCompanyId,
                waterCompanyName,
                waterPlantId,
                waterPlantName,
                boxNo,
                vendorCode,
                imei,
                deviceStatus: form.deviceStatus,
                outboundOperator: form.deviceStatus === 'outbound' ? outboundOperator : '',
                productionRemark,
                outboundTime: form.deviceStatus === 'outbound' ? (item.outboundTime || nowLabel) : '',
                ...autoSnapshot,
                updatedAt: nowLabel,
              }
            : item
        )
      );
    } else {
      setRecords((prev) => [
        {
          id: Date.now().toString(),
          meterNo,
          inboundTime: nowLabel,
          outboundTime: form.deviceStatus === 'outbound' ? nowLabel : '',
          tableName,
          tableModel,
          tableCaliber,
          billNo,
          waterCompanyId,
          waterCompanyName,
          waterPlantId,
          waterPlantName,
          boxNo,
          vendorCode,
          imei,
          deviceStatus: form.deviceStatus,
          testStatus: 'pending',
          outboundOperator: form.deviceStatus === 'outbound' ? outboundOperator : '',
          productionRemark,
          createdAt: nowLabel,
          updatedAt: nowLabel,
          ...autoSnapshot,
        },
        ...prev,
      ]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const updateForm = (key: keyof WarehouseFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 space-y-4 bg-slate-50/50 min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-all"
          >
            <div className={`p-3 rounded-xl ${stat.tone}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <SearchInput
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索水表表号、IMEI、ICCID、水务公司、水厂、测试状态..."
            />
            <ActionButton variant="secondary" icon={Scan} onClick={openCreateModal}>
              扫码新增
            </ActionButton>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton icon={Plus} onClick={openCreateModal}>
              手动入库
            </ActionButton>
            <ActionButton variant="outline" icon={FileUp}>
              批量导入
            </ActionButton>
            <ActionButton variant="outline" icon={ArrowUpRight}>
              批量出库
            </ActionButton>
          </div>
        </div>

        <TableContainer className="border-0 rounded-none shadow-none">
          <TableHead>
            <tr>
              <TableHeader className="whitespace-nowrap">IMEI</TableHeader>
              <TableHeader className="whitespace-nowrap">水表表号</TableHeader>
              <TableHeader className="whitespace-nowrap">入库时间</TableHeader>
              <TableHeader className="whitespace-nowrap">正向累积流量</TableHeader>
              <TableHeader className="whitespace-nowrap">反向累积流量</TableHeader>
              <TableHeader className="whitespace-nowrap">备货单号</TableHeader>
              <TableHeader className="whitespace-nowrap">所属水务公司</TableHeader>
              <TableHeader className="whitespace-nowrap">所属水厂</TableHeader>
              <TableHeader className="whitespace-nowrap">主/副IP</TableHeader>
              <TableHeader className="whitespace-nowrap">表具名称</TableHeader>
              <TableHeader className="whitespace-nowrap">表具型号</TableHeader>
              <TableHeader className="whitespace-nowrap">口径</TableHeader>
              <TableHeader className="whitespace-nowrap">通讯协议</TableHeader>
              <TableHeader className="whitespace-nowrap">运营商</TableHeader>
              <TableHeader className="whitespace-nowrap">阀门状态</TableHeader>
              <TableHeader className="whitespace-nowrap">电池电压</TableHeader>
              <TableHeader className="whitespace-nowrap">装箱号</TableHeader>
              <TableHeader className="whitespace-nowrap">厂商代码</TableHeader>
              <TableHeader className="whitespace-nowrap">ICCID</TableHeader>
              <TableHeader className="whitespace-nowrap">CSQ / RSRP / RSRQ</TableHeader>
              <TableHeader className="whitespace-nowrap">库存状态</TableHeader>
              <TableHeader className="whitespace-nowrap">测试状态</TableHeader>
              <TableHeader className="whitespace-nowrap">出库时间</TableHeader>
              <TableHeader className="whitespace-nowrap">出库操作人员</TableHeader>
              <TableHeader className="whitespace-nowrap">备注</TableHeader>
              <TableHeader className="whitespace-nowrap">更新时间</TableHeader>
              <TableHeader className="text-right whitespace-nowrap">操作</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {filteredRecords.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap">{item.imei}</TableCell>
                <TableCell className="font-mono font-black text-slate-900 whitespace-nowrap">{item.meterNo}</TableCell>
                <TableCell className="text-slate-500 text-xs whitespace-nowrap">{item.inboundTime}</TableCell>
                <TableCell className="font-mono text-slate-700 whitespace-nowrap">{item.forwardFlow} m³</TableCell>
                <TableCell className="font-mono text-slate-700 whitespace-nowrap">{item.reverseFlow} m</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.billNo || '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.waterCompanyName || '待分配'}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.waterPlantName || '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">
                  {item.mainIp || '—'} / {item.backupIp || '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.tableName}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.tableModel}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.tableCaliber}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.protocol}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.carrier}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge variant={valveMeta[item.valveStatus].badge}>{valveMeta[item.valveStatus].label}</StatusBadge>
                </TableCell>
                <TableCell className="font-mono text-slate-600 whitespace-nowrap">{item.batteryVoltage} V</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.boxNo || '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.vendorCode || '—'}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="font-mono text-slate-500 text-xs">{item.iccid || '未绑定 ICCID'}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="font-mono text-xs text-slate-500 whitespace-nowrap">
                    CSQ {item.csq} / RSRP {item.rsrp} / RSRQ {item.rsrq}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge variant={deviceMeta[item.deviceStatus].badge}>{deviceMeta[item.deviceStatus].label}</StatusBadge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge variant={testMeta[item.testStatus].badge}>{testMeta[item.testStatus].label}</StatusBadge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-slate-500 text-xs">{item.outboundTime || '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-400 text-xs">{item.outboundOperator || '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-xs text-slate-600">{item.productionRemark || '—'}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-[11px] text-slate-400">{item.updatedAt}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <ActionButton variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(item)} />
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? '编辑仓库记录' : '新增仓库记录'}
        footer={
          <>
            <ActionButton
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
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
                所属水厂 <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.waterPlantId}
                onChange={(event) => updateForm('waterPlantId', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:border-primary/10 focus:border-primary"
              >
                <option value="">请选择所属水厂</option>
                {WATER_PLANT_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                表具名称 <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.tableName}
                onChange={(event) => {
                  const nextTableName = event.target.value;
                  const meta = TABLE_NAME_META[nextTableName];
                  updateForm('tableName', nextTableName);
                  if (meta) {
                    updateForm('tableModel', meta.tableModel);
                    updateForm('tableCaliber', meta.tableCaliber);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:border-primary/10 focus:border-primary"
              >
                <option value="">请选择表具名称</option>
                {TABLE_NAME_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                所属水务公司 <span className="text-slate-400 font-normal">(可选)</span>
              </label>
              <select
                value={form.waterCompanyId}
                onChange={(event) => updateForm('waterCompanyId', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:border-primary/10 focus:border-primary"
              >
                <option value="">暂不绑定水务公司</option>
                {WATER_COMPANY_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-slate-500">
              所属水厂/所属水务公司均来自账户管理的企业主数据；当前原型按“企业类型”过滤，设备页中的“所属水厂”暂复用企业类型为“水表厂”的数据口径。
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                备货单号 <span className="text-slate-400 font-normal normal-case">（可选）</span>
              </label>
              <select
                value={form.billNo}
                onChange={(event) => updateForm('billNo', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              >
                <option value="">暂不关联备货单</option>
                {billNoOptions.map((no) => (
                  <option key={no} value={no}>
                    {no}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 hidden">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                装箱号 <span className="text-slate-400 font-normal">(来自包装管理)</span>
              </label>
              <input
                type="text"
                value={form.boxNo}
                disabled
                placeholder="未打包（包装后由系统回填）"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 hidden">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                主 IP <span className="text-slate-400 font-normal">(设备上报回写)</span>
              </label>
              <input
                type="text"
                value={form.mainIp}
                disabled
                placeholder="例如：192.168.1.10"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5 hidden">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                副 IP <span className="text-slate-400 font-normal">(设备上报回写)</span>
              </label>
              <input
                type="text"
                value={form.backupIp}
                disabled
                placeholder="例如：192.168.1.11"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                IMEI 码 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.imei}
                onChange={(event) => updateForm('imei', event.target.value)}
                placeholder="请输入设备 IMEI"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5 hidden">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                ICCID 卡号 <span className="text-slate-400 font-normal">(设备上报回写)</span>
              </label>
              <input
                type="text"
                value={form.iccid}
                disabled
                placeholder="如已写卡可录入 ICCID"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 hidden">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">设备状态</label>
              <select
                value={form.deviceStatus}
                onChange={(event) => updateForm('deviceStatus', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              >
                <option value="in_stock">0-在库</option>
                <option value="outbound">1-已出库</option>
              </select>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-slate-500">
              入库时间/出库时间、正向/反向累积流量、阀门状态、电池电压、CSQ/RSRP/RSRQ、测试状态为设备上报/平台判定字段；主/副 IP、ICCID、通讯协议与运营商以上报为准回填；装箱号来自包装管理（只读）；备货单号为可选下拉（关联批次管理），厂商代码/备注信息为可选输入。
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                通讯协议 <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.protocol}
                onChange={(event) => updateForm('protocol', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              >
                {PROTOCOL_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">运营商</label>
              <select
                value={form.carrier}
                onChange={(event) => updateForm('carrier', event.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              >
                {CARRIER_OPTIONS.map((item) => (
                  <option key={item || 'empty'} value={item}>
                    {item || '未填写'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">厂商代码</label>
              <input
                type="text"
                value={form.vendorCode}
                onChange={(event) => updateForm('vendorCode', event.target.value)}
                placeholder="例如：NB-001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">备注信息</label>
              <textarea
                value={form.productionRemark}
                onChange={(event) => updateForm('productionRemark', event.target.value)}
                placeholder="例如：批次/版本差异、特殊工艺说明（可选）"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary min-h-[70px] resize-y"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 hidden">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                出库操作人员 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.outboundOperator}
                onChange={(event) => updateForm('outboundOperator', event.target.value)}
                placeholder={form.deviceStatus === 'outbound' ? '必填：例如 张三' : '可选'}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
