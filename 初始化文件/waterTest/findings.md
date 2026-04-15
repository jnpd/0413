# 发现记录

## 前端
- 项目技术栈为 `Vite + React/TSX`，主要页面位于 `src/views`，不是 Vue 项目。
- 当前已发现页面文件：`Login`、`Announcement`、`BatchManagement`、`BatchTesting`、`Packaging`、`Warehouse`、`Archive`、`History`、`Permissions`。
- `Permissions.tsx` 为三合一系统管理页，通过 `initialTab` 分别映射到账户管理、人员管理、角色管理。
- `History.tsx` 使用本地 `mockBatches` 维护历史批次，和 `BatchTesting.tsx` 没有共享状态；`保存历史` 当前仅弹窗提示，不会把当前批次真正写入历史页。
- `BatchTesting.tsx` 的批量动作弹窗只对 `写IP地址`、`写表底`采集参数，`写表号`、`设置上报周期`、`程序升级`、`查看原始数据` 等动作当前只有说明性执行，不采集额外字段。
- `BatchTesting.tsx` 的批量动作基于“当前选中设备”执行，不是基于“全部待测设备”自动执行。
- `Packaging.tsx` 当前存在显式箱容限制：每箱最多 `10` 只表，未满 `10` 只前不允许保存。
- 删除二次确认目前只在 `History.tsx` 的检验台记录删除中出现；档案、仓库、批次等页面删除大多直接执行。
- 侧边栏菜单是静态配置，前端当前未体现“按角色动态裁剪菜单”。

## 文档
- `水务系统生产测试模块_业务设计文档v1.0 (1).md` 结构偏技术设计，重点章节为：
  - `4.1 表具档案管理模块`
  - `4.2 仓库管理模块`
  - `4.3 批次管理模块`
  - `4.4 批量测试模块`
  - `4.5 包装管理模块`
  - 另含数据库、接口、安全、打印、部署设计。
- `最终prd_水务系统第一阶段_生产测试模块.md` 结构偏产品需求，重点章节为：
  - `3.1 菜单架构`
  - `3.2 页面清单`
  - `5.1 业务主链路`
  - `6.1/6.2 字段与状态口径`
  - `7.1` 到 `7.10` 页面需求明细
  - `11. 待确认项`
- PRD 文档头明确声明“修订依据”为当前前端源码和 `字段界面.md`，因此整体更接近现状界面。
- 业务设计文档虽包含测试历史、检验台数据等数据库与接口设计，但未按当前前端页面口径展开 `登录页 / 公共框架 / 公告管理 / 批量测试历史页 / 系统管理页` 的界面逻辑。

## 差异
- 当前前端已实现页面入口数量与 PRD 页面章节大体一致，但还需要逐页核对每页的操作、字段和状态。
- PRD 与前端的主要差异集中在“角色控制、二次确认、真实联动”三类：文档写了规则，但界面当前未体现或仅为演示。
- 业务设计文档与前端的主要差异集中在“页面覆盖不足、后端规则写得过深、部分交互前端未落地”三类。

## 待确认
- 已确认：
  - 发现的不一致项需要单独拎出，由用户逐项核对。
  - 包装管理一箱 `10` 只表是正式业务规则，不是演示占位。
  - 批量测试“保存历史”应真实写入历史表/历史列表，而不是仅提示成功。

## 2026-03-24 数据库关系梳理
- 业务表结构的正式来源仍是 `水务系统（生产管理与抄表运维）.md`，其中系统管理域在文档前部，生产业务域 DDL 主要集中在 `tb_meter` 到 `tr_package_box_device`，采集与指令域 DDL 主要集中在 `data_realtime_*`、`data_history_*`、`data_archive_*`、`pub_data_raw`、`cmd_command_0`。
- 生产域的核心中心表是 `tb_device`，因为它同时承接 `meter_id`、`prep_id`、`batch_id/detail_id`、`package_id/box_id` 以及采集/指令域的 `device_id`。
- 包装链路的真实主链是 `tl_package -> tl_package_box -> tr_package_box_device -> tb_device`，`tb_device.package_id / box_id / box_no / box_seq` 只是当前查询冗余。
- 批量测试需要区分过程态和历史态：
  - 过程态：`tl_batch -> tr_batch_detail_device -> tr_batch_detail_test`
  - 历史态：`tl_batch_snapshot -> tr_batch_detail_history -> tr_batch_history_test_rel -> tr_batch_detail_test`
- `tl_test_data` 到 `tr_batch_detail_test` 没有明确物理外键，更像通过 `meter_no + batch_id + flow_point_seq` 做逻辑匹配。
- `detail_id` 在文档里是逻辑业务明细标识，不适合直接当成 `tr_batch_detail_device.device_ref_id` 的物理外键替代。
