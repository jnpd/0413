import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Megaphone } from 'lucide-react';
import { loginWithPassword, restoreSession } from './auth/authApi';
import type { AuthenticatedUser, PasswordLoginInput } from './auth/sessionTypes';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ThemeSettings } from './components/ThemeSettings';
import { PermissionProvider } from './permissions/PermissionContext';
import { fetchNavigationBootstrap } from './router/navigationApi';
import { appRouteMetaList, isKnownAppPath, resolveViewMeta } from './router/routeRegistry';
import type { NavigationBootstrapResult } from './router/navigationApi';
import type { SidebarGroup } from './router/menuTypes';
import { AnnouncementView } from './views/Announcement';
import { ArchiveView } from './views/Archive';
import { BatchManagementView } from './views/BatchManagement';
import { BatchTestingView } from './views/BatchTesting';
import { HistoryView } from './views/History';
import { LoginView } from './views/Login';
import { PackagingView } from './views/Packaging';
import { PermissionsView } from './views/Permissions';
import { WarehouseView } from './views/Warehouse';

type TestingRouteState = {
  initialBatchNo?: string | null;
  extraBatchMeta?: {
    batchNo: string;
    productionOrderNo: string;
    meterName: string;
    createdAt: string;
  } | null;
};

const PlaceholderView: React.FC<{ name: string }> = ({ name }) => (
  <div className="p-12 flex flex-col items-center justify-center text-gray-400 space-y-4 h-full">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
      <span className="text-4xl">🏗️</span>
    </div>
    <h3 className="text-xl font-bold text-gray-600">{name} 模块开发中</h3>
    <p className="max-w-md text-center">该功能模块正在进行工业级协议对接与界面优化，敬请期待第一阶段后续更新。</p>
  </div>
);

function BatchManagementRoute() {
  const navigate = useNavigate();

  return (
    <BatchManagementView
      onCreateTestBatch={(meta) =>
        navigate('/product/batchTesting/index', {
          state: {
            initialBatchNo: meta.batchNo,
            extraBatchMeta: { ...meta, meterName: '' },
          } satisfies TestingRouteState,
        })
      }
      onGoToTest={(batchNo) => navigate(`/product/batchTesting/index?batchNo=${encodeURIComponent(batchNo)}`)}
    />
  );
}

function BatchTestingRoute() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const state = (location.state as TestingRouteState | null) ?? null;

  return (
    <BatchTestingView
      initialBatchNo={state?.initialBatchNo ?? search.get('batchNo')}
      extraBatchMeta={state?.extraBatchMeta ?? null}
    />
  );
}

