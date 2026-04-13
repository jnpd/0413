-- 仓库管理主表升级脚本（MySQL）

CREATE TABLE IF NOT EXISTS `tb_device` (
  `device_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '设备ID',
  `tenant_id` VARCHAR(12) NOT NULL DEFAULT '000000' COMMENT '租户ID',
  `meter_id` BIGINT UNSIGNED NOT NULL COMMENT '表具档案ID',
  `meter_no` VARCHAR(32) DEFAULT NULL COMMENT '水表表号，可空，写号后唯一',
  `imei` VARCHAR(32) NOT NULL COMMENT '设备IMEI',
  `prep_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '备货单ID',
  `protocol_type` TINYINT NOT NULL COMMENT '通讯协议',
  `carrier` TINYINT DEFAULT NULL COMMENT '运营商',
  `vendor_code` VARCHAR(50) DEFAULT NULL COMMENT '厂商代码',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `inbound_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  `stock_status` TINYINT NOT NULL DEFAULT 0 COMMENT '库存状态：0在库 1已出库',
  `test_status` TINYINT NOT NULL DEFAULT 0 COMMENT '测试状态：0待测 1合格 2不合格',
  `box_no` VARCHAR(64) DEFAULT NULL COMMENT '装箱号',
  `outbound_time` DATETIME DEFAULT NULL COMMENT '出库时间',
  `outbound_operator_id` BIGINT DEFAULT NULL COMMENT '出库操作人ID',
  `outbound_operator_name` VARCHAR(64) DEFAULT NULL COMMENT '出库操作人名称',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`device_id`),
  UNIQUE KEY `uk_tb_device_meter_no` (`meter_no`),
  UNIQUE KEY `uk_tb_device_imei` (`imei`),
  KEY `idx_tb_device_meter_id` (`meter_id`),
  KEY `idx_tb_device_prep_id` (`prep_id`),
  KEY `idx_tb_device_stock_status` (`stock_status`),
  KEY `idx_tb_device_test_status` (`test_status`),
  KEY `idx_tb_device_inbound_time` (`inbound_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库设备主表';

ALTER TABLE `tb_device`
  ADD COLUMN IF NOT EXISTS `meter_id` BIGINT UNSIGNED NOT NULL COMMENT '表具档案ID',
  ADD COLUMN IF NOT EXISTS `meter_no` VARCHAR(32) DEFAULT NULL COMMENT '水表表号，可空，写号后唯一',
  ADD COLUMN IF NOT EXISTS `imei` VARCHAR(32) NOT NULL COMMENT '设备IMEI',
  ADD COLUMN IF NOT EXISTS `prep_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '备货单ID',
  ADD COLUMN IF NOT EXISTS `protocol_type` TINYINT NOT NULL DEFAULT 0 COMMENT '通讯协议',
  ADD COLUMN IF NOT EXISTS `carrier` TINYINT DEFAULT NULL COMMENT '运营商',
  ADD COLUMN IF NOT EXISTS `vendor_code` VARCHAR(50) DEFAULT NULL COMMENT '厂商代码',
  ADD COLUMN IF NOT EXISTS `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  ADD COLUMN IF NOT EXISTS `inbound_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  ADD COLUMN IF NOT EXISTS `stock_status` TINYINT NOT NULL DEFAULT 0 COMMENT '库存状态：0在库 1已出库',
  ADD COLUMN IF NOT EXISTS `test_status` TINYINT NOT NULL DEFAULT 0 COMMENT '测试状态：0待测 1合格 2不合格',
  ADD COLUMN IF NOT EXISTS `box_no` VARCHAR(64) DEFAULT NULL COMMENT '装箱号',
  ADD COLUMN IF NOT EXISTS `outbound_time` DATETIME DEFAULT NULL COMMENT '出库时间',
  ADD COLUMN IF NOT EXISTS `outbound_operator_id` BIGINT DEFAULT NULL COMMENT '出库操作人ID',
  ADD COLUMN IF NOT EXISTS `outbound_operator_name` VARCHAR(64) DEFAULT NULL COMMENT '出库操作人名称';

CREATE UNIQUE INDEX IF NOT EXISTS `uk_tb_device_meter_no` ON `tb_device` (`meter_no`);
CREATE UNIQUE INDEX IF NOT EXISTS `uk_tb_device_imei` ON `tb_device` (`imei`);
CREATE INDEX IF NOT EXISTS `idx_tb_device_meter_id` ON `tb_device` (`meter_id`);
CREATE INDEX IF NOT EXISTS `idx_tb_device_prep_id` ON `tb_device` (`prep_id`);
CREATE INDEX IF NOT EXISTS `idx_tb_device_stock_status` ON `tb_device` (`stock_status`);
CREATE INDEX IF NOT EXISTS `idx_tb_device_test_status` ON `tb_device` (`test_status`);
CREATE INDEX IF NOT EXISTS `idx_tb_device_inbound_time` ON `tb_device` (`inbound_time`);
