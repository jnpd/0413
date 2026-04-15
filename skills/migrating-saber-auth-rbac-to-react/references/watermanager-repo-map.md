# WaterManger Repo Map

This reference captures the current repo reality for the WaterManger workspace.

## Default Paths

- Source: `E:\work\WaterManger\Saber3-master`
- Target: `E:\work\WaterManger\frontEnd`

## Source Repo: `Saber3-master`

The source repo already contains the backend integration substrate that should be ported conceptually into React.

### Auth And Request Layer

- `src/axios.js`
  - adds base URL
  - injects basic auth header
  - injects bearer token
  - supports encrypted token/data modes
  - handles `401`
  - uses a refresh lock so multiple `401` responses do not trigger multiple refresh calls
  - retries the failed request after refresh succeeds
- `src/api/user.js`
  - login: `/blade-auth/oauth/token`
  - refresh: `/blade-auth/oauth/token`
  - logout: `/blade-auth/oauth/logout`
  - user info: `/blade-auth/oauth/user-info`
  - button permissions: `/blade-system/menu/buttons`
- `src/page/login/userlogin.vue`
  - source login is not only username/password
  - default flow also carries `tenantId`
  - default flow fetches captcha via `/blade-auth/oauth/captcha`
  - source login encrypts the password with SM2 before calling the auth endpoint
  - target React login must account for tenant and captcha requirements instead of assuming a two-field form is enough
- `src/store/modules/user.js`
  - stores token and refresh token
  - bootstraps user info
  - fetches top menu, route tree, and button permissions

### Menu, Route, Permission Layer

- `src/permission.js`
  - route guard
  - login redirect
  - lock handling
  - tag management
- `src/router/avue-router.js`
  - converts backend menus into dynamic routes
  - handles iframe route cases
  - mutates menu nodes into router-compatible data
- `src/api/system/menu.js`
  - top menu: `/blade-system/menu/top-menu`
  - routes: `/blade-system/menu/routes`
  - CRUD and tree helpers for menu management
- `src/page/index/top/top-menu.vue` + `src/page/index/index.vue`
  - source menu loading is two-stage
  - first fetch top menus
  - then fetch the route tree with `topMenuId`
  - target React navigation should not assume one flat menu endpoint is enough

### Personnel / Role APIs

- `src/api/system/user.js`
  - page list: `/blade-system/user/page`
  - submit, update, detail, grant, reset-password, unlock, and related endpoints
- `src/api/system/role.js`
  - list: `/blade-system/role/list`
  - grant tree: `/blade-system/menu/grant-tree`
  - grant: `/blade-system/role/grant`
  - role tree helpers
- `src/option/system/user.js`
  - source user create/edit is not a flat form
  - it depends on tenant selection, user platform dictionary, role tree, dept tree, post options, and leader options
  - multi-select fields such as `roleId`, `deptId`, `postId`, and `leaderId` are joined before submit
  - target React migrations should treat user edit as a workflow with dependent dictionaries, not a trivial two-field modal

## Target Repo: `frontEnd`

The target repo is a React + Vite + TypeScript prototype with real UI but no real integration substrate yet.

### Current Structural Gaps

- `package.json`
  - no `axios`
  - no `react-router-dom`
- `src/App.tsx`
  - uses `isLoggedIn` local state instead of real auth bootstrap
  - uses `currentView` local state instead of route-based navigation
- `src/views/Login.tsx`
  - form submission uses `setTimeout`
  - no real API call
  - no token persistence
- `src/components/Sidebar/menuConfig.ts`
  - menu is static and local
  - no backend menu binding
- `src/views/Permissions.tsx`
  - `mockUsers`
  - `mockRoles`
  - static enterprise/user/role rendering

### Migration Implications

The target must gain these foundational pieces before page-level integration can be stable:

- real HTTP client
- auth/token storage
- session bootstrap
- route system
- backend menu to UI menu adapter
- button permission helper

## Practical Meaning For The Migration

Do not attempt a shallow copy of API files alone. The migration must rebuild a closed integration loop:

1. login succeeds
2. token and refresh token persist
3. app bootstraps user info
4. top menu and route tree load
5. sidebar renders from backend data
6. route access and action visibility obey permissions
7. user and role pages fetch real data

## Known Integration Gotchas

- The source frontend defaults `tenantMode=true` and `captchaMode=true`. If the target login omits tenant or captcha handling, real login may fail even though the endpoint wiring looks correct.
- The source login uses SM2 encryption for the password. If the target sends plaintext to `/blade-auth/oauth/token`, auth can still fail even when every other header is correct.
- In this WaterManger local environment, the backend is reachable at `http://localhost:8090` without an `/api` prefix. If the React dev server proxies `/api/*`, it must rewrite the prefix away before forwarding.
- The source request client adds `Blade-Requested-With: BladeHttpRequest` and `Accept-Language`. Some protected backend endpoints may still reject requests if these source-side semantics are not preserved.
- The local backend can accept `grant_type=password` with SM2-encrypted password even though the source frontend defaults to captcha login. Verify the live backend contract before forcing captcha on the target.
- The source navigation model is `top menu -> route tree -> sidebar`, not a single static sidebar list. If the target has only one sidebar, it still needs a deliberate strategy for selecting a top menu and loading its route tree.
- The local backend may return an empty `top-menu` list while still returning a valid route tree from `/blade-system/menu/routes` when `topMenuId` is blank. Target bootstrapping must handle this fallback instead of assuming empty top menus means empty navigation.
- The React prototype has business pages that may not yet exist in the backend menu configuration. Use backend menus as the primary source for system pages, but document any prototype pages that still rely on local registration until backend menu data exists for them.
