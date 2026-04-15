# API Surface

This reference lists the source endpoints that matter most for the migration.

## Auth

### Login

- File: `Saber3-master/src/api/user.js`
- Endpoint: `POST /blade-auth/oauth/token`
- Notes:
  - uses username/password flow
  - sends `Tenant-Id`, `Dept-Id`, `Role-Id`, `Captcha-Key`, `Captcha-Code` headers when needed
  - uses basic auth header in the request client

### Refresh Token

- File: `Saber3-master/src/api/user.js`
- Endpoint: `POST /blade-auth/oauth/token`
- Notes:
  - `grant_type=refresh_token`
  - depends on tenant/dept/role context

### User Info

- File: `Saber3-master/src/api/user.js`
- Endpoint: `GET /blade-auth/oauth/user-info`

### Logout

- File: `Saber3-master/src/api/user.js`
- Endpoint: `GET /blade-auth/oauth/logout`

## Menu And Permission

### Top Menu

- File: `Saber3-master/src/api/system/menu.js`
- Endpoint: `GET /blade-system/menu/top-menu`

### Dynamic Routes

- File: `Saber3-master/src/api/system/menu.js`
- Endpoint: `GET /blade-system/menu/routes`
- Notes:
  - takes `topMenuId`
  - result is transformed by `src/router/avue-router.js`

### Button Permissions

- File: `Saber3-master/src/api/user.js`
- Endpoint: `GET /blade-system/menu/buttons`

### Menu Lazy Tree

- File: `Saber3-master/src/api/system/menu.js`
- Endpoint: `GET /blade-system/menu/lazy-list`
- Notes:
  - menu management in the source UI is tree-oriented, not a plain flat table
  - children are loaded lazily by `parentId`
  - target React pages should prefer a lazy tree view over pretending the menu model is purely paginated

## Personnel And Role

### User List

- File: `Saber3-master/src/api/system/user.js`
- Endpoint: `GET /blade-system/user/page`

### User Submit

- File: `Saber3-master/src/api/system/user.js`
- Endpoint: `POST /blade-system/user/submit`

### User Update

- File: `Saber3-master/src/api/system/user.js`
- Endpoint: `POST /blade-system/user/update`

### User Detail

- File: `Saber3-master/src/api/system/user.js`
- Endpoint: `GET /blade-system/user/detail`

### User Grant

- File: `Saber3-master/src/api/system/user.js`
- Endpoint: `POST /blade-system/user/grant`

### Role List

- File: `Saber3-master/src/api/system/role.js`
- Endpoint: `GET /blade-system/role/list`

### Role Grant Tree

- File: `Saber3-master/src/api/system/role.js`
- Endpoint: `GET /blade-system/menu/grant-tree`

### Role Grant

- File: `Saber3-master/src/api/system/role.js`
- Endpoint: `POST /blade-system/role/grant`

## Mapping Guidance

Do not bind target pages directly to raw backend payloads everywhere. Create normalization functions for:

- auth session payload
- menu tree payload
- button permission payload
- user list rows
- role list rows

This reduces coupling and makes the target UI resilient if the backend field names do not match the prototype's display fields exactly.
