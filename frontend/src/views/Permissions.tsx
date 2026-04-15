import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, Users } from 'lucide-react';
import { EnterpriseManagementTab } from '../features/system/enterprise/EnterpriseManagementTab';
import { RoleManagementTab } from '../features/system/role/RoleManagementTab';
import { UserManagementTab } from '../features/system/user/UserManagementTab';

interface PermissionsViewProps {
  initialTab?: 'enterprise' | 'user' | 'role';
  hideTabs?: boolean;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({ initialTab = 'enterprise', hideTabs = false }) => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'user' | 'role'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-4 bg-slate-50/50 p-4 min-h-full">
      {!hideTabs ? (
        <div className="w-fit rounded-xl border border-slate-200 bg-slate-100 p-1">
          {[
            { id: 'enterprise', label: '账户管理', icon: Building2 },
            { id: 'user', label: '人员管理', icon: Users },
            { id: 'role', label: '角色管理', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'enterprise' | 'user' | 'role')}
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-black transition-all ${
                activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === 'enterprise' ? <EnterpriseManagementTab /> : null}
      {activeTab === 'user' ? <UserManagementTab /> : null}
      {activeTab === 'role' ? <RoleManagementTab /> : null}
    </div>
  );
};
