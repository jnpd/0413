# Change 编写防跑偏指南

## 1. 目的

本指南用于约束 `changes/<YYYY-MM>/<feature>/proposal.md` 与 `openspec/changes/<feature>/` 的写法，避免 change 文档偏离项目真实业务口径。

incident 参考：

- [2026-04-15-system-management-change-drift.md](/E:/demo0413/docs/07-incidents/2026-04-15-system-management-change-drift.md)

## 2. 真源顺序

当多个来源存在冲突时，按下面顺序取真源：

1. 模块 PRD、数据库设计、模块测试用例、交接说明
2. 已存在的纠偏 change、contract、spec
3. 已验证的前后端实现锚点
4. 项目级规则文档
5. 未验证推断

固定判断规则：

- “暂时没定位到代码”只表示“实现锚点待校准”
- 不能因此推出“该能力不存在”
- 项目级规则负责裁决实现边界，不负责替代模块业务真相

## 3. Proposal 必写项

- 只能有一个主目标
- 本次做什么
- 本次不做什么
- 事实依据与真源锚点
- 与历史 change 的关系
- impact analysis
- 风险与未知项
- 验证项
- 回滚原则

## 4. Spec 必须闭环

只要 change 声称覆盖某个模块能力，就必须明确下面各项是否纳入：

- 查询
- 列表
- 详情
- 新增
- 编辑
- 删除
- 导出
- 授权 / 权限配置
- 权限边界
- 多租户隔离
- 错误语义
- 加载 / 提交反馈
- 跨模块联动

## 5. 基础 Change 写法

如果本次是 foundation / bootstrap / plumbing 类 change，必须显式写明。

同时必须写清：

- 它冻结了哪些基础能力
- 哪些业务真相本次不冻结
- 后续应由哪些模块文档或纠偏 change 接管

## 6. 覆盖关系规则

如果后续纠偏 change 覆盖旧 change，必须同时完成三件事：

1. 在新 proposal / design / spec 中声明覆盖关系
2. 在 `changes/<YYYY-MM>/_index.md` 标明阅读顺序
3. 在旧 spec 入口补“哪部分已不再是当前真源”的说明

## 7. 禁止写法

- “没找到实现，所以这个能力不存在”
- “先把 UI 跑起来，业务闭环后面再补”
- “授权树能读出来，就等于权限配置完成”
- “页面隐藏按钮就等于后端权限安全”
- “反正后面会有纠偏 change，旧 change 不用补说明”

## 8. 最低自动门禁

为了降低“人工没盯住时 AI 继续跑偏”的风险，写 change 后必须再过一层自动门禁。

推荐做法：

1. 先按“能力项 / PRD / 后端 / 前端 / 结论”做事实核对
2. 再运行：

```bash
python scripts/check_change_guardrails.py --feature <feature-id>
```

当前脚本至少会拦截两类高风险问题：

- 把“未定位到实现”直接写成“能力不存在 / 只能占位”
- 缺少 proposal 的关键章节，或 spec 中出现明显危险话术

它不能替代人工判断，但能挡住最容易重复出现的低级跑偏。
