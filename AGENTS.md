# AGENTS.md

## 目标

指导 Agent 在 WaterManger 水务生产测试项目中如何读取上下文、理解规则、生成规格和执行任务。

## 工作原则

1. 先读 `README.md` 与 `REPO_WIKI.md`
2. 涉及仓库、环境、外部 PRD、代码分支时，先读 `docs/00-meta/外部依赖与交接说明.md`
2.5. 涉及业务规则、字段、状态、枚举、权限、交互时，先读 `docs/02-business-rules/业务规则选路索引.md`
3. 没有规格的需求不直接开始实现
4. 高风险改动必须说明范围、风险、测试和回滚
5. 输出优先引用已有知识，不凭空发明业务规则

## Skill Policy

- 只允许使用当前仓库内的 skills：
  - `skills/`
  - `.agents/skills/superpowers/`
  - `.agents/skills/gstack/`
  - `.agents/skills/gstack-*/`
- 禁止回退到用户目录或其他外部目录中的 skills
- 如果当前仓库内没有对应 skill，就直接依据项目文档和代码处理，不额外启用外部 skill

## 闭环修改规则

涉及业务字段、状态、枚举、流程的新增 / 修改 / 删除时，禁止只改单点，必须先做 impact analysis，再按闭环方式修改。

默认必须检查：

- 数据层：MySQL 字段、Entity、DTO、VO、Mapper、Mapper XML
- 后端链路：Controller、Service、保存、更新、详情、查询、导出
- 前端链路：新增表单、编辑回填、查询区、列表列、详情展示、字典映射、表单校验
- 一致性：默认值、空值处理、历史数据兼容、枚举展示文案

默认至少全局检查：

- 字段名
- 中文标题 / label
- 接口路径
- DTO / VO / Entity / Mapper XML 关联定义
- 前端 columns、form schema、search schema 或等价配置

即使需求只提到单点，也要主动补查：

- 新增
- 编辑
- 详情
- 列表查询
- 列表返回字段
- 导出
- 前端表单
- 前端查询区
- 表格列
- 字典或枚举映射

完成后必须回报：

1. impact analysis 涉及哪些点
2. 已修改哪些文件和链路
3. 哪些关联点已检查且确认无需修改
4. 剩余风险或待确认项

## 推荐工作流

需求 -> proposal -> spec -> design -> test-cases -> tests-first -> implementation -> verify -> knowledge write-back

## 高风险事项

- 批量测试历史闭环
- 检验台绑定关系
- 多租户隔离
- 删除守卫
- 包装与出库状态一致性
- 设备上报、回执与超时链路

## 提交前检查

- 是否有 proposal
- 是否有 spec / design
- 是否有 contracts
- 是否有 test-cases
- 是否补测试
- 是否更新知识页
- 是否说明风险与回滚方式
- 是否完成字段/状态/流程变更的闭环检查
