---
name: iot-platform-spec
description: |
  Guides feature specification and knowledge-base workflow for IoT platform projects that follow
  the thingcom/iot-platform knowledge base structure (AGENTS.md + REPO_WIKI.md + docs/ + specs/ layout).

  Use this skill whenever:
  - The user is working in a project with AGENTS.md / REPO_WIKI.md / docs/ / specs/ layout
  - User says they have a new requirement, new feature, or wants to write a spec (规格 / spec / 需求分析)
  - User wants to create any of: spec.md, design.md, tasks.md, test-cases.md, acceptance.md, api-contract.md, proposal.md
  - User wants to freeze contracts or high-risk rules before writing code
  - User wants to do 知识回灌 (write knowledge back after implementation)
  - User asks "how should I spec this out?" or "where do I start with this feature?" in an IoT platform project
  - User mentions IoT high-risk areas in context of a spec: 协议解析, 告警逻辑, 多租户隔离, 权限边界, 远程控制
  - User wants to kick off a pilot or onboard a new project using the knowledge base approach

  Prefer this skill when the task is about defining scope, business rules, contracts, acceptance, or knowledge docs.
  Do not use this skill for Claude Code plugin setup, browser/QA/release workflow routing, or pure implementation tasks (writing code) that have no spec workflow involved; those belong to execution/harness guidance such as `superpowers-gstack-workflow`.
---

# IoT Platform Feature Spec Workflow

This skill helps you work on features in IoT platform projects that use the thingcom/iot-platform knowledge base structure.

The core principle: **knowledge before code**. No implementation without a spec. No spec that invents business rules that don't exist in the knowledge base. When in doubt, freeze the rule in a knowledge doc first.

---

## Step 0: Read the Knowledge Base First

Before writing a single line of spec, read the project's knowledge base in this order:

