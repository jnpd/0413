# 系统管理模块 PRD

> 本文档按当前代码校准，覆盖登录、系统框架、公告、企业、人员、角色六部分；不再沿用早期“系统规划稿”中的泛化描述。

## 1. 模块范围

当前系统管理模块的真实前端落点如下：

- 登录页：`frontEnd/src/views/Login.tsx`
- 公共框架：`frontEnd/src/components/AppLayout.tsx`、`Header.tsx`、`Sidebar.tsx`
- 公告管理：`frontEnd/src/views/notice/index.tsx`
- 企业管理：`frontEnd/src/views/account/account-management/index.tsx`
- 人员管理：`frontEnd/src/views/account/user-account/index.tsx`
- 角色管理：`frontEnd/src/views/account/role-management/index.tsx`

当前模块不包含的内容：

- 前端没有独立“菜单管理页面”
- 前端没有独立“租户管理页面”
- 前端没有公告已读管理页面

## 1.1 提交交互约束

系统管理内所有写操作，例如发布公告、保存企业、保存人员、保存角色、授权和删除，提交中都必须显示整体界面阻断式 loading。

该 loading 需要同时覆盖当前页面与当前弹窗上下文；按钮级 loading、禁用态和局部提示只能作为补充，不能替代整体阻断。

## 2. 登录与公共框架

### 2.1 登录页

当前登录页使用 Saber/BladeX 鉴权链路：

- 获取验证码：`GET /blade-auth/oauth/captcha`
- 账号密码登录：`POST /blade-auth/oauth/token`
- 获取当前用户：`GET /blade-auth/oauth/user-info`

当前页面行为：

- 输入账号、密码
- 若 `captchaMode` 开启，则额外要求验证码
- 若 `tenantMode` 开启，则会尝试用当前域名调用 `/blade-system/tenant/info` 自动识别租户
- 登录成功后进入默认首页

### 2.2 公共框架页

登录后公共框架包含：

- 左侧动态菜单
- 顶部页头
- 顶部模块切换
- 顶部滚动公告条
- 路由内容区域

当前真实行为：

- 左侧菜单来自 `/blade-system/menu/routes`
- 顶部模块切换来自 `/blade-system/menu/top-menu`
- 按钮权限来自 `/blade-system/menu/buttons`
- 顶部滚动公告来自 `/blade-desk/notice/scroll`
- 点击滚动公告可打开详情弹窗
- 支持按页面路径和表格类型持久化用户级表格列顺序：`GET /blade-system/table-column-setting/detail`、`POST /blade-system/table-column-setting/submit`

当前仅为 UI 占位、未真正接线的内容：

- 页头全局搜索输入框
- 页头铃铛角标数字
- 页头“设置”按钮
- `ThemeSettings` 组件存在，但当前没有可见触发入口

## 3. 公告管理

### 3.1 页面能力

当前公告管理页支持：

- 按公告标题或正文摘要搜索
- 分页列表
- 新增公告
- 编辑公告
- 删除公告
- 搜索词、分页大小或刷新条件变化时回到第一页，并收敛重复列表请求

列表字段：

- 公告标题
- 内容摘要
- 类型
- 优先级
- 发布日期
- 操作

### 3.2 表单字段

当前新增/编辑弹窗只有两个可编辑字段：

- 公告标题
- 公告内容（富文本）

当前页面没有暴露的字段：

- 公告类型
- 公告优先级
- 发布范围
- 过期时间

### 3.3 当前代码口径

后端 `NoticeServiceImpl` 的真实行为是：

- `category` 固定写默认公告分类
- `priority` 固定写默认优先级（普通）
- `summary` 由正文自动截取生成

因此页面里显示的“类型/优先级”目前不是用户可编辑业务字段，而是后端默认值和扩展表计算结果。

## 4. 企业管理

### 4.1 页面能力

当前企业管理页实际上是“企业 + 企业管理员”一体化管理页。

支持：

- 关键字搜索：企业名称 / 管理员 / 登录账号
- 企业类型筛选
- 状态筛选
- 分页列表
- 新增企业
- 编辑企业
- 删除企业

列表字段：

- 企业名称
- 企业类型
- 管理员姓名
- 登录账号
- 初始密码掩码
- 创建时间
- 状态

### 4.2 表单字段

新增/编辑企业时，当前页面字段为：

- 企业名称
- 企业类型
- 管理员姓名
- 登录账号
- 初始密码 / 重置密码

页面未暴露企业编码手工编辑；企业编码由后端生成。

### 4.3 权限与约束

当前页面权限点：

- `enterprise_add` / `tenant_add`
- `enterprise_edit` / `tenant_edit`
- `enterprise_delete` / `tenant_delete`

