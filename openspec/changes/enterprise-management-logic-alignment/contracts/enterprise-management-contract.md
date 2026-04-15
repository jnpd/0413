# Enterprise Management Contract

## 1. 目的

冻结企业管理模块的接口语义、字段语义和联动约束，避免前后端把 enterprise 模块继续实现成“页面像企业管理，逻辑却只是本地占位”。

## 2. 适用范围

- 企业管理列表
- 企业新增 / 编辑
- 企业删除
- 企业管理员联动
- 与企业相关的权限、租户隔离和错误语义

## 3. 接口范围

| 方法 | 路径 | 语义 |
|---|---|---|
| GET | `/blade-system/enterprise/page` | 企业分页查询 |
| GET | `/blade-system/enterprise/detail` | 企业详情 |
| GET | `/blade-system/enterprise/list` | 企业下拉或轻量列表 |
| POST | `/blade-system/enterprise/submit` | 新增 / 编辑企业 |
| POST | `/blade-system/enterprise/remove` | 删除企业 |

## 4. 查询语义

### 4.1 分页查询

分页查询至少要支持以下查询维度：

- 关键字：
  - 企业名称
  - 管理员姓名
  - 登录账号
- 企业类型
- 状态
- 分页参数

### 4.2 列表展示语义

前端企业列表至少需要以下业务字段语义：

- 企业名称
- 企业类型
- 管理员姓名
- 登录账号
- 初始密码掩码
- 创建时间
- 状态

企业编码如在列表中回显，属于展示字段，不代表其成为用户可编辑字段。

## 5. 保存语义

### 5.1 新增

新增企业时，提交至少承载以下业务语义：

- 企业名称
- 企业类型
- 管理员姓名
- 登录账号
- 初始密码

新增成功后，后端必须保证：

- 创建企业主记录
- 创建企业管理员账号
- 建立用户与企业关系
- 同步维护管理员标识
- 生成企业编码

上述动作必须具备同一事务语义，不能出现半成功结果。

### 5.2 编辑

编辑企业时：

- 允许修改企业基础信息和管理员基础信息
- 密码留空表示不重置
- 仅当明确输入新密码时才执行密码重置
- 企业编码不允许人工修改

## 6. 删除语义

删除企业前，后端必须同时校验：

- 当前用户是否具备删除权限
- 目标企业是否属于当前可操作租户范围
- 目标企业下是否仍存在有效的非管理员人员账号

如果存在有效的非管理员人员账号，删除必须失败，并返回明确业务提示。

成功删除后，不得留下仍指向已删除企业的有效管理员或用户企业关系。

## 7. 字段与数据模型约束

本 contract 依赖以下已知数据模型事实：

- `biz_enterprise.enterprise_id`
- `biz_enterprise.tenant_id`
- `biz_enterprise.enterprise_name`
- `biz_enterprise.enterprise_code`
- `biz_enterprise.enterprise_type`
- `biz_enterprise.admin_user_id`
- `biz_enterprise.status`
- `biz_user_enterprise.user_id`
- `biz_user_enterprise.enterprise_id`
- `biz_user_enterprise.is_admin`
- `blade_user.id`
- `blade_user.account`
- `blade_user.real_name`
- `blade_user.enterprise_id`
- `blade_user.role_id`
- `blade_user.status`

## 8. 权限与租户隔离

### 8.1 按钮权限码

- `enterprise_add` / `tenant_add`
- `enterprise_edit` / `tenant_edit`
- `enterprise_delete` / `tenant_delete`

### 8.2 固定规则

- 新增 / 删除仅平台超管可见
- 前端权限控制不替代后端鉴权
- 查询、保存、删除一律以后端租户上下文为准
- 越权错误必须返回稳定且可读的拒绝语义

## 9. 交互约束

- 写操作必须展示整体阻断式 loading
- 成功后关闭弹窗并刷新列表
- 失败后保留用户输入
- 错误提示优先透传后端业务文案

## 10. 已知待确认项

- 当前仓库未直接定位到 enterprise 后端实现代码，因此参数命名和返回 VO 细节需在实现阶段再次与 Java 代码校准。
- 企业类型的底层字典编码与管理员角色 ID 映射需结合实际字典 / 角色数据落地确认。
