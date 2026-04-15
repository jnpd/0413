# Repo Wiki

## 作用

给 WaterManger 项目中的人和 Agent 提供统一知识入口与阅读顺序。

## 建议阅读顺序

默认入口先和 `AGENTS.md` 保持一致：

1. `README.md`
2. `REPO_WIKI.md`
3. `AGENTS.md`
4. `docs/00-meta/通用契约索引.md`
5. `docs/00-meta/交付护栏契约.md`
6. `docs/00-meta/缺口台账.md`
7. `试点启动说明.md`
8. `项目交接清单与第一周任务表.md`
9. `docs/01-overview/项目概览.md`
10. `docs/01-overview/模块地图.md`
11. `docs/03-architecture/系统架构总览.md`
12. `docs/04-modules/README.md`
13. `docs/04-modules/核心实体说明.md`
14. `docs/02-rules/README.md`
15. `docs/02-rules/业务规则选路索引.md`
16. `docs/02-rules/接口规范.md`
17. `docs/02-rules/多租户隔离规则.md`
18. `docs/02-rules/权限边界规则.md`
18. `docs/06-release-ops/核心测试场景库.md`
19. `docs/07-incidents/缺陷案例索引.md`

涉及仓库、环境、外部 PRD、代码分支时，插读：

- `docs/00-meta/外部依赖与交接说明.md`

## 知识地图

### 元信息与交接

- 外部依赖与交接：`docs/00-meta/外部依赖与交接说明.md`
- 缺口台账：`docs/00-meta/缺口台账.md`
- 交付护栏：`docs/00-meta/交付护栏契约.md`
- 通用契约索引：`docs/00-meta/通用契约索引.md`

### 项目与结构

- 试点启动说明：`试点启动说明.md`
- 第一周任务表：`项目交接清单与第一周任务表.md`
- 项目概览：`docs/01-overview/项目概览.md`
- 模块地图：`docs/01-overview/模块地图.md`
- 系统架构：`docs/03-architecture/系统架构总览.md`
- 数据真源归档：`docs/04-modules/README.md`
- 数据模型：`docs/04-modules/核心实体说明.md`

### 高风险知识

- 规则总览：`docs/02-rules/README.md`
- 规则选路入口：`docs/02-rules/业务规则选路索引.md`
- 前端实现规范：`docs/02-rules/前端实现规范.md`
- 多租户隔离：`docs/02-rules/多租户隔离规则.md`
- 权限边界：`docs/02-rules/权限边界规则.md`
- 批次快照检验台：独立规则页待补，当前先参考 `AGENTS.md` 与 `docs/00-meta/缺口台账.md`
- 状态一致性：`docs/02-rules/状态一致性规则.md`
- 枚举与字典：`docs/02-rules/枚举与字典代码落地规范.md`
- 设备上报与远程控制：`docs/05-device-protocol/设备上报与远程控制闭环.md`
- 缺陷案例：`docs/07-incidents/缺陷案例索引.md`

### 规格入口

- 变更提案镜像：`changes/2026-04/`
- 当前功能规格真源：`openspec/changes/`
- 推荐首读 feature：`testing-history-inspection-closure`

### 联调知识

- BladeX 前端登录与仓库接口联调说明：`docs/02-rules/BladeX前端登录与仓库接口联调说明.md`
- 仓库页本地联调前置清单：`docs/06-release-ops/仓库页本地联调前置清单.md`

## 维护规则

- 新需求先进入 `changes/<YYYY-MM>/<feature>/proposal.md`
- `changes/<YYYY-MM>/_index.md` 只做月份入口，不承载 canonical spec
- `changes/<YYYY-MM>/<feature>/proposal.md` 只放 proposal
- 当前仓库内，需求确认后的 design / tasks / test-cases / acceptance / contracts / specs 维护在 `openspec/changes/<feature>/`
- `openspec/changes/<feature>/` 不允许再放 `proposal.md`
- 禁止在 `changes/` 和 `openspec/` 同时维护同名、同职责文档
- 若后续完成 starter 迁移，再切换到 `specs/<YYYY-MM>/<feature>/`
- 接口变更后同步更新 `docs/02-rules/接口规范.md` 或 feature `contracts/`
- 高风险规则变更后同步更新知识页
- 线上问题修复后同步回灌缺陷案例
- 涉及字段、状态、枚举、流程改动时，先按 `docs/00-meta/交付护栏契约.md` 做闭环检查