1. `README.md` — scope boundaries (what the project is and isn't responsible for)
2. `AGENTS.md` — working principles and high-risk areas defined for this specific project
3. `REPO_WIKI.md` — the knowledge map and recommended reading order
4. `docs/02-business-rules/业务规则选路索引.md` — use this to route into the right business-rule doc
5. The domain docs relevant to the feature (e.g., business rules, data model, device protocol)

If any of these files are stubs (empty templates), surface that to the user before proceeding — an unpopulated knowledge base means business rules haven't been frozen yet, which is the first thing to fix.

Use `REPO_WIKI.md` as a navigation guide. It tells you where each type of knowledge lives. When writing a spec that touches multi-tenant isolation, for example, go read `docs/02-business-rules/多租户隔离规则.md` before specifying the behavior — derive the rules, don't invent them.

---

## The Feature Workflow

Every feature in this project follows this sequence:

```
需求理解 → 变更提案 → 规格 → 设计说明 → 任务拆解 → 测试用例 → 验收标准 → 接口契约 → 实现 → 知识回灌
```

Create all artifacts under `specs/<YYYY-MM>/<feature-name>/`. Use the project's existing specs (e.g., `specs/2026-04/first-feature/`) as structural reference — they show the expected format and level of detail.

---

### 1. 变更提案 (Change Proposal)
**File**: `changes/<YYYY-MM>/<feature-name>/proposal.md`

Capture the "why" before the "what." A good proposal answers:
- Why do this now? What's the current pain?
- What is in scope, what is explicitly not?
- What high-risk rules must be frozen before implementation starts?
- What does success look like at a glance?

This is the entry point that justifies the work. If the user jumps straight to a spec without a proposal, ask whether the scope and motivation are already agreed upon — if so, capture them in the spec's Background section instead.

---

### 2. 功能规格 (Feature Spec)
**File**: `specs/<YYYY-MM>/<feature-name>/spec.md`

The contract between product and engineering. A spec must include:

- **Background**: Why does this exist? What problem does it solve? What is explicitly out of scope?
- **Business rules**: Derived from existing knowledge docs, not invented. Each rule should cite its source doc or be flagged as a new rule needing sign-off.
- **Normal flows**: Step-by-step happy paths
- **Exception flows**: What happens when things go wrong (device offline, data delay, duplicate reports, insufficient permissions)
- **Impact scope**: Which modules, APIs, data tables, and tests are affected
- **Acceptance criteria**: Specific and verifiable — each item should be checkable by a person or an automated test
- **Risks and rollback**: What could go wrong, and how to recover

**Key discipline**: If a business rule doesn't exist in any knowledge doc, don't make it up. Either ask the user to clarify, or create a new knowledge doc page to capture it first, then reference it from the spec.

---

### 3. 设计说明 (Design Doc)
**File**: `specs/<YYYY-MM>/<feature-name>/design.md`

The technical implementation approach. Structure it as:
- Overall approach and key design decisions
- Module boundaries (what each module is and isn't responsible for)
- Backend design: relevant entities, core rules, key flows
- Frontend design (if applicable): page layer and model layer changes
- Transaction invariants (what must commit or roll back together)
- Risk points and how they'll be validated

The design doc explains *how*, the spec explains *what*. Keep them separate.

---

### 4. 任务拆解 (Task Breakdown)
**File**: `specs/<YYYY-MM>/<feature-name>/tasks.md`

Break work into concrete tasks. Each task needs: content, input, output, owner, and risk. The standard execution order is:

1. Spec confirmation (产品/项目)
2. Contract freeze (后端)
3. Test cases freeze (测试)
4. Backend tests written first (red state)
5. Frontend tests written first (red state)
6. Backend implementation
7. Frontend implementation
8. Integration and verification
9. Knowledge update (回灌)
10. Release and rollback preparation

Contracts and test cases come *before* implementation — not after. If the user wants to skip this order, surface the risk.

---

### 5. 测试用例 (Test Cases)
**File**: `specs/<YYYY-MM>/<feature-name>/test-cases.md`

Write test cases before implementation. Every feature in an IoT platform needs:
- Normal scenario cases (main flows)
- Exception cases (error paths, boundary conditions, rollback behavior)
- State invariant cases (what must never change — e.g., historical snapshots are read-only)
- Regression cases (what might break from this change)
- **IoT-specific must-test scenarios**: device offline handling, data delay/missing fields, duplicate reports, tenant boundary violations, insufficient permissions

Use the project's `docs/06-release-ops/核心测试场景库.md` as the baseline — it lists the must-test scenario types for this project.

---

### 6. 验收标准 (Acceptance Criteria)
**File**: `specs/<YYYY-MM>/<feature-name>/acceptance.md`

Enumerate acceptance items. Each should be specific enough that a person can check it off unambiguously. Acceptance criteria are the "definition of done" for the feature.

---

### 7. 接口契约 (API Contract)
**File**: `specs/<YYYY-MM>/<feature-name>/contracts/api-contract.md`

Define the API contract before implementation:
- Request/response schemas (field names, types, required/optional)
- Pagination format (per the project's `docs/03-architecture/接口规范.md`)
- Error codes and their meanings
- Auth and tenant validation requirements

Once frozen, treat this as a breaking-change contract. Removing fields or changing types requires a version bump and downstream notification.

---

## High-Risk Areas: Stop and Check

When a feature touches any of these, **pause and read the relevant knowledge doc before specifying behavior**. Never invent rules for high-risk areas — derive them or surface them for sign-off first.

| High-Risk Area | Where to Check |
|---|---|
| 协议解析 (Device protocol parsing) | `docs/05-device-protocol/` |
| 告警逻辑 (Alert logic) | `docs/02-business-rules/告警规则-*.md` |
| 多租户隔离 (Multi-tenant isolation) | `docs/02-business-rules/多租户隔离规则.md` |
| 权限边界 (Permission enforcement) | `docs/02-business-rules/` + `docs/03-architecture/接口规范.md` |
| 远程控制 (Remote device control) | `docs/05-device-protocol/` + architecture docs |

For multi-tenant isolation specifically: permission checks must be enforced by the backend, not derived from frontend parameters. Any spec that relies on the frontend passing tenant context is a risk — flag it.

---

## Pre-Commit Checklist

Before considering any feature complete, verify:

- [ ] A spec exists and has been confirmed
- [ ] Tests have been added or updated (covering high-risk areas)
- [ ] All affected knowledge docs have been updated
- [ ] Risks and impact scope are documented
- [ ] High-risk rules were verified against existing knowledge docs (not invented)

---

## Knowledge 回灌 (Write-back After Implementation)

After a feature ships, update the knowledge base to reflect what actually happened:

- **API docs** (`docs/03-architecture/接口规范.md`) — if any API behavior differs from the spec
- **Business rule docs** — if any rule was clarified, extended, or added during implementation
- **Incident index** (`docs/07-incidents/缺陷案例索引.md`) — for any bugs found, with root cause and prevention action. Every incident entry must include: root cause type, business impact, and a linked test patch.
- **Testing scenarios** (`docs/06-release-ops/核心测试场景库.md`) — if new test patterns emerged
- **Device protocol docs** — if protocol behavior was clarified or corrected

The goal is that the next feature or the next agent can start from an accurate, up-to-date knowledge base.

---

## Common Root Cause Categories

Check `docs/07-incidents/缺陷案例索引.md` before speccing areas that have had incidents. The root cause categories tell you where this project has historically been weak:

- **需求理解偏差** → Write explicit acceptance criteria; review with product
- **业务规则缺失** → Read domain knowledge docs before specifying; freeze rules first
- **协议字段错误** → Check device protocol docs; look at historical protocol incidents
- **接口兼容性问题** → Freeze API contracts before implementation; involve downstream teams
- **权限边界遗漏** → Add explicit permission boundary test cases (non-superadmin cross-tenant access)
- **测试覆盖不足** → Cover happy path + exceptions + tenant isolation + regressions
- **发布流程缺失** → Follow `docs/06-release-ops/发布流程.md`; include rollback plan in spec
