---
name: superpowers-gstack-workflow
description: Claude Code 双插件工程工作流（superpowers=大脑，gstack=手脚）。当用户在轨物及 IoT/工业物联网项目中讨论 Claude Code 插件选型、superpowers 与 gstack 分工、skill 抢匹配、实现阶段的 TDD/调试/验证/独立 reviewer、真实浏览器验证、/browse /qa /ship /canary、发布与上线后观察、或要把“想清楚”与“真动手”拆开时，必须使用本 skill。优先用于 spec 已存在后的实现与执行闭环，或为项目建立 harness 约定；不要把它当作编写 `spec.md`、`design.md`、`tasks.md`、`acceptance.md`、`api-contract.md` 的主 skill，那类需求应优先走 `iot-platform-spec`。
---

# Superpowers + Gstack：大脑与手脚工作流

本 skill 将「方法论」与「外部世界执行」拆到两个插件：**superpowers** 管怎么想，**gstack** 管怎么干。思路来自公开实践总结（可参考原稿《Claude Code 双插件最佳搭配：superpowers 当大脑，gstack 当手脚》）。**轨物及公司 IoT 类仓库**落地时，请把 **项目级 `CLAUDE.md` / `AGENTS.md`** 与本 skill 对齐，并与 `specs/`、`docs/` 中的业务规则一并遵守（本 skill 不替代业务规格，只约束 Claude Code 执行层分工）。

## 为什么这样分

- **重叠插件会导致 skill 抢匹配**，行为不可复现；只保留两条清晰主线可降低冲突。
- **superpowers**：计划、头脑风暴、TDD、系统化调试、worktree、并行子代理、完成前验证、请求/接收代码审查、分支收尾等——**流程与方法论**。
- **gstack**：真实浏览器、端到端 QA、ship/部署、上线后监控、危险命令护栏、多视角 plan review 等——**与真实环境交互**。

核心比喻：**superpowers 是大脑，gstack 是手脚**。二者接力，不越界。

## 五条原则（裁决用）

1. **流程归 superpowers**：plan、brainstorm、debug、TDD、verify、code review 默认走 superpowers。
2. **执行归 gstack**：浏览器、QA、ship、deploy、canary、护栏等走 gstack。
3. **独立 reviewer 通道**：作者与审查者**不在同一上下文**互评；审查要换会话/子代理视角。
4. **证据优先**：声明完成前必须有可验证证据（测试输出、截图、QA 报告等）。
5. **歧义先 brainstorm**：需求含隐含假设时，先澄清再动手。

## 能力边界速查

**仅走 superpowers（示例）**

- `brainstorming`、`writing-plans`、`executing-plans`
- `test-driven-development`、`systematic-debugging`
- `using-git-worktrees`、`dispatching-parallel-agents`
- `verification-before-completion`、`requesting-code-review`、`receiving-code-review`
- `finishing-a-development-branch`

**仅走 gstack（示例）**

- `/browse`：需要看见真实页面时（默认作为浏览器入口）
- `/qa`、`/qa-only`、`/qa-design-review`
- `/ship`、`/land-and-deploy`、`/setup-deploy`
- `/canary`、`/benchmark`
- `/careful`、`/freeze`、`/guard`
- `/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review`（对**计划**做批判性、多视角审查；不替代 superpowers 写计划）

具体 slash 命令与工具名以各插件当前版本为准；本 skill 强调**职责**而非死记命令。

## 默认任务 → 技能路由表

先查表再动手；表内没有的任务再现场判断。

| 任务 | 默认 | 备注/补强 |
|------|------|-----------|
| 想清楚做什么 | superpowers `brainstorming` | — |
| 写实施计划 | superpowers `writing-plans` | 多视角审查 → gstack `/plan-*-review` |
| 执行计划 | superpowers `executing-plans` + worktrees | 并行 → `dispatching-parallel-agents` |
| 写代码 | superpowers `test-driven-development` | — |
| 调试 bug | superpowers `systematic-debugging` | 要看真实页面 → gstack `/browse` |
| 看前端效果 | gstack `/browse` | — |
| 端到端 QA（可含修 bug） | gstack `/qa` | — |
| 完成前自检 | superpowers `verification-before-completion` | — |
| 请求代码审查 | superpowers `requesting-code-review` | 需要时再加独立渠道 |
| 分支收尾 | superpowers `finishing-a-development-branch` | — |
| 发布 | gstack `/ship` → `/land-and-deploy` | — |
| 上线后观察 | gstack `/canary` 或 `/benchmark` | — |
| 危险/敏感操作护栏 | gstack `/careful` 或 `/guard` | — |

