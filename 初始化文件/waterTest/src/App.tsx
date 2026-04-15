import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ArchiveView } from './views/Archive';
import { BatchTestingView } from './views/BatchTesting';
import { BatchManagementView } from './views/BatchManagement';
import { WarehouseView } from './views/Warehouse';
import { LoginView } from './views/Login';
import { HistoryView } from './views/History';
import { PackagingView } from './views/Packaging';
import { AnnouncementView } from './views/Announcement';
import { PermissionsView } from './views/Permissions';
import { ViewType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, ChevronRight } from 'lucide-react';
import { ThemeSettings } from './components/ThemeSettings';

const PlaceholderView: React.FC<{ name: string }> = ({ name }) => (
  <div className="p-12 flex flex-col items-center justify-center text-gray-400 space-y-4 h-full">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
      <span className="text-4xl">🏗️</span>
    </div>
    <h3 className="text-xl font-bold text-gray-600">{name} 模块开发中</h3>
    <p className="max-w-md text-center">该功能模块正在进行工业级协议对接与界面优化，敬请期待第一阶段后续更新。</p>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('testing');
  const [testingInitialBatchNo, setTestingInitialBatchNo] = useState<string | null>(null);
  const [testingExtraBatchMeta, setTestingExtraBatchMeta] = useState<{
    batchNo: string;
    productionOrderNo: string;
    meterName: string;
    createdAt: string;
  } | null>(null);

  const handleCreateTestBatch = (meta: { batchNo: string; productionOrderNo: string; createdAt: string }) => {
    setTestingExtraBatchMeta({ ...meta, meterName: '' });
    setTestingInitialBatchNo(meta.batchNo);
    setCurrentView('testing');
  };

  const handleGoToTest = (batchNo: string) => {
    setTestingInitialBatchNo(batchNo);
    setCurrentView('testing');
  };

  const getViewMeta = (view: ViewType) => {
    switch (view) {
      case 'archive':
        return { title: '表具档案', section: '生产系统' };
      case 'warehouse':
        return { title: '仓库管理', section: '生产系统' };
      case 'batch-management':
        return { title: '批次管理', section: '生产系统' };
      case 'testing':
        return { title: '批量测试', section: '生产系统' };
      case 'history':
        return { title: '批量测试历史', section: '生产系统' };
      case 'packaging':
        return { title: '包装管理', section: '生产系统' };
      case 'announcement':
        return { title: '公告管理', section: '公告模块' };
      case 'permissions':
        return { title: '系统管理', section: '系统管理' };
      case 'enterprise':
        return { title: '账户管理', section: '系统管理' };
      case 'user-account':
        return { title: '人员管理', section: '系统管理' };
      case 'role-management':
        return { title: '角色管理', section: '系统管理' };
      default:
        return { title: '系统管理', section: '系统管理' };
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'archive': return <ArchiveView />;
      case 'testing':
        return <BatchTestingView initialBatchNo={testingInitialBatchNo} extraBatchMeta={testingExtraBatchMeta} />;
      case 'warehouse': return <WarehouseView />;
      case 'batch-management': return <BatchManagementView onCreateTestBatch={handleCreateTestBatch} onGoToTest={handleGoToTest} />;
      case 'history': return <HistoryView />;
      case 'packaging': return <PackagingView />;
      case 'announcement': return <AnnouncementView />;
      case 'permissions': return <PermissionsView />;
      case 'enterprise': return <PermissionsView initialTab="enterprise" hideTabs={true} />;
      case 'user-account': return <PermissionsView initialTab="user" hideTabs={true} />;
      case 'role-management': return <PermissionsView initialTab="role" hideTabs={true} />;
      default: return <PlaceholderView name={getViewMeta(currentView).title} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getViewMeta(currentView).title}
          section={getViewMeta(currentView).section}
        />
        
        {/* Platform Announcement Bar */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center gap-3 overflow-hidden shrink-0">
          <div className="flex items-center gap-2 text-amber-600 shrink-0 font-bold text-[10px] uppercase tracking-widest">
            <Megaphone size={14} className="animate-bounce" />
            <span>平台公告:</span>
          </div>
          <div className="flex-1 overflow-hidden relative h-5">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center gap-12">
              <span className="text-xs text-amber-800 font-bold">
                [重要] 批量测试历史快照功能已启用，请在阶段测试完成后及时执行“保存历史”。
              </span>
              <span className="text-xs text-amber-800 font-bold">
                [更新] 仓库入库字段已统一为 IMEI/MEI、型号、任务单号，表号支持后续写入。
              </span>
              <span className="text-xs text-amber-800 font-bold">
                [通知] 包装管理支持扫码装箱与自动带出档案字段，请按箱号打印标签。
              </span>
              {/* Duplicate for seamless loop */}
              <span className="text-xs text-amber-800 font-bold">
                [重要] 批量测试历史快照功能已启用，请在阶段测试完成后及时执行“保存历史”。
              </span>
              <span className="text-xs text-amber-800 font-bold">
                [更新] 仓库入库字段已统一为 IMEI/MEI、型号、任务单号，表号支持后续写入。
              </span>
              <span className="text-xs text-amber-800 font-bold">
                [通知] 包装管理支持扫码装箱与自动带出档案字段，请按箱号打印标签。
              </span>
            </div>
          </div>
          <button 
            onClick={() => setCurrentView('announcement')}
            className="shrink-0 flex items-center gap-1 text-[10px] font-black text-amber-700 hover:text-amber-900 transition-colors uppercase tracking-widest"
          >
            查看更多 <ChevronRight size={12} />
          </button>
        </div>
        
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Theme Settings Drawer */}
      <ThemeSettings />
    </div>
  );
}
