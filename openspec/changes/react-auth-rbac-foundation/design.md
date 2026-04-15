# React Auth RBAC Foundation Design

## 1. 背景

当前 `frontend/` 已有较完整的 UI 原型，但关键基础能力缺失：

- 登录仍是 `setTimeout` 假链路
- 页面跳转依赖 `currentView`
- 菜单与按钮权限未接后端
- `Permissions.tsx` 把 tabs、mock 数据、表格、表单、权限与弹窗揉在一个文件里

继续在这套结构上迭代业务页，会导致登录、路由、权限、请求层和页面模块反复返工。

## 2. 设计目标

- 建立真实登录、退出、会话恢复、刷新重放的闭环
- 让 URL 成为页面导航唯一真源
- 让后端菜单与按钮权限成为系统壳的主控制源
- 让系统管理页按语义边界拆分，而不是继续膨胀单文件

## 3. 非目标

- 不在本次 change 内完成全部业务页联调
- 不整体替换当前 Tailwind 视觉实现
- 不发明不存在的企业管理后端接口

## 4. 架构设计

### 4.1 应用装配层

- `main.tsx` 只做应用挂载
- `App.tsx` 退化为 Provider 与 Router 装配层
- `layouts/` 负责主框架语义组件：`AppShell`、`AppHeader`、`AppSidebar`
- `router/` 负责静态路由、受保护路由、动态菜单路由装配

### 4.2 会话与鉴权

- `auth/` 管理：
  - token / refresh token
  - 当前用户
  - 顶部菜单
  - 路由树
  - 按钮权限
- 启动 bootstrap 顺序：
  1. 读取本地 token
  2. 拉取用户信息
  3. 拉取顶部菜单
  4. 拉取路由树
  5. 拉取按钮权限
- 登录时密码使用 `04 + sm2.doEncrypt(password, publicKey, 0)`

### 4.3 HTTP 层

- `lib/http/` 暴露统一客户端
- 客户端负责：
  - 固定补 `Authorization`
  - 已登录时补 `Blade-Auth`
  - 固定补 `Blade-Requested-With`
  - 解析 BladeX `R` 响应
  - 401 时走单飞 refresh，再重放失败请求
- 业务 API wrapper 不重复处理请求头和通用错误壳

### 4.4 菜单和路由适配

- 后端菜单不直接渲染 UI
- `menu adapter` 把 `MenuVO` 转成：
  - sidebar group/item
  - route record
  - permission metadata
- 若后端菜单项暂无对应 React 页面：
  - 进入明确占位页
  - 在变更文档里记录缺口

### 4.5 权限模型

- 页面权限：由菜单树和受保护路由决定
- 按钮权限：由 `/blade-system/menu/buttons` 返回的 `code` 集合决定
- 前端权限只做体验优化，最终以后端返回为准
- 提供通用 helper：
  - `hasPermission(code)`
  - `hasAnyPermission(codes)`
  - `PermissionGuard`

### 4.6 系统管理页拆分

`Permissions.tsx` 拆为三个领域模块：

- `features/system/enterprise/`
  - 只承接账户管理占位、字段说明、后端缺口说明
- `features/system/user/`
  - 用户列表容器
  - 查询条件
  - 表格
  - mapper
  - API wrapper
- `features/system/role/`
  - 角色列表容器
  - 表格
  - 授权树弹窗
  - mapper
  - API wrapper

页面层只做编排，不直接持有 mock 数据、表格列和权限判断。

## 5. 数据流

### 5.1 登录流

1. 登录页采集账号密码
2. 前端按约定做 SM2 加密
3. 调用 `oauth/token`
4. 保存 `access_token` / `refresh_token`
5. 触发 bootstrap
6. 拉取用户、菜单、按钮权限
7. 跳转到首个可访问路由

### 5.2 页面刷新恢复

1. 读取本地 token
2. 成功则恢复会话并拉取基础数据
3. 失败则清空会话并回到登录页

### 5.3 系统管理页

1. 容器组件读取查询条件
2. 调 API wrapper
3. mapper 统一后端字段到 UI model
4. 表格和按钮只消费标准化模型与 permission helper

## 6. 错误处理

- 登录失败优先透传后端业务文案
- 401 刷新失败后强制退出并返回登录页
- 页面必须显式区分：
  - `loading`
  - `empty`
  - `error`
  - `forbidden`
- 无按钮权限默认隐藏，必要时可禁用并提示

## 7. 已知缺口

- 当前仓库未定位到企业管理扩展接口，因此账户管理页本次只能占位
- 当前登录链路是否强制启用 captcha，以后端实际联调为准
- 后端菜单是否已覆盖所有原型业务页，若未覆盖则保留本地占位路由并记录缺口

## 8. 验证策略

- adapter 级测试：
  - session payload 解析
  - 菜单树适配
  - 权限集合提取
  - 首个可访问路由决策
- 集成验证：
  - 登录
  - 启动恢复
  - 动态菜单
  - 用户与角色列表加载
