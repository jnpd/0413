-- -----------------------------------
-- 创建令牌权限表
-- -----------------------------------
CREATE TABLE [blade_api_key] (
    [id] bigint NOT NULL,
    [tenant_id] nvarchar(12) DEFAULT '000000',
    [user_id] bigint NOT NULL,
    [name] nvarchar(128) NOT NULL,
    [api_key] nvarchar(128) NOT NULL,
    [api_path] text,
    [expire_time] datetime,
    [ext_params] text,
    [create_user] bigint,
    [create_dept] bigint,
    [create_time] datetime,
    [update_user] bigint,
    [update_time] datetime,
    [status] int DEFAULT 1,
    [is_deleted] int DEFAULT 0,
    PRIMARY KEY CLUSTERED ([id] ASC)
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
    )
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'主键',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'id'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'租户ID',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'tenant_id'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'用户ID',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'user_id'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'密钥名称',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'name'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'API Key',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'api_key'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'访问权限',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'api_path'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'过期时间',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'expire_time'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'扩展参数(JSON)',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'ext_params'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'创建人',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'create_user'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'创建部门',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'create_dept'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'创建时间',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'create_time'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'修改人',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'update_user'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'修改时间',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'update_time'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'状态',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'status'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'是否已删除',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key',
    'COLUMN', N'is_deleted'
    GO

    EXEC sp_addextendedproperty
    'MS_Description', N'令牌权限表',
    'SCHEMA', N'dbo',
    'TABLE', N'blade_api_key';

-- -----------------------------------
-- 创建权限菜单
-- -----------------------------------
INSERT INTO [blade_menu] ([id], [parent_id], [code], [name], [alias], [path], [source], [sort], [category], [action], [is_open], [component], [remark], [is_deleted])
VALUES (1963598815738675311, 1123598815738675307, N'api_key', N'令牌权限', N'menu', N'/authority/apikey', N'iconfont icon-tianshenpi', 4, 1, 0, 1, N'', NULL, 0);
INSERT INTO [blade_menu] ([id], [parent_id], [code], [name], [alias], [path], [source], [sort], [category], [action], [is_open], [component], [remark], [is_deleted])
VALUES (1963598815738675312, 1963598815738675311, N'api_key_setting', N'权限配置', N'setting', NULL, N'setting', 1, 2, 2, 1, N'', NULL, 0);

