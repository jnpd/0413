# React Auth RBAC Foundation Proposal

## 1. 目标

把 `frontend/` 从本地状态驱动的原型工程，提升为可联调的 React 登录、鉴权、动态菜单、按钮权限和系统管理基础壳，并同步把系统管理页拆成语义化、可维护的模块结构。

## 2. 本次做什么

- 接入真实登录链路：
  - `POST /blade-auth/oauth/token`
  - `GET /blade-auth/oauth/user-info`
  - `GET /blade-auth/oauth/logout`
- 落地公共请求层：
  - `Authorization`
  - `Blade-Auth`
  - `Blade-Requested-With`
  - token / refresh token 持久化
  - 401 单飞刷新与失败请求重放
- 把本地 `currentView` 切页改为真实路由
- 接入动态菜单与按钮权限：
  - `GET /blade-system/menu/top-menu`
  - `GET /blade-system/menu/routes`
  - `GET /blade-system/menu/buttons`
- 重构系统管理页：
  - 账户管理先保留为占位模块并显式记录后端缺口
  - 人员管理接 `GET /blade-system/user/page`
  - 角色管理接 `GET /blade-system/role/list`
  - 角色授权接 `GET /blade-system/menu/grant-tree`
- 把系统管理页按企业 / 人员 / 角色三个语义单元拆分，移除 `Permissions.tsx` 里的核心耦合点

## 3. 本次不做什么

- 不把仓库、批次、批量测试、测试历史、包装等业务页全部重构为真实接口页
- 不落 Ant Design 后台模板迁移
- 不补当前仓库中缺失的企业管理后端实现
- 不新增菜单管理后台页

## 4. 事实依据

- 当前前端仍是原型：`frontend/src/App.tsx` 依赖 `isLoggedIn/currentView`
- 登录口径已冻结：`docs/02-rules/BladeX前端登录与仓库接口联调说明.md`
- 接口壳与请求头口径已冻结：`docs/02-rules/接口规范.md`
- 权限边界口径已冻结：`docs/02-rules/权限控制契约.md`
- 后端真实接口可从：
  - `bladex-boot/bladex-boot/src/main/java/org/springblade/modules/system/controller/MenuController.java`
  - `bladex-boot/bladex-boot/src/main/java/org/springblade/modules/system/controller/UserController.java`
  - `bladex-boot/bladex-boot/src/main/java/org/springblade/modules/system/controller/RoleController.java`
  校准

## 5. 风险

- 登录链路涉及 `SM2` 公钥加密，若前端公钥或参数口径错误会直接登录失败
- `strict-token` 与 `strict-header` 已开启，请求层不能半接入
- 后端当前未定位到企业管理扩展接口，账户管理页只能保留占位或静态说明
- 后端菜单配置若未包含原型业务页，需要以“后端菜单优先 + 本地占位注册”处理缺口

## 6. 验证

- 登录成功与失败态
- 会话刷新与失败请求重放
- 页面刷新后会话恢复
- 动态菜单与首个可访问路由跳转
- 按钮权限控制
- 人员列表与角色列表真实加载
- 构建与类型检查

## 7. 回滚

- 前端范围内回滚到本次变更前的 `frontend/` 状态
- 若联调失败，可临时仅保留新的路由结构与静态页面，但不得保留半接入的假登录逻辑
