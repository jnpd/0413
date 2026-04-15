# React Auth RBAC Foundation Tasks

## Task 1. 冻结文档与索引

- [ ] 在 `changes/2026-04/` 建立月份索引
- [ ] 在 `openspec/changes/react-auth-rbac-foundation/` 补齐 design / tasks / test-cases / acceptance / contracts / specs
- [ ] 确保 proposal 只保留在 `changes/2026-04/react-auth-rbac-foundation/proposal.md`
- [ ] 清理误放到 agent 工作目录的 canonical 文档

## Task 2. 建立 auth / request 基座

- [ ] 定义运行时配置：后端地址、Basic Auth、公钥、默认租户
- [ ] 定义 session types 和本地存储结构
- [ ] 定义 token payload / user info payload 标准化 adapter
- [ ] 建立统一 HTTP client
- [ ] 接入登录、刷新、用户信息、退出 API
- [ ] 处理 401 单飞刷新与失败请求重放

## Task 3. 建立 router / menu / permission 基座

- [ ] 用 `react-router-dom` 替代 `currentView`
- [ ] 建立 route registry
- [ ] 建立 backend menu -> sidebar / route adapter
- [ ] 建立 button permission helper
- [ ] 建立 protected route 与 forbidden / placeholder 页面
- [ ] 处理 `top-menu` 为空时的 fallback

## Task 4. 拆分系统管理页

- [ ] 拆出企业管理占位模块
- [ ] 拆出人员管理模块
- [ ] 拆出角色管理模块
- [ ] 接入 `GET /blade-system/user/page`
- [ ] 接入 `GET /blade-system/role/list`
- [ ] 接入 `GET /blade-system/menu/grant-tree`
- [ ] 删除 `Permissions.tsx` 中的 `mockUsers`
- [ ] 删除 `Permissions.tsx` 中的 `mockRoles`

## Task 5. 验证

- [ ] 跑 adapter 测试
- [ ] 跑类型检查
- [ ] 跑生产构建
- [ ] 手工联调登录成功 / 失败态
- [ ] 手工验证会话恢复、动态菜单、权限按钮、用户与角色页面

## Task 6. 回写

- [ ] 回报 impact analysis
- [ ] 回报已修改文件与链路
- [ ] 回报已检查但无需修改的关联点
- [ ] 回报剩余风险与待确认项
