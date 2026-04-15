import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
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
} from '../../../components/UIComponents';
import { ENTERPRISE_TYPE_LABEL } from '../../../data/enterpriseOptions';
import type { Enterprise } from '../../../types';
import { hasPermission } from '../../../permissions/helpers';
import { usePermissionSet } from '../../../permissions/PermissionContext';
import { fetchEnterprisePage, removeEnterprise, submitEnterprise } from '../api';
import { BlockingMask, EmptyRow, PaginationBar, SystemBanner } from '../ui';
import { readSystemSession } from '../session';

type EnterpriseFormState = {
  enterpriseName: string;
  enterpriseType: Enterprise['type'];
  adminName: string;
  loginAccount: string;
  password: string;
  status: Enterprise['status'];
  enterpriseCode: string;
};

function defaultFormState(): EnterpriseFormState {
  return {
    enterpriseName: '',
    enterpriseType: 'water-company',
    adminName: '',
    loginAccount: '',
    password: '',
    status: 'active',
    enterpriseCode: '',
  };
}

export function EnterpriseManagementTab() {
  const permissionCodes = usePermissionSet();
  const { isPlatformAdmin } = readSystemSession();
  const [records, setRecords] = useState<Enterprise[]>([]);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blockingLabel, setBlockingLabel] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Enterprise | null>(null);
  const [formState, setFormState] = useState<EnterpriseFormState>(defaultFormState);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canAdd = isPlatformAdmin && hasPermission(permissionCodes, ['enterprise_add', 'tenant_add']);
  const canEdit = hasPermission(permissionCodes, ['enterprise_edit', 'tenant_edit']);
  const canDelete = isPlatformAdmin && hasPermission(permissionCodes, ['enterprise_delete', 'tenant_delete']);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedKeyword(keyword.trim());
      setCurrentPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchEnterprisePage({
      current: currentPage,
      size: 10,
      keyword: appliedKeyword,
      status: statusFilter,
      enterpriseType: typeFilter,
    })
      .then((page) => {
        if (cancelled) {
          return;
        }
        setRecords(page.records);
        setCurrentPage(page.current || 1);
        setTotalPages(page.pages || 1);
        setTotal(page.total);
      })
      .catch((error) => {
        if (!cancelled) {
          setBanner({
            tone: 'error',
            message: error instanceof Error ? error.message : '企业列表加载失败',
          });
          setRecords([]);
          setTotalPages(1);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appliedKeyword, currentPage, reloadKey, statusFilter, typeFilter]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormState(defaultFormState());
    setModalOpen(true);
  };

  const openEditModal = (record: Enterprise) => {
    setEditingRecord(record);
    setFormState({
      enterpriseName: record.name,
      enterpriseType: record.type,
      adminName: record.adminName,
      loginAccount: record.adminUsername ?? '',
      password: '',
      status: record.status,
      enterpriseCode: record.code,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formState.enterpriseName.trim() || !formState.adminName.trim() || !formState.loginAccount.trim()) {
      setBanner({ tone: 'error', message: '企业名称、管理员姓名和登录账号不能为空' });
      return;
    }

    if (!editingRecord && !formState.password.trim()) {
      setBanner({ tone: 'error', message: '新增企业时初始密码不能为空' });
      return;
    }

    setBlockingLabel(editingRecord ? '正在保存企业...' : '正在创建企业...');
    try {
      await submitEnterprise({
        enterpriseId: editingRecord?.id,
        enterpriseName: formState.enterpriseName.trim(),
        enterpriseType: formState.enterpriseType === 'meter-factory' ? 2 : 1,
        adminName: formState.adminName.trim(),
        loginAccount: formState.loginAccount.trim(),
        password: formState.password.trim() || undefined,
        status: formState.status === 'active' ? 1 : 0,
      });
      setBanner({ tone: 'success', message: editingRecord ? '企业已更新' : '企业已创建' });
      setModalOpen(false);
      setCurrentPage(1);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '企业保存失败' });
    } finally {
      setBlockingLabel(null);
    }
  };

  const handleRemove = async (record: Enterprise) => {
    if (!window.confirm(`确认删除企业“${record.name}”吗？`)) {
      return;
    }

    setBlockingLabel('正在删除企业...');
    try {
      await removeEnterprise(record.id);
      setBanner({ tone: 'success', message: '企业已删除' });
      setCurrentPage(1);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '企业删除失败' });
    } finally {
      setBlockingLabel(null);
    }
  };

  return (
    <div className="relative space-y-4">
      <BlockingMask active={Boolean(blockingLabel)} label={blockingLabel ?? ''} />

      {banner ? <SystemBanner tone={banner.tone} message={banner.message} /> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            icon={Search}
            placeholder="搜索企业名称 / 管理员 / 登录账号"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          >
            <option value="">全部企业类型</option>
            {Object.entries(ENTERPRISE_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value === 'meter-factory' ? '2' : '1'}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          >
            <option value="">全部状态</option>
            <option value="1">正常</option>
            <option value="0">停用</option>
          </select>
          {canAdd ? (
            <ActionButton icon={Plus} onClick={openCreateModal}>
              新增企业
            </ActionButton>
          ) : null}
        </div>
      </div>

      <TableContainer>
        <TableHead>
          <tr>
            <TableHeader>企业名称</TableHeader>
            <TableHeader>企业编码</TableHeader>
            <TableHeader>企业类型</TableHeader>
            <TableHeader>管理员姓名</TableHeader>
            <TableHeader>登录账号</TableHeader>
            <TableHeader>创建时间</TableHeader>
            <TableHeader>状态</TableHeader>
            <TableHeader className="text-right">操作</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-black text-slate-900">{record.name}</TableCell>
              <TableCell className="font-mono text-slate-500">{record.code || '保存后生成'}</TableCell>
              <TableCell className="font-medium text-slate-600">{ENTERPRISE_TYPE_LABEL[record.type]}</TableCell>
              <TableCell className="font-medium text-slate-600">{record.adminName || '-'}</TableCell>
              <TableCell className="font-mono text-slate-700">{record.adminUsername || '-'}</TableCell>
              <TableCell className="font-medium text-slate-500">{record.createdAt || '-'}</TableCell>
              <TableCell>
                <StatusBadge variant={record.status === 'active' ? 'success' : 'warning'}>
                  {record.status === 'active' ? '正常' : '停用'}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right">
                {canEdit || canDelete ? (
                  <div className="flex items-center justify-end gap-1">
                    {canEdit ? (
                      <ActionButton variant="ghost" size="sm" icon={Edit2} className="text-slate-400 hover:text-primary" onClick={() => openEditModal(record)} />
                    ) : null}
                    {canDelete ? (
                      <ActionButton variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-rose-600" onClick={() => handleRemove(record)} />
                    ) : null}
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
          {!loading && records.length === 0 ? <EmptyRow colSpan={8} message="暂无企业数据" /> : null}
          {loading ? <EmptyRow colSpan={8} message="企业列表加载中..." /> : null}
        </tbody>
      </TableContainer>

      <PaginationBar current={currentPage} pages={totalPages} total={total} onPageChange={setCurrentPage} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? '编辑企业' : '新增企业'}
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </ActionButton>
            <ActionButton onClick={handleSave}>保存</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">企业名称</label>
            <input
              type="text"
              value={formState.enterpriseName}
              onChange={(event) => setFormState((current) => ({ ...current, enterpriseName: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="请输入企业名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">企业编码</label>
              <input
                type="text"
                value={formState.enterpriseCode || '保存后自动生成'}
                readOnly={true}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">企业类型</label>
              <select
                value={formState.enterpriseType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    enterpriseType: event.target.value as Enterprise['type'],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                {Object.entries(ENTERPRISE_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">管理员姓名</label>
              <input
                type="text"
                value={formState.adminName}
                onChange={(event) => setFormState((current) => ({ ...current, adminName: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="请输入管理员姓名"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">登录账号</label>
              <input
                type="text"
                value={formState.loginAccount}
                onChange={(event) => setFormState((current) => ({ ...current, loginAccount: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="请输入企业管理员登录账号"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                {editingRecord ? '重置密码' : '初始密码'}
              </label>
              <input
                type="password"
                value={formState.password}
                onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder={editingRecord ? '不修改请留空' : '请输入初始密码'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">状态</label>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    status: event.target.value as Enterprise['status'],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="active">正常</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