function resolveActiveMeta(pathname: string, sidebarGroups: SidebarGroup[]) {
  for (const group of sidebarGroups) {
    const item = group.items.find((candidate) => candidate.path === pathname);
    if (item) {
      return {
        title: item.label,
        section: group.label,
      };
    }
  }

  return resolveViewMeta(pathname);
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<'bootstrapping' | 'anonymous' | 'authenticated'>('bootstrapping');
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavigationBootstrapResult | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    restoreSession()
      .then((session) => {
        if (cancelled) {
          return;
        }

        if (session) {
          setAuthenticatedUser(session.user);
          setAuthStatus('authenticated');
          return;
        }

        setAuthStatus('anonymous');
      })
      .catch(() => {
        if (!cancelled) {
          setAuthStatus('anonymous');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (authStatus !== 'authenticated') {
      setNavigation(null);
      setNavigationLoading(false);
      setNavigationError(null);
      return;
    }

    setNavigationLoading(true);
    setNavigationError(null);

    fetchNavigationBootstrap()
      .then((result) => {
        if (!cancelled) {
          setNavigation(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNavigation(null);
          setNavigationError(error instanceof Error ? error.message : '菜单加载失败，请稍后重试');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setNavigationLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !navigation || navigationLoading) {
      return;
    }

    const pathname = location.pathname;
    const isKnownPath = isKnownAppPath(pathname) || navigation.missingPaths.includes(pathname);

    if ((pathname === '/' || pathname === '') && navigation.firstAccessiblePath) {
      navigate(navigation.firstAccessiblePath, { replace: true });
      return;
    }

    if (!isKnownPath && navigation.firstAccessiblePath) {
      navigate(navigation.firstAccessiblePath, { replace: true });
    }
  }, [authStatus, location.pathname, navigate, navigation, navigationLoading]);

  const handleLogin = async (input: PasswordLoginInput) => {
    setAuthPending(true);
    setAuthError(null);

    try {
      const session = await loginWithPassword(input);
      setAuthenticatedUser(session.user);
      setAuthStatus('authenticated');
    } catch (error) {
      setAuthStatus('anonymous');
      setAuthError(error instanceof Error ? error.message : '登录失败，请稍后重试');
      throw error;
    } finally {
      setAuthPending(false);
    }
  };

  const activeMeta = useMemo(
    () => resolveActiveMeta(location.pathname, navigation?.sidebarGroups ?? []),
    [location.pathname, navigation?.sidebarGroups],
  );

  if (authStatus === 'bootstrapping') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-slate-700 border-t-primary animate-spin" />
          <div className="space-y-1 text-center">
            <p className="text-sm font-black tracking-[0.2em] uppercase text-slate-100">正在恢复会话</p>
            <p className="text-sm text-slate-400">连接 BladeX 鉴权与用户信息</p>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return <LoginView onLogin={handleLogin} loading={authPending} error={authError} />;
  }

  if (navigationLoading || !navigation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-slate-700 border-t-primary animate-spin" />
          <div className="space-y-1 text-center">
            <p className="text-sm font-black tracking-[0.2em] uppercase text-slate-100">正在加载菜单</p>
            <p className="text-sm text-slate-400">{navigationError ?? '同步后端路由与按钮权限'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionProvider permissionCodes={navigation.permissionCodes}>
      <div className="flex h-screen bg-gray-50 font-sans text-slate-900 overflow-hidden">
        <Sidebar currentPath={location.pathname} groups={navigation.sidebarGroups} onNavigate={(path) => navigate(path)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title={activeMeta.title}
            section={activeMeta.section}
            userName={authenticatedUser?.realName || authenticatedUser?.name || authenticatedUser?.account || '当前用户'}
            userRole={authenticatedUser?.roleName || authenticatedUser?.roles[0] || 'User'}
          />

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
              onClick={() => navigate('/notice/index')}
              className="shrink-0 flex items-center gap-1 text-[10px] font-black text-amber-700 hover:text-amber-900 transition-colors uppercase tracking-widest"
            >
              查看更多 <ChevronRight size={12} />
            </button>
          </div>

          <main className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Routes>
                  <Route path="/product/archive/index" element={<ArchiveView />} />
                  <Route path="/product/warehouse/index" element={<WarehouseView />} />
                  <Route path="/product/batchManagement/index" element={<BatchManagementRoute />} />
                  <Route path="/product/batchTesting/index" element={<BatchTestingRoute />} />
                  <Route path="/product/batchTestingHistory/history" element={<HistoryView />} />
                  <Route path="/product/Packaging/index" element={<PackagingView />} />
                  <Route path="/notice/index" element={<AnnouncementView />} />
                  <Route path="/account/account-management/index" element={<PermissionsView initialTab="enterprise" hideTabs={true} />} />
                  <Route path="/account/user-account/index" element={<PermissionsView initialTab="user" hideTabs={true} />} />
                  <Route path="/account/role-management/index" element={<PermissionsView initialTab="role" hideTabs={true} />} />
                  {navigation.missingPaths.map((path) => (
                    <Route path={path} element={<PlaceholderView name={resolveActiveMeta(path, navigation.sidebarGroups).title} />} />
                  ))}
                  <Route
                    path="*"
                    element={
                      navigation.firstAccessiblePath ? (
                        <Navigate replace to={navigation.firstAccessiblePath} />
                      ) : (
                        <PlaceholderView name="功能占位" />
                      )
                    }
                  />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <ThemeSettings />
      </div>
    </PermissionProvider>
  );
}