## 标准开发闭环（从想法到上线）

按顺序理解即可；实际执行时允许在「计划审查」处迭代。

```text
[想法]
  → brainstorming
  → writing-plans
  → (可选) gstack /plan-*-review
  → executing-plans + using-git-worktrees
  → test-driven-development
  → gstack /browse 或 /qa
  → verification-before-completion
  → requesting-code-review（独立 reviewer）
  → finishing-a-development-branch
  → gstack /ship
  → gstack /land-and-deploy
  → gstack /canary
  → (可选) 发布说明 / 文档
[完成]
```

## 四个关键交接点

1. **writing-plans → executing-plans**：计划不会自动执行；需显式进入执行；中间可插入 plan review。
2. **executing-plans → /browse 或 /qa**：实现后要用**真实环境**验证；superpowers 不替代浏览器/QA 闭环。
3. **verification → requesting-code-review**：自检与独立审查分两次，不合并。
4. **finishing-a-development-branch → /ship**：分支收尾与发布流水线衔接，但职责仍分属两侧。

## 浏览器与工具约定（若项目 CLAUDE.md 已定义）

若团队在项目或用户级 `CLAUDE.md` 中规定了**唯一浏览器入口**（例如只用 gstack `/browse`），则严格遵循该约定，避免多个浏览器/MCP 通道并行导致行为漂移。

## 与公司项目文档的配合

- 若仓库使用 **IoT/知识库结构**（如 `AGENTS.md`、`REPO_WIKI.md`、`docs/`、`specs/`）：**规格与验收**仍以项目文档为准；本 skill 只管 Claude Code **执行 harness** 的分工与闭环，不替代业务 spec。
- 在 feature 分支上工作时，优先遵循 **`executing-plans` + worktree** 的隔离习惯，避免污染主分支。

## 安装提示（供人类操作，命令以官方最新为准）

典型安装思路（示例，**勿盲抄**，以 marketplace 文档为准）：

- superpowers 系列：`claude plugin install` 对应 marketplace 包（含核心与可选扩展）。
- gstack：`claude plugin marketplace add` / `claude plugin install gstack`（以项目主页为准）。

安装后**必须**通过 `CLAUDE.md` 写清「谁负责什么」，否则仍可能随机匹配 skill。

## 可合并进 `CLAUDE.md` 的裁决片段（模板）

将下列内容按需复制到 **用户级或项目级** `CLAUDE.md`，并与公司规范合并：

```markdown
# Claude Code：superpowers + gstack

主干插件：
- superpowers — 思考与流程（plan / brainstorm / debug / TDD / review / verify）
- gstack — 执行与外部世界（browser / QA / ship / deploy / canary / 护栏）

类比：superpowers 是大脑，gstack 是手脚。

## 原则

1. 流程归 superpowers；执行归 gstack。
2. 独立 reviewer：作者与审查者不在同一上下文互评。
3. 证据优先：未完成验证即不得宣称完成。
4. 歧义先 brainstorm。

## 不要重复造轮子

计划、TDD、调试、验证、代码审查、worktree、并行子代理 → superpowers。
浏览器、QA、ship、deploy、canary、护栏 → gstack。
```

## 助手自检清单（每次复杂任务）

- [ ] 是否先澄清需求（必要时 brainstorming）？
- [ ] 计划与执行是否分界清晰？
- [ ] 实现后是否用 **gstack** 路径做了真实环境验证？
- [ ] 完成前是否收集 **证据**（测试/截图/报告）？
- [ ] 代码审查是否 **独立会话/Reviewer**？
- [ ] 发布与上线后观察是否走 **gstack** 流水线？

---

**何时不要用本 skill**：纯业务需求分析、与 Claude Code 无关的架构讨论、或未安装/不使用上述插件时——此时仅保留「流程思想」作参考，不要假设存在 `/browse` 等命令。
