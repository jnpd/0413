# Migration Playbook

Use this playbook when executing the migration.

## Phase 1: Establish Infrastructure

Add the minimum missing target infrastructure:

- HTTP client with interceptors
- token and refresh token storage helpers
- auth bootstrap on app start
- route system
- menu adapter
- permission helpers

Done means:

- the app can restore an existing session on reload
- a failed authenticated request can refresh once and replay
- logout clears all auth state

## Phase 2: Replace Static Navigation

Replace local-view navigation with router navigation.

Tasks:

- fetch top menus first
- decide which `topMenuId` is active
- introduce route objects for current prototype pages
- create backend menu to route mapping
- generate sidebar items from the mapped backend menu
- guard routes based on auth and permission state
- if `top-menu` is empty, explicitly test whether `/blade-system/menu/routes` with blank `topMenuId` still returns usable navigation data before concluding the backend has no menus

Done means:

- `currentView` is no longer the navigation source of truth
- sidebar data is no longer hardcoded in `menuConfig.ts`
- dynamic routes are loaded after auth bootstrap
- route loading respects the source system's two-stage `top-menu -> routes(topMenuId)` flow

## Phase 3: Replace Fake Login

Replace mocked login with real auth behavior.

Tasks:

- fetch captcha when the source auth contract requires it
- include tenant context when the source auth contract requires it
- submit credentials to the source auth endpoint contract
- persist token and refresh token
- fetch user info after login
- fetch top menu, route tree, and button permissions
- redirect to the first accessible route

Done means:

- the login page no longer uses `setTimeout`
- reload after login preserves session
- login failure shows backend error instead of silent success
- local dev proxy path and header behavior match the live backend well enough that login works from the React app, not just from direct backend curls

## Phase 4: Replace Mock Permission Pages

Replace page-local mock data with real API-backed data.

Priority pages for WaterManger:

1. personnel management
2. role management
3. menu and permission-related panels

Tasks:

- remove `mockUsers`
- remove `mockRoles`
- wire page list/detail/create/update flows
- gate action buttons with permission helpers
- for menu management, preserve the source system's lazy tree loading model instead of flattening everything into one fake page

Done means:

- the page renders backend data
- actions respect button permissions
- pagination and filters use the backend contract

## Phase 5: Document Gaps Explicitly

Document any mismatch between backend routes and target pages.

Examples:

- backend menu entry has no React page
- target page needs fields not returned by current API
- backend role tree format needs extra normalization

Never hide these mismatches. Surface them in the final response.
