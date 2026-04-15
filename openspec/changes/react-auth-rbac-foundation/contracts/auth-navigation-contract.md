# Auth And Navigation Contract

## 1. 运行时配置

- `VITE_API_BASE_URL`
  - 默认：`http://localhost:8010`
- `VITE_BLADE_BASIC_AUTH`
  - 默认：`Basic c2FiZXIzOnNhYmVyM19zZWNyZXQ=`
- `VITE_BLADE_PUBLIC_KEY`
  - 默认取 `application.yml` 当前公钥
- `VITE_DEFAULT_TENANT_ID`
  - 默认：`000000`
- `VITE_BLADE_TENANT_MODE`
  - 默认：`false`
- `VITE_BLADE_CAPTCHA_MODE`
  - 默认：`false`

## 2. 登录请求

- 方法：`POST /blade-auth/oauth/token`
- 参数：
  - `grant_type=password`
  - `tenant_id=000000`
  - `username`
  - `password=04 + sm2.doEncrypt(password, publicKey, 0)`
- 请求头：
  - `Authorization: Basic c2FiZXIzOnNhYmVyM19zZWNyZXQ=`
  - `Blade-Requested-With: BladeHttpRequest`
- 登录阶段不带 `Blade-Auth`

## 3. 业务请求头

- `Authorization: Basic ...`
- `Blade-Auth: bearer <access_token>`
- `Blade-Requested-With: BladeHttpRequest`

## 4. 会话模型

前端标准化后只保留：

- `accessToken`
- `refreshToken`
- `expiresIn`
- `tokenType`
- `tenantId`
- `deptId`
- `roleId`

## 5. 启动 bootstrap 顺序

1. `GET /blade-auth/oauth/user-info`
2. `GET /blade-system/menu/top-menu`
3. `GET /blade-system/menu/routes`
4. `GET /blade-system/menu/buttons`

若 `top-menu` 返回空列表，继续尝试空 `topMenuId` 的 `routes`。

## 6. 菜单适配约束

- 后端 `MenuVO` 不直接渲染 UI
- 必须先适配为：
  - sidebar group
  - sidebar item
  - route record
  - permission metadata
- 未映射页面不得静默丢弃，必须进入 placeholder

## 7. 按钮权限约束

- `/blade-system/menu/buttons` 返回的 `code` 是前端按钮权限主来源
- 前端只做显示控制，不承担最终安全责任
- 无权限默认隐藏或禁用，项目内保持一致

## 8. 系统管理页接口映射

### 8.1 账户管理

- 当前仓库未定位到可用扩展接口
- 本次只允许占位说明，不允许伪接 mock 为“真实联调”

### 8.2 人员管理

- `GET /blade-system/user/page`
- 预期分页壳：
  - `current`
  - `size`
  - `total`
  - `records`

### 8.3 角色管理

- `GET /blade-system/role/list`
- 角色返回为树状 `RoleVO` 列表，前端不得误当传统分页表直接消费

### 8.4 角色授权

- `GET /blade-system/menu/grant-tree`
- 返回：
  - `menu`
  - `dataScope`
  - `apiScope`

## 9. 已知缺口

- enterprise 扩展接口未定位
- captcha 是否强制启用需以后端实际联调为准
- 原型业务页与后端菜单配置是否完全一致，需联调确认
