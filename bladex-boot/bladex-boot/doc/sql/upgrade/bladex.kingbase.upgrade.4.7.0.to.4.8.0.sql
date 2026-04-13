-- -----------------------------------
-- 创建令牌权限表
-- -----------------------------------
CREATE TABLE "blade_api_key" (
    "id" int8 NOT NULL,
    "tenant_id" varchar(12) COLLATE "pg_catalog"."default" DEFAULT '000000',
    "user_id" int8 NOT NULL,
    "name" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
    "api_key" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
    "api_path" text COLLATE "pg_catalog"."default",
    "expire_time" timestamp(6),
    "ext_params" text COLLATE "pg_catalog"."default",
    "create_user" int8,
    "create_dept" int8,
    "create_time" timestamp(6),
    "update_user" int8,
    "update_time" timestamp(6),
    "status" int4 DEFAULT 1,
    "is_deleted" int4 DEFAULT 0,
    PRIMARY KEY ("id")
);

COMMENT ON COLUMN "blade_api_key"."id" IS '主键';

COMMENT ON COLUMN "blade_api_key"."tenant_id" IS '租户ID';

COMMENT ON COLUMN "blade_api_key"."user_id" IS '用户ID';

COMMENT ON COLUMN "blade_api_key"."name" IS '密钥名称';

COMMENT ON COLUMN "blade_api_key"."api_key" IS 'API Key';

COMMENT ON COLUMN "blade_api_key"."api_path" IS '访问权限';

COMMENT ON COLUMN "blade_api_key"."expire_time" IS '过期时间';

COMMENT ON COLUMN "blade_api_key"."ext_params" IS '扩展参数(JSON)';

COMMENT ON COLUMN "blade_api_key"."create_user" IS '创建人';

COMMENT ON COLUMN "blade_api_key"."create_dept" IS '创建部门';

COMMENT ON COLUMN "blade_api_key"."create_time" IS '创建时间';

COMMENT ON COLUMN "blade_api_key"."update_user" IS '修改人';

COMMENT ON COLUMN "blade_api_key"."update_time" IS '修改时间';

COMMENT ON COLUMN "blade_api_key"."status" IS '状态';

COMMENT ON COLUMN "blade_api_key"."is_deleted" IS '是否已删除';

COMMENT ON TABLE "blade_api_key" IS '令牌权限表';

-- -----------------------------------
-- 创建权限菜单
-- -----------------------------------
INSERT INTO "blade_menu" ("id", "parent_id", "code", "name", "alias", "path", "source", "sort", "category", "action", "is_open", "component", "remark", "is_deleted") VALUES (1963598815738675311, 1123598815738675307, 'api_key', '令牌权限', 'menu', '/authority/apikey', 'iconfont icon-tianshenpi', 4, 1, 0, 1, '', NULL, 0);
INSERT INTO "blade_menu" ("id", "parent_id", "code", "name", "alias", "path", "source", "sort", "category", "action", "is_open", "component", "remark", "is_deleted") VALUES (1963598815738675312, 1963598815738675311, 'api_key_setting', '权限配置', 'setting', NULL, 'setting', 1, 2, 2, 1, '', NULL, 0);

