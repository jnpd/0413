---
name: iot-platform-delivery-workflow
description: 轨物 / IoT 平台项目端到端交付总控 skill。凡是用户在带有 `AGENTS.md` / `REPO_WIKI.md` / `docs/` / `specs/` 结构的项目里，询问“从需求到上线怎么做”“全流程怎么落地”“需求、实现、验证、发布怎么串起来”“一个功能怎样从 spec 走到 release”“新项目如何建立 spec-first + Claude Code 执行闭环”时，必须优先使用本 skill。它负责识别当前处于规格、实现、验证发布、还是知识回灌阶段，并把任务路由到 `iot-platform-spec` 或 `superpowers-gstack-workflow`。不要用它替代纯 spec 写作或纯插件/QA/发布问题的专用 skill；当任务明显只属于单一阶段时，应转向对应原子 skill。
---

# IoT Platform Delivery Workflow

这是一个**总控 / 编排型** skill，用来把两个原子 skill 串成一条完整交付链路：

- `iot-platform-spec`：负责知识库、规格、设计、任务、测试、验收、契约、知识回灌
- `superpowers-gstack-workflow`：负责 Claude Code 实现、TDD、调试、验证、独立 reviewer、浏览器/QA、发布与上线后观察

本 skill 不替代这两个 skill，而是回答一个更大的问题：

> 当前这个需求处于哪一阶段？下一步该走哪个 skill？阶段之间如何交接，才能既不跳过 spec，也不遗漏验证和发布证据？

## 核心原则

1. **一个入口，两个原子 skill**
   当用户问题覆盖多个阶段时，先用本 skill 判断阶段，再调用对应原子 skill。
2. **knowledge before code**
   规格、规则、契约、测试边界未冻结前，不直接进入高风险实现。
3. **evidence before done**
   没有测试、截图、QA 报告、独立 reviewer 等证据，不宣称完成。
4. **回灌闭环**
   发布后若规则、接口、测试场景、事故经验有变化，必须写回知识库。

## 四阶段模型

### Phase A：需求与规格冻结

适用信号：

- “新需求怎么开始”
- “spec 怎么写”
- “规则怎么冻结”
- “接口契约怎么定”
- “验收标准怎么写”

默认动作：

- 读取 `AGENTS.md`、`REPO_WIKI.md`、相关 `docs/`
- 转向 `iot-platform-spec`
- 输出 `proposal.md` / `spec.md` / `design.md` / `tasks.md` / `test-cases.md` / `acceptance.md` / `api-contract.md`

### Phase B：实现与验证

适用信号：

- “开始实现”
- “TDD 怎么走”
- “bug 怎么系统化排查”
- “完成前怎么验证”
- “code review 怎么做”

默认动作：

- 转向 `superpowers-gstack-workflow`
- 按 `superpowers` 负责计划执行、TDD、调试、verification、独立 reviewer
- 对前端或真实环境验证，引导到 `gstack` 浏览器/QA 路径

### Phase C：发布与上线观察

适用信号：

- “怎么发版 / ship / deploy”
- “怎么合线”
- “上线后怎么看 canary”
- “如何保留发布证据”

默认动作：

- 转向 `superpowers-gstack-workflow`
- 走 `gstack` 的发布、部署、上线后观察能力
- 确认 release/rollback 约束与证据链

### Phase D：知识回灌

适用信号：

- “实现完后怎么更新知识库”
- “接口和实际不一致，怎么回写”
- “这次缺陷如何沉淀”

默认动作：

- 回到 `iot-platform-spec`
- 更新相关 `docs/`、测试场景库、缺陷索引、接口规范、业务规则说明

## 路由规则

### 只涉及单一阶段

- 纯规格/契约/验收/知识文档：直接优先 `iot-platform-spec`
- 纯插件分工/实现/TDD/验证/QA/发布：直接优先 `superpowers-gstack-workflow`

### 同时涉及多个阶段

按固定顺序拆解：

1. 先判断 **规则与边界是否冻结**
2. 未冻结：先走 `iot-platform-spec`
3. 已冻结：进入 `superpowers-gstack-workflow`
4. 发布后：回到 `iot-platform-spec` 做知识回灌

不要把多阶段问题一次性糊成一句“直接做完”，要把阶段切开并显式说明当前所处阶段。

## 典型端到端顺序

```text
需求理解
→ proposal
→ spec
→ design
→ tasks
→ test-cases
→ acceptance / api-contract
→ implementation
→ verification / review / release
→ knowledge write-back
```

其中：

- 前半段主要由 `iot-platform-spec` 约束
- 中后段主要由 `superpowers-gstack-workflow` 约束
- 本 skill 负责盯住整体节奏与交接点

## 交接检查点

在阶段切换时，至少确认以下问题：

### A → B（规格进入实现）

- 业务规则是否已有来源或已签字冻结？
- `spec.md` / `tasks.md` / `test-cases.md` / `api-contract.md` 是否已经可执行？
- 高风险区域是否查阅过对应知识文档？

### B → C（实现进入发布）

- 是否完成 verification？
- 是否已有独立 reviewer？
- 是否有真实环境证据（测试、截图、QA 报告）？

### C → D（发布进入回灌）

- 实际行为是否与原 spec 一致？
- 是否有新增规则、测试场景或事故经验需要沉淀？

## 高风险区域处理

若任务触及以下任一项，不允许跳过 Phase A：

- 协议解析
- 告警逻辑
- 多租户隔离
- 权限边界
- 远程控制

这些区域必须先冻结规则，再进入实现，并在完成后保留验证证据。

## 反模式

避免以下行为：

- 还没冻结规则就直接写高风险代码
- 把浏览器验证、QA、发布步骤写进 spec 本体，导致文档与执行职责混乱
- 只有实现，没有知识回灌
- 用总控 skill 取代原子 skill，导致说明空泛、阶段不清

## 对用户的输出方式

当本 skill 被触发时，优先给出：

1. 当前任务所处阶段
2. 下一步应走哪个原子 skill
3. 若跨阶段，列出明确顺序
4. 当前缺失的冻结项或验证项

不要一上来铺满所有细节；先路由，再展开该阶段的具体方法。
