import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Trash2,
  Globe
} from 'lucide-react';
import { Enterprise, UserAccount, Role } from '../types';
import { 
  SearchInput, 
  TableContainer, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableCell, 
  StatusBadge, 
  ActionButton,
  Modal
} from '../components/UIComponents';
import { ENTERPRISE_OPTIONS, ENTERPRISE_TYPE_LABEL } from '../data/enterpriseOptions';

const mockEnterprises: Enterprise[] = ENTERPRISE_OPTIONS;

const mockUsers: UserAccount[] = [
  { id: '1', username: 'admin_zhsw', realName: '张三', role: '企业管理员', enterpriseId: '1', status: 'active', lastLogin: '2024-03-17 10:00' },
  { id: '2', username: 'op_zhsw_01', realName: '李四', role: '生产操作员', enterpriseId: '1', status: 'active', lastLogin: '2024-03-17 09:30' },
];

const mockRoles: Role[] = [
  { id: '1', name: '企业管理员', description: '拥有企业内所有数据管理权限', permissions: ['all'] },
  { id: '2', name: '生产操作员', description: '仅可进行生产测试与包装作业', permissions: ['testing', 'packaging'] },
];

interface PermissionsViewProps {
  initialTab?: 'enterprise' | 'user' | 'role';
  hideTabs?: boolean;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({ initialTab = 'enterprise', hideTabs = false }) => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'user' | 'role'>(initialTab);
  
  // Use useEffect to update activeTab when initialTab changes from parent
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const tabMeta = {
    enterprise: { label: '账户管理', itemLabel: '账户' },
    user: { label: '人员管理', itemLabel: '人员' },
    role: { label: '角色管理', itemLabel: '角色' },
  } as const;

  const getModalTitle = () => {
    const action = editingItem ? '编辑' : '新增';
    const type = tabMeta[activeTab].itemLabel;
    return `${action}${type}`;
  };

  return (
    <div className="p-4 space-y-4 bg-slate-50/50 min-h-full">
      {/* Tabs */}
      {!hideTabs && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
          {[
            { id: 'enterprise', label: '账户管理', icon: Building2 },
            { id: 'user', label: '人员管理', icon: Users },
            { id: 'role', label: '角色管理', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <SearchInput 
          placeholder={`搜索${tabMeta[activeTab].itemLabel}...`} 
        />
        <ActionButton icon={Plus} onClick={handleAdd}>
          新增{tabMeta[activeTab].itemLabel}
        </ActionButton>
      </div>

      {/* Content */}
      <TableContainer>
        {activeTab === 'enterprise' && (
          <>
            <TableHead>
              <tr>
                <TableHeader>企业名称</TableHeader>
                <TableHeader>企业编码</TableHeader>
                <TableHeader>企业类型</TableHeader>
                <TableHeader>管理员姓名</TableHeader>
                <TableHeader>登录账号</TableHeader>
                <TableHeader>初始密码</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader className="text-right">操作</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {mockEnterprises.map(ent => (
                <TableRow key={ent.id}>
                  <TableCell className="font-black text-slate-900">{ent.name}</TableCell>
                  <TableCell className="font-mono text-slate-500 font-bold">{ent.code}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{ENTERPRISE_TYPE_LABEL[ent.type]}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{ent.adminName}</TableCell>
                  <TableCell className="font-mono text-slate-700 font-medium">{ent.adminUsername ?? '—'}</TableCell>
                  <TableCell className="font-mono text-slate-500">{ent.adminPassword ?? '—'}</TableCell>
                  <TableCell className="text-slate-500 font-medium">{ent.createdAt}</TableCell>
                  <TableCell>
                    <StatusBadge variant="success">正常</StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(ent)} className="text-slate-400 hover:text-primary" />
                      <ActionButton variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-rose-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </>
        )}

        {activeTab === 'user' && (
          <>
            <TableHead>
              <tr>
                <TableHeader>登录账号</TableHeader>
                <TableHeader>人员姓名</TableHeader>
                <TableHeader>所属企业</TableHeader>
                <TableHeader>所属角色</TableHeader>
                <TableHeader>最后登录</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader className="text-right">操作</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {mockUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-black text-slate-900">{user.username}</TableCell>
                  <TableCell className="text-slate-600 font-bold">{user.realName}</TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {mockEnterprises.find(e => e.id === user.enterpriseId)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant="info">{user.role}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium">{user.lastLogin}</TableCell>
                  <TableCell>
                    <StatusBadge variant="success">正常</StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(user)} className="text-slate-400 hover:text-primary" />
                      <ActionButton variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-rose-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </>
        )}

        {activeTab === 'role' && (
          <>
            <TableHead>
              <tr>
                <TableHeader>权限角色</TableHeader>
                <TableHeader>说明</TableHeader>
                <TableHeader>功能权限</TableHeader>
                <TableHeader className="text-right">操作</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {mockRoles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-black text-slate-900">{role.name}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(p => (
                        <StatusBadge key={p}>{p}</StatusBadge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(role)} className="text-slate-400 hover:text-primary" />
                      <ActionButton variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-rose-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </>
        )}
      </TableContainer>


      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setIsModalOpen(false)}>取消</ActionButton>
            <ActionButton onClick={() => setIsModalOpen(false)}>确定保存</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          {activeTab === 'enterprise' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">企业名称</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.name}
                  placeholder="请输入企业名称"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">企业编码</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem?.code}
                    placeholder="请输入企业编码"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">企业类型</label>
                  <select
                    defaultValue={editingItem?.type ?? 'water-company'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  >
                    {Object.entries(ENTERPRISE_TYPE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">管理员姓名</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem?.adminName}
                    placeholder="请输入管理员姓名"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">账号</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem?.adminUsername}
                    placeholder="请输入企业管理员登录账号"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">密码</label>
                <input 
                  type="password" 
                  defaultValue=""
                  placeholder={editingItem ? '不修改请留空' : '请输入初始密码'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
            </>
          )}

          {activeTab === 'user' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">人员名称</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem?.username}
                    placeholder="请输入人员名称"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">真实姓名</label>
                  <input 
                    type="text" 
                    defaultValue={editingItem?.realName}
                    placeholder="请输入真实姓名"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">所属企业</label>
                  <select 
                    defaultValue={editingItem?.enterpriseId}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  >
                    <option value="">请选择所属企业</option>
                    {mockEnterprises.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">所属角色</label>
                  <select 
                    defaultValue={editingItem?.role}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  >
                    {mockRoles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'role' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">角色名称</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.name}
                  placeholder="请输入角色名称"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">角色描述</label>
                <textarea 
                  rows={3}
                  defaultValue={editingItem?.description}
                  placeholder="请输入角色描述..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
