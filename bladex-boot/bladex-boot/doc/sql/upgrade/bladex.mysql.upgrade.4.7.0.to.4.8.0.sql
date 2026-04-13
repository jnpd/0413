-- -----------------------------------
-- 创建令牌权限表
-- -----------------------------------
CREATE TABLE `blade_api_key`  (
  `id` bigint NOT NULL COMMENT '主键',
  `tenant_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '000000' COMMENT '租户ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密钥名称',
  `api_key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'API Key',
  `api_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '访问权限',
  `expire_time` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `ext_params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '扩展参数(JSON)',
  `create_user` bigint NULL DEFAULT NULL COMMENT '创建人',
  `create_dept` bigint NULL DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_user` bigint NULL DEFAULT NULL COMMENT '修改人',
  `update_time` datetime NULL DEFAULT NULL COMMENT '修改时间',
  `status` int NULL DEFAULT 1 COMMENT '状态',
  `is_deleted` int NULL DEFAULT 0 COMMENT '是否已删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '令牌权限表';

-- -----------------------------------
-- 创建权限菜单
-- -----------------------------------
INSERT INTO `blade_menu` (`id`, `parent_id`, `code`, `name`, `alias`, `path`, `source`, `sort`, `category`, `action`, `is_open`, `component`, `remark`, `is_deleted`) VALUES (1963598815738675311, 1123598815738675307, 'api_key', '令牌权限', 'menu', '/authority/apikey', 'iconfont icon-tianshenpi', 4, 1, 0, 1, '', NULL, 0);
INSERT INTO `blade_menu` (`id`, `parent_id`, `code`, `name`, `alias`, `path`, `source`, `sort`, `category`, `action`, `is_open`, `component`, `remark`, `is_deleted`) VALUES (1963598815738675312, 1963598815738675311, 'api_key_setting', '权限配置', 'setting', NULL, 'setting', 1, 2, 2, 1, '', NULL, 0);
