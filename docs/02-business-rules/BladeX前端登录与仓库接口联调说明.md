# BladeX 前端登录与仓库接口联调说明

## 文档信息

| 项 | 内容 |
|---|---|
| 最后更新 | 2026-04-13 |
| 范围 | 登录、鉴权请求头、仓库接口 smoke |

## 1. 目的

给后续前端联调一个明确基线，避免再次踩到 2026-04-09 的认证坑。

## 2. 联调前置条件

- 后端能启动到 `8010`
- MySQL 配置已就绪
- 仓库 SQL 升级脚本已执行
- 测试账号可用

## 3. 登录口径

### 3.1 接口

- `POST /blade-auth/oauth/token`

### 3.2 关键参数

- `grant_type=password`
- `tenant_id=000000`
- `username=<账号>`
- `password=04 + sm2.doEncrypt(password, publicKey, 0)`

### 3.3 登录请求头

- `Authorization: Basic c2FiZXIzOnNhYmVyM19zZWNyZXQ=`
- `Blade-Requested-With: BladeHttpRequest`
- 登录阶段不带 `Blade-Auth`

## 4. 业务请求口径

- 登录成功后保存 `access_token`
- 访问仓库接口时带：
  - `Authorization: Basic ...`
  - `Blade-Auth: bearer <token>`
  - `Blade-Requested-With: BladeHttpRequest`

## 5. 最小 smoke

1. 调登录接口拿到 `access_token`
2. 带 token 访问 `GET /blade-wms/warehouse/stat`
3. 再访问 `GET /blade-wms/warehouse/page`

只要第 2 步失败，优先检查：

- 是否仍是假登录
- 是否少了 `Blade-Auth`
- 是否密码加密方式错了

## 6. 已知风险

- 当前工作区未同步到可验证的前端源码，因此本页只冻结联调口径，不描述页面级实现细节。
- token 刷新、退出登录、动态菜单等更完整前端流程仍待补。
