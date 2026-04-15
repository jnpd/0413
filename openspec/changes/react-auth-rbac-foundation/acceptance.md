# React Auth RBAC Foundation Acceptance

## 1. 基础能力验收

- 登录不再使用 `setTimeout` 假链路
- 页面导航不再依赖 `currentView`
- 应用刷新后可恢复已登录会话
- 401 处理具备刷新重放能力
- 侧栏菜单来自后端而不是本地写死配置
- 按钮显示/禁用由权限 helper 驱动

## 2. 系统管理验收

- `Permissions.tsx` 不再承载全部系统管理逻辑
- 人员管理读取真实后端列表
- 角色管理读取真实后端列表
- 角色授权读取真实授权树
- 账户管理若无后端接口，则以占位页明确说明缺口

## 3. 文档验收

- 本 change 在 `changes/2026-04/` 有可查入口
- `openspec/changes/react-auth-rbac-foundation/` 文档完整
- 不再把 canonical 文档放到 `docs/superpowers/`

## 4. 风险验收

- 登录请求头符合项目约定
- SM2 公钥来源明确且可配置
- 已知后端缺口被明确记录
- 没有把页面权限和按钮权限混成一层
