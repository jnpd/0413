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
import type { Enterprise, Role, UserAccount } from '../../../types';
import { hasPermission } from '../../../permissions/helpers';
import { usePermissionSet } from '../../../permissions/PermissionContext';
import { fetchEnterpriseList, fetchRolePage, fetchUserPage, removeUser, submitUser } from '../api';
import { BlockingMask, EmptyRow, PaginationBar, SystemBanner } from '../ui';
import { readSystemSession } from '../session';

type UserFormState = {
  account: string;
  realName: string;
  enterpriseId: string;
  isAdmin: '0' | '1';
  roleId: string;
  password: string;
  status: UserAccount['status'];
};

function defaultUserForm(): UserFormState {
  return {
    account: '',
    realName: '',
    enterpriseId: '',
    isAdmin: '0',
    roleId: '',
    password: '',
    status: 'active',
  };
}

function resolveAdminRoleId(enterpriseId: string, enterprises: Enterprise[], roles: Role[]) {
  const enterprise = enterprises.find((item) => item.id === enterpriseId);
  if (!enterprise) {
    return '';
  }

  const alias = enterprise.type === 'meter-factory' ? 'water_factory_admin' : 'water_company_admin';
  return roles.find((role) => role.alias === alias)?.id ?? '';
}

export function UserManagementTab() {
  const permissionCodes = usePermissionSet();
  const { isPlatformAdmin } = readSystemSession();
  const [records, setRecords] = useState<UserAccount[]>([]);
  const [enterpriseOptions, setEnterpriseOptions] = useState<Enterprise[]>([]);
  const [roleOptions, setRoleOptions] = useState<Role[]>([]);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blockingLabel, setBlockingLabel] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserAccount | null>(null);
  const [formState, setFormState] = useState<UserFormState>(defaultUserForm);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canAdd = hasPermission(permissionCodes, ['user_add']);
  const canEdit = hasPermission(permissionCodes, ['user_edit']);
  const canDelete = hasPermission(permissionCodes, ['user_delete']);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedKeyword(keyword.trim());
      setCurrentPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchEnterpriseList(),
      fetchRolePage({ current: 1, size: 200 }),
    ])
      .then(([enterprises, rolesPage]) => {
        if (cancelled) {
          return;
        }
        setEnterpriseOptions(enterprises);
        setRoleOptions(rolesPage.records);
        if (!isPlatformAdmin && enterprises[0]) {
          setEnterpriseFilter(enterprises[0].id);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setBanner({ tone: 'error', message: error instanceof Error ? error.message : '人员页面基础数据加载失败' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isPlatformAdmin]);

  useEffect(() => {
    let cancelled = false;
    const effectiveEnterpriseFilter = isPlatformAdmin ? enterpriseFilter : enterpriseOptions[0]?.id ?? enterpriseFilter;

    setLoading(true);
    fetchUserPage({
      current: currentPage,
      size: 10,
      keyword: appliedKeyword,
      enterpriseId: effectiveEnterpriseFilter,
      status: statusFilter,
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
          setBanner({ tone: 'error', message: error instanceof Error ? error.message : '人员列表加载失败' });
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
  }, [appliedKeyword, currentPage, enterpriseFilter, enterpriseOptions, isPlatformAdmin, reloadKey, statusFilter]);

  const openCreateModal = () => {
    const lockedEnterpriseId = isPlatformAdmin ? '' : enterpriseOptions[0]?.id ?? '';
    setEditingRecord(null);
    setFormState({
      ...defaultUserForm(),
      enterpriseId: lockedEnterpriseId,
    });
    setModalOpen(true);
  };

  const openEditModal = (record: UserAccount) => {
    setEditingRecord(record);
    setFormState({
      account: record.username,
      realName: record.realName,
      enterpriseId: record.enterpriseId,
      isAdmin: record.isAdmin ? '1' : '0',
      roleId: record.roleId ?? '',
      password: '',
      status: record.status,
    });
    setModalOpen(true);
  };

  const effectiveEnterpriseId = isPlatformAdmin ? formState.enterpriseId : enterpriseOptions[0]?.id ?? formState.enterpriseId;
  const effectiveRoleId = formState.isAdmin === '1'
    ? resolveAdminRoleId(effectiveEnterpriseId, enterpriseOptions, roleOptions)
    : formState.roleId;

  const handleSave = async () => {
    if (!formState.account.trim() || !formState.realName.trim()) {
      setBanner({ tone: 'error', message: '登录账号和人员姓名不能为空' });
      return;
    }
    if (!effectiveEnterpriseId) {
      setBanner({ tone: 'error', message: '所属企业不能为空' });
      return;
    }
    if (!editingRecord && !formState.password.trim()) {
      setBanner({ tone: 'error', message: '新增人员时初始密码不能为空' });
      return;
    }
    if (!effectiveRoleId) {
      setBanner({ tone: 'error', message: '所属角色不能为空' });
      return;
    }

    setBlockingLabel(editingRecord ? '正在保存人员...' : '正在创建人员...');
    try {
      await submitUser({
        id: editingRecord?.id,
        account: formState.account.trim(),
        realName: formState.realName.trim(),
        enterpriseId: effectiveEnterpriseId,
        roleId: effectiveRoleId,
        isAdmin: formState.isAdmin === '1' ? 1 : 0,
        password: formState.password.trim() || undefined,
        status: formState.status === 'active' ? 1 : 0,
      });
      setBanner({ tone: 'success', message: editingRecord ? '人员已更新' : '人员已创建' });
      setModalOpen(false);
      setCurrentPage(1);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '人员保存失败' });
    } finally {
      setBlockingLabel(null);
    }
  };

  const handleRemove = async (record: UserAccount) => {
    if (!window.confirm(`确认删除人员“${record.realName}”吗？`)) {
      return;
    }

    setBlockingLabel('正在删除人员...');
    try {
      await removeUser(record.id);
      setBanner({ tone: 'success', message: '人员已删除' });
      setCurrentPage(1);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '人员删除失败' });
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
            placeholder="搜索登录账号 / 人员姓名"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            value={isPlatformAdmin ? enterpriseFilter : enterpriseOptions[0]?.id ?? ''}
            disabled={!isPlatformAdmin}
            onChange={(event) => {
              setEnterpriseFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {isPlatformAdmin ? <option value="">全部企业</option> : null}
            {enterpriseOptions.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>
                {enterprise.name}
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
              新增人员
            </ActionButton>
          ) : null}
        </div>
      </div>

      <TableContainer>
        <TableHead>
          <tr>
            <TableHeader>登录账号</TableHeader>
            <TableHeader>人员姓名</TableHeader>
            <TableHeader>所属企业</TableHeader>
            <TableHeader>人员类型</TableHeader>
            <TableHeader>所属角色</TableHeader>
            <TableHeader>最后登录</TableHeader>
            <TableHeader>状态</TableHeader>
            <TableHeader className="text-right">操作</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-black text-slate-900">{record.username}</TableCell>
              <TableCell className="font-bold text-slate-700">{record.realName}</TableCell>
              <TableCell className="font-medium text-slate-600">{record.enterpriseName || '-'}</TableCell>
              <TableCell>
                <StatusBadge variant={record.isAdmin ? 'info' : 'neutral'}>
                  {record.isAdmin ? '企业管理员' : '普通人员'}
                </StatusBadge>
              </TableCell>
              <TableCell className="font-medium text-slate-600">{record.role || '-'}</TableCell>
              <TableCell className="font-medium text-slate-500">{record.lastLogin || '-'}</TableCell>
              <TableCell>
                <StatusBadge variant={record.status === 'active' ? 'success' : 'warning'}>
                  {record.status === 'active' ? '正常' : '停用'}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right">
                {(canEdit || canDelete) && !record.primaryAdmin ? (
                  <div className="flex items-center justify-end gap-1">
                    {canEdit ? (
                      <ActionButton variant="ghost" size="sm" icon={Edit2} className="text-slate-400 hover:text-primary" onClick={() => openEditModal(record)} />
                    ) : null}
                    {canDelete ? (
                      <ActionButton variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-rose-600" onClick={() => handleRemove(record)} />
                    ) : null}
                  </div>
                ) : record.primaryAdmin ? (
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">主管理员</span>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
          {!loading && records.length === 0 ? <EmptyRow colSpan={8} message="暂无人员数据" /> : null}
          {loading ? <EmptyRow colSpan={8} message="人员列表加载中..." /> : null}
        </tbody>
      </TableContainer>

      <PaginationBar current={currentPage} pages={totalPages} total={total} onPageChange={setCurrentPage} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? '编辑人员' : '新增人员'}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">登录账号</label>
              <input
                type="text"
                value={formState.account}
                onChange={(event) => setFormState((current) => ({ ...current, account: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="请输入登录账号"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">人员姓名</label>
              <input
                type="text"
                value={formState.realName}
                onChange={(event) => setFormState((current) => ({ ...current, realName: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="请输入人员姓名"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">所属企业</label>
              <select
                value={effectiveEnterpriseId}
                disabled={!isPlatformAdmin}
                onChange={(event) => setFormState((current) => ({ ...current, enterpriseId: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">请选择所属企业</option>
                {enterpriseOptions.map((enterprise) => (
                  <option key={enterprise.id} value={enterprise.id}>
                    {enterprise.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">人员类型</label>
              <select
                value={formState.isAdmin}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isAdmin: event.target.value as '0' | '1',
                    roleId: event.target.value === '1' ? '' : current.roleId,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="0">普通人员</option>
                <option value="1">企业管理员</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">所属角色</label>
              <select
                value={effectiveRoleId}
                disabled={formState.isAdmin === '1'}
                onChange={(event) => setFormState((current) => ({ ...current, roleId: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">请选择所属角色</option>
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">状态</label>
            <select
              value={formState.status}
              onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as UserAccount['status'] }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="active">正常</option>
              <option value="disabled">停用</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
