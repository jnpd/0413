# Enterprise Management Logic Alignment Tasks

## Task 1. 校准 enterprise canonical 文档

- [ ] 新增企业管理逻辑修正规格目录
- [ ] 补齐 proposal / design / tasks / test-cases / acceptance / contracts / specs
- [ ] 在月度索引中挂出新 change 入口
- [ ] 明确该 change 与 `react-auth-rbac-foundation` 的 enterprise 占位口径冲突关系

## Task 2. 数据层闭环校准

- [ ] 核对 `biz_enterprise` 字段与默认值
- [ ] 核对 `biz_user_enterprise` 管理员标识与状态字段
- [ ] 核对 `blade_user.enterprise_id`、`role_id`、`status` 相关约束
- [ ] 核对企业编码生成规则 `QY + enterpriseId`
- [ ] 核对 Entity / DTO / VO / Mapper / Mapper XML 的字段闭环

## Task 3. 后端 enterprise 链路校准

- [ ] 校准 `/blade-system/enterprise/page`
- [ ] 校准 `/blade-system/enterprise/detail`
- [ ] 校准 `/blade-system/enterprise/list`
- [ ] 校准 `/blade-system/enterprise/submit`
- [ ] 校准 `/blade-system/enterprise/remove`
- [ ] 确保新增企业与创建企业管理员为同一事务
- [ ] 确保编辑时密码留空不重置
- [ ] 确保删除前执行“有效非管理员人员账号”守卫
- [ ] 确保查询与写入都做租户归属校验

## Task 4. 前端 enterprise 页逻辑校准

- [ ] 在保持现有界面结构不变的前提下接入真实 enterprise 逻辑
- [ ] 保持现有搜索区、列表列、弹窗字段顺序不变
- [ ] 若页面保留企业编码字段，则改为只读 / 回显语义
- [ ] 接入列表加载、空态、错态、成功态
- [ ] 接入新增 / 编辑 / 删除整体阻断式 loading
- [ ] 接入成功反馈、失败保留输入、错误文案透传
- [ ] 接入按钮权限码控制

## Task 5. 企业与人员 / 角色联动闭环

- [ ] 校验企业管理员创建后可在人员管理中正确回显
- [ ] 校验企业类型变更时管理员角色映射逻辑
- [ ] 校验删除守卫对人员有效状态的判定口径
- [ ] 校验企业删除后不会留下有效孤儿关联

## Task 6. 验证与回报

- [ ] 补企业管理查询 / 保存 / 删除测试
- [ ] 补越权与租户隔离测试
- [ ] 补企业编码生成与密码留空语义测试
- [ ] 回报 impact analysis
- [ ] 回报已修改链路
- [ ] 回报已检查但无需修改的关联点
- [ ] 回报剩余风险与待确认项