当前代码约束：

- 新增企业时，后端同步创建企业管理员账号
- 删除企业时，如果该企业下仍存在有效的非管理员人员账号，后端会阻止删除
- 新增/删除按钮仅平台超管可见

## 5. 人员管理

### 5.1 页面能力

当前人员管理页支持：

- 关键字搜索
- 分页列表
- 新增人员
- 编辑人员
- 删除人员
- 单用户角色配置

列表字段：

- 登录账号
- 人员姓名
- 所属企业
- 所属角色
- 最后同步时间
- 状态

### 5.2 表单字段

当前新增/编辑人员弹窗字段：

- 登录账号
- 人员姓名
- 所属企业
- 人员类型：普通人员 / 企业管理员
- 所属角色
- 初始密码 / 重置密码
- 状态（仅编辑时显示）

### 5.3 当前代码规则

- 非平台超管用户新增/编辑人员时，所属企业被锁定为当前登录人所属企业
- “主管理员”不能在该页面编辑或删除
- 企业管理员角色不是任意下拉选择，而是按企业类型自动解析：
  - 企业类型 1：水务公司管理员
  - 企业类型 2：水厂管理员
- 普通人员角色列表只展示企业自定义角色
- 角色配置弹窗当前只允许保存单个角色 ID

## 6. 角色管理

### 6.1 页面能力

当前角色管理页支持：

- 按角色名称 / 别名搜索
- 分页列表
- 新增角色
- 编辑角色
- 删除角色
- 角色菜单权限配置

列表字段：

- 角色名称
- 角色别名
- 备注

### 6.2 表单字段

当前角色新增/编辑字段：

- 角色名称
- 角色别名
- 备注

### 6.3 权限配置能力

当前“角色权限配置”弹窗只接了菜单权限树：

- 读取权限树：`GET /blade-system/menu/grant-tree`
- 读取角色已授权菜单：`GET /blade-system/menu/role-tree-keys`
- 保存授权：`POST /blade-system/role/grant`

虽然保存接口带 `dataScopeIds`、`apiScopeIds`，但当前前端页面没有暴露数据权限树和 API 权限树，只提交菜单权限。

### 6.4 当前代码规则

- 平台超管可管理全部角色
- 非平台超管只允许管理企业自定义角色
- 角色列表数据来自 `/blade-system/role/page`
- 后端分页接口默认只返回启用状态角色，并支持 `keyword / status / enterpriseId` 查询
- 前端直接消费后端分页结果，不再把 `/blade-system/role/list` 的树状结果拍平成分页数据

## 7. 主要接口

| 子模块 | 当前前端实际调用接口 |
| --- | --- |
| 登录 | `/blade-auth/oauth/captcha`、`/blade-auth/oauth/token`、`/blade-auth/oauth/user-info`、`/blade-auth/oauth/logout` |
| 动态菜单 | `/blade-system/menu/top-menu`、`/blade-system/menu/routes`、`/blade-system/menu/buttons` |
| 企业管理 | `/blade-system/enterprise/page`、`/detail`、`/list`、`/submit`、`/remove` |
| 人员管理 | `/blade-system/user/page`、`/submit`、`/remove`、`/grant` |
| 角色管理 | `/blade-system/role/page`、`/tree`、`/submit`、`/remove`、`/grant` |
| 公告管理 | `/blade-desk/notice/page`、`/detail`、`/submit`、`/remove`、`/scroll` |
| 表格列配置 | `/blade-system/table-column-setting/detail`、`/submit` |

## 8. 当前未接入或仅后端预留的能力

- `MenuController` 提供菜单 CRUD 能力，但当前前端没有菜单管理页
- 角色授权接口支持数据权限和 API 权限，但前端只接了菜单权限
- 公告已读表 `biz_notice_read` 已有升级 SQL，但当前业务未接
- 顶部搜索、消息铃铛、设置按钮当前仍是 UI 占位

## 9. 表格列配置

### 9.1 能力边界

当前系统已支持按登录用户持久化业务表格的列顺序与显隐结果，用于拖拽列头后的状态回显。

隔离维度：

- 当前租户
- 当前登录用户
- `pathname`
- `type`

### 9.2 接口口径

- 查询：`GET /blade-system/table-column-setting/detail?pathname=...&type=...`
- 保存：`POST /blade-system/table-column-setting/submit`

请求体只允许前端传：

- `pathname`
- `type`
- `orderedIds`

当前登录租户、用户、部门、角色上下文都必须由登录态与请求头提供，前端公共请求层会自动补齐 `Tenant-Id`、`Dept-Id`、`Role-Id`。
