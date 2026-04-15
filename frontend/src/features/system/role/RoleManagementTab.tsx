import React, { useEffect, useState } from 'react';
import { Edit2, Plus, ShieldCheck, Trash2 } from 'lucide-react';
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
import type { Role } from '../../../types';
import { hasPermission } from '../../../permissions/helpers';
import { usePermissionSet } from '../../../permissions/PermissionContext';
import {
  fetchRoleGrantTree,
  fetchRolePage,
  fetchRoleTreeKeys,
  grantRoleMenus,
  removeRole,
  submitRole,
  type MenuTreeNode,
} from '../api';
import { BlockingMask, EmptyRow, MenuTreeChecklist, PaginationBar, SystemBanner } from '../ui';

type RoleFormState = {
  roleName: string;
  roleAlias: string;
  status: Role['status'];
};

function defaultRoleForm(): RoleFormState {
  return {
    roleName: '',
    roleAlias: '',
    status: 'active',
  };
}

export function RoleManagementTab() {
  const permissionCodes = usePermissionSet();
  const [records, setRecords] = useState<Role[]>([]);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blockingLabel, setBlockingLabel] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Role | null>(null);
  const [formState, setFormState] = useState<RoleFormState>(defaultRoleForm);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantingRole, setGrantingRole] = useState<Role | null>(null);
  const [grantTree, setGrantTree] = useState<MenuTreeNode[]>([]);
  const [checkedMenuIds, setCheckedMenuIds] = useState<Set<string>>(new Set());

  const canAdd = hasPermission(permissionCodes, ['role_add']);
  const canEdit = hasPermission(permissionCodes, ['role_edit']);
  const canDelete = hasPermission(permissionCodes, ['role_delete']);

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
    fetchRolePage({
      current: currentPage,
      size: 10,
      keyword: appliedKeyword,
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
          setBanner({ tone: 'error', message: error instanceof Error ? error.message : '角色列表加载失败' });
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
  }, [appliedKeyword, currentPage, reloadKey, statusFilter]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormState(defaultRoleForm());
    setModalOpen(true);
  };

  const openEditModal = (record: Role) => {
    setEditingRecord(record);
    setFormState({
      roleName: record.name,
      roleAlias: record.alias ?? '',
      status: record.status ?? 'active',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formState.roleName.trim() || !formState.roleAlias.trim()) {
      setBanner({ tone: 'error', message: '角色名称和角色别名不能为空' });
      return;
    }

    setBlockingLabel(editingRecord ? '正在保存角色...' : '正在创建角色...');
    try {
      await submitRole({
        id: editingRecord?.id,
        roleName: formState.roleName.trim(),
        roleAlias: formState.roleAlias.trim(),
        status: formState.status === 'active' ? 1 : 0,
      });
      setBanner({ tone: 'success', message: editingRecord ? '角色已更新' : '角色已创建' });
      setModalOpen(false);
      setCurrentPage(1);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '角色保存失败' });
    } finally {
      setBlockingLabel(null);
    }
  };

  const handleRemove = async (record: Role) => {
    if (!window.confirm(`确认删除角色“${record.name}”吗？`)) {
      return;
    }

    setBlockingLabel('正在删除角色...');
    try {
      await removeRole(record.id);
      setBanner({ tone: 'success', message: '角色已删除' });
      setCurrentPage(1);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '角色删除失败' });
    } finally {
      setBlockingLabel(null);
    }
  };

  const openGrantModal = async (record: Role) => {
    setGrantingRole(record);
    setGrantModalOpen(true);
    setBlockingLabel('正在加载授权树...');
    try {
      const [tree, checkedKeys] = await Promise.all([
        fetchRoleGrantTree(),
        fetchRoleTreeKeys(record.id),
      ]);
      setGrantTree(tree);
      setCheckedMenuIds(new Set(checkedKeys));
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '角色授权树加载失败' });
      setGrantModalOpen(false);
    } finally {
      setBlockingLabel(null);
    }
  };

  const toggleMenu = (menuId: string) => {
    setCheckedMenuIds((current) => {
      const next = new Set(current);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleGrantSave = async () => {
    if (!grantingRole) {
      return;
    }

    setBlockingLabel('正在保存角色授权...');
    try {
      await grantRoleMenus(grantingRole.id, Array.from(checkedMenuIds));
      setBanner({ tone: 'success', message: `角色“${grantingRole.name}”授权已更新` });
      setGrantModalOpen(false);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setBanner({ tone: 'error', message: error instanceof Error ? error.message : '角色授权保存失败' });
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
            placeholder="搜索角色名称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
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
              新增角色
            </ActionButton>
          ) : null}
        </div>
      </div>

      <TableContainer>
        <TableHead>
          <tr>
            <TableHeader>角色名称</TableHeader>
            <TableHeader>角色别名</TableHeader>
            <TableHeader>状态</TableHeader>
            <TableHeader className="text-right">操作</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-black text-slate-900">{record.name}</TableCell>
              <TableCell className="font-mono text-slate-500">{record.alias || '-'}</TableCell>
              <TableCell>
                <StatusBadge variant={record.status === 'active' ? 'success' : 'warning'}>
                  {record.status === 'active' ? '正常' : '停用'}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right">
                {canEdit || canDelete ? (
                  <div className="flex items-center justify-end gap-1">
                    {canEdit ? (
                      <>
                        <ActionButton variant="ghost" size="sm" icon={ShieldCheck} className="text-slate-400 hover:text-primary" onClick={() => openGrantModal(record)} />
                        <ActionButton variant="ghost" size="sm" icon={Edit2} className="text-slate-400 hover:text-primary" onClick={() => openEditModal(record)} />
                      </>
                    ) : null}
                    {canDelete ? (
                      <ActionButton variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-rose-600" onClick={() => handleRemove(record)} />
                    ) : null}
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
          {!loading && records.length === 0 ? <EmptyRow colSpan={4} message="暂无角色数据" /> : null}
          {loading ? <EmptyRow colSpan={4} message="角色列表加载中..." /> : null}
        </tbody>
      </TableContainer>

      <PaginationBar current={currentPage} pages={totalPages} total={total} onPageChange={setCurrentPage} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? '编辑角色' : '新增角色'}
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
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">角色名称</label>
            <input
              type="text"
              value={formState.roleName}
              onChange={(event) => setFormState((current) => ({ ...current, roleName: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="请输入角色名称"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">角色别名</label>
            <input
              type="text"
              value={formState.roleAlias}
              onChange={(event) => setFormState((current) => ({ ...current, roleAlias: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="请输入角色别名"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">状态</label>
            <select
              value={formState.status}
              onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as Role['status'] }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="active">正常</option>
              <option value="disabled">停用</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        title={grantingRole ? `角色授权 · ${grantingRole.name}` : '角色授权'}
        size="lg"
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setGrantModalOpen(false)}>
              取消
            </ActionButton>
            <ActionButton onClick={handleGrantSave}>保存授权</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
            当前仅接入菜单权限树；数据权限树与 API 权限树保持空集合提交。
          </div>
          <MenuTreeChecklist nodes={grantTree} checkedIds={checkedMenuIds} onToggle={toggleMenu} />
        </div>
      </Modal>
    </div>
  );
}
