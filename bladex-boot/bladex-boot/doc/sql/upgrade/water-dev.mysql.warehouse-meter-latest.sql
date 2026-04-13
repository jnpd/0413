-- 仓库实时表与种子数据（MySQL）

CREATE TABLE IF NOT EXISTS `tb_meter_latest` (
  `tenant_id` VARCHAR(12) NOT NULL DEFAULT '000000' COMMENT '租户ID',
  `device_id` BIGINT UNSIGNED NOT NULL COMMENT '设备ID',
  `meter_no` VARCHAR(32) DEFAULT NULL COMMENT '水表表号',
  `imei` VARCHAR(32) NOT NULL COMMENT '设备IMEI',
  `protocol_type` VARCHAR(20) DEFAULT NULL COMMENT '通讯协议',
  `manufacturer_code` VARCHAR(50) DEFAULT NULL COMMENT '厂商代码',
  `forward_total_flow` DECIMAL(18,3) DEFAULT NULL COMMENT '正向累积流量',
  `reverse_total_flow` DECIMAL(18,3) DEFAULT NULL COMMENT '反向累积流量',
  `valve_status` TINYINT DEFAULT NULL COMMENT '阀门状态：0关 1开 2故障',
  `battery_voltage` DECIMAL(8,3) DEFAULT NULL COMMENT '电池电压',
  `main_ip` VARCHAR(64) DEFAULT NULL COMMENT '主IP',
  `backup_ip` VARCHAR(64) DEFAULT NULL COMMENT '副IP',
  `iccid` VARCHAR(32) DEFAULT NULL COMMENT 'ICCID',
  `csq` INT DEFAULT NULL COMMENT 'CSQ',
  `rsrp` INT DEFAULT NULL COMMENT 'RSRP',
  `rsrq` INT DEFAULT NULL COMMENT 'RSRQ',
  `report_time` DATETIME(3) DEFAULT NULL COMMENT '最近上报时间',
  `payload_json` JSON DEFAULT NULL COMMENT '原始业务对象',
  `raw_data` TEXT DEFAULT NULL COMMENT '原始报文',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`device_id`),
  KEY `idx_tb_meter_latest_meter_no` (`meter_no`),
  KEY `idx_tb_meter_latest_imei` (`imei`),
  KEY `idx_tb_meter_latest_report_time` (`report_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库实时表';

INSERT INTO `tb_meter_latest`
(`tenant_id`, `device_id`, `meter_no`, `imei`, `protocol_type`, `manufacturer_code`, `forward_total_flow`, `reverse_total_flow`, `valve_status`, `battery_voltage`, `main_ip`, `backup_ip`, `iccid`, `csq`, `rsrp`, `rsrq`, `report_time`)
VALUES
('000000', 10001, NULL, '861234567890121', 'CJT188', 'NB-001', 0.000, 0.000, 1, 3.620, '192.168.1.10', '192.168.1.11', '89860123456789012341', 22, -88, -10, '2026-04-09 09:00:00.000'),
('000000', 10002, NULL, '861234567890122', 'CJT188', 'NB-001', 0.356, 0.012, 0, 3.560, '192.168.1.20', '192.168.1.21', '89860123456789012342', 24, -85, -9, '2026-04-09 09:01:00.000'),
('000000', 10003, NULL, '861234567890123', 'SR', 'HZ-003', 1.204, 0.034, 2, 2.960, '192.168.2.10', '192.168.2.11', '89860123456789012343', 18, -103, -15, '2026-04-09 09:02:00.000'),
('000000', 10004, NULL, '861234567890124', 'CJT188', 'NB-002', 2.218, 0.025, 1, 3.680, '192.168.2.20', '192.168.2.21', '89860123456789012344', 28, -76, -8, '2026-04-09 09:03:00.000'),
('000000', 10005, NULL, '861234567890125', 'CJT188', 'NB-003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('000000', 10006, NULL, '861234567890126', 'SR', 'NB-004', 0.842, 0.006, 0, 3.100, '192.168.3.10', '192.168.3.11', '89860123456789012346', 21, -91, -11, '2026-04-09 09:04:00.000'),
('000000', 10007, NULL, '861234567890127', 'CJT188', 'NB-005', 0.412, 0.003, 1, 3.480, '192.168.3.20', '192.168.3.21', '89860123456789012347', 12, -109, -17, '2026-04-09 09:05:00.000'),
('000000', 10008, NULL, '861234567890128', 'HVNB', 'EN-001', 3.102, 0.021, 1, 3.580, '192.168.4.10', '192.168.4.11', '89860123456789012348', 23, -87, -10, '2026-04-09 09:06:00.000'),
('000000', 10009, NULL, '861234567890129', 'CJT188', 'QD-002', 0.923, 0.018, 0, 3.440, '192.168.4.20', '192.168.4.21', '89860123456789012349', 20, -94, -12, '2026-04-09 09:07:00.000'),
('000000', 10010, NULL, '861234567890130', 'CJT188', 'NB-006', 4.556, 0.041, 1, 3.510, '192.168.5.10', '192.168.5.11', '89860123456789012350', 25, -83, -9, '2026-04-09 09:08:00.000')
ON DUPLICATE KEY UPDATE
  `meter_no` = VALUES(`meter_no`),
  `protocol_type` = VALUES(`protocol_type`),
  `manufacturer_code` = VALUES(`manufacturer_code`),
  `forward_total_flow` = VALUES(`forward_total_flow`),
  `reverse_total_flow` = VALUES(`reverse_total_flow`),
  `valve_status` = VALUES(`valve_status`),
  `battery_voltage` = VALUES(`battery_voltage`),
  `main_ip` = VALUES(`main_ip`),
  `backup_ip` = VALUES(`backup_ip`),
  `iccid` = VALUES(`iccid`),
  `csq` = VALUES(`csq`),
  `rsrp` = VALUES(`rsrp`),
  `rsrq` = VALUES(`rsrq`),
  `report_time` = VALUES(`report_time`);
