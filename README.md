# WaterManger 知识底座 Starter 对齐版

## 项目简介

- 项目目标：把 WaterManger 当前分散在 `docs/`、`openspec/`、前后端规范中的知识，重组为一套接近 `water-knowledge-base-starter` 的知识底座，同时保留当前仓库的过渡落盘结构。
- 服务对象：产品、后端、前端、测试、试点负责人，以及参与需求分析/设计/测试/实现的 Agent。
- 核心价值：让团队按统一顺序读取知识、冻结规格、落测试、再实现，而不是靠口头同步和临场记忆。

## 当前范围

- 本输出包负责：
  - 项目入口、交接入口和阅读顺序
  - 项目概览、模块地图、系统架构、核心实体说明
  - 高风险业务规则与接口/测试/发布/缺陷知识页
  - WaterManger 现有 15 个 change 的 proposal 镜像与规格入口重排
- 本输出包不负责：
  - 直接替代代码仓
  - 替代所有外部 PRD 原文
  - 替代正式接口实现与数据库脚本执行

## 核心模块

| 模块 | 作用 | 样板文档 |
|---|---|---|
| 批量测试历史与检验台闭环 | 作为首个高风险样板 feature | `openspec/changes/testing-history-inspection-closure/` |
| 接口规范 | 冻结返回结构、错误语义、鉴权责任 | `docs/02-rules/接口规范.md` |
| 测试场景 | 冻结主链路、异常、回归点 | `docs/06-release-ops/核心测试场景库.md` |

## 快速导航

- 交接与缺口：`docs/00-meta/外部依赖与交接说明.md`
- 缺口台账：`docs/00-meta/缺口台账.md`
- 交付护栏：`docs/00-meta/交付护栏契约.md`
- 试点节奏：`试点启动说明.md`
- 第一周清单：`项目交接清单与第一周任务表.md`
- 当前版本沉淀：`docs/06-release-ops/2026-04当前版本沉淀.md`
- 知识索引：`REPO_WIKI.md`
- Agent 规则：`AGENTS.md`
- 项目概览：`docs/01-overview/项目概览.md`
- 模块地图：`docs/01-overview/模块地图.md`
- 规则总览：`docs/02-rules/README.md`
- 业务规则选路：`docs/02-rules/业务规则选路索引.md`
- 前端实现规范：`docs/02-rules/前端实现规范.md`
- 系统架构：`docs/03-architecture/系统架构总览.md`
- 数据真源归档：`docs/04-modules/README.md`
- 核心实体：`docs/04-modules/核心实体说明.md`
- 通用契约索引：`docs/00-meta/通用契约索引.md`

## 当前技术口径

- 后端：已验证 `BladeX / Spring Boot / MyBatis-Plus / MySQL / Redis / RabbitMQ`
- 前端：当前工作区已验证 `React 19 / Vite 6 / TypeScript / Tailwind` 原型工程
- 前端后台组件方案：用户已确认后续采用 `Ant Design`，当前尚未落地到可验证代码

## 结构说明

当前仓库要区分“当前落盘”与“starter 目标态”：

- 当前落盘
  - `changes/2026-04/_index.md`
    - 月份入口索引，只负责按时间找 change
  - `changes/2026-04/<feature>/proposal.md`
    - 该 feature 的唯一 proposal 文档
  - `openspec/changes/<feature>/`
    - 该 feature 的 canonical spec 真源，只存放 `design.md`、`tasks.md`、`test-cases.md`、`acceptance.md`、`contracts/`、`specs/`
- `docs/`
    - 项目级知识，不把 feature 级细节塞进项目总览
- `docs/00-03/`
    - 该范围内按主题拆分落盘通用契约与项目级规则，不单独新开顶层数字目录
- starter 目标态
  - `specs/2026-04/<feature>/`
    - 理想中的规格目录；当前仓库尚未整体迁移到该结构
- `skills/`
  - 保留 starter 自带技能目录，便于后续继续沿用
