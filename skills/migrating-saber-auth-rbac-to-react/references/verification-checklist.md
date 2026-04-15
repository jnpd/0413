# Verification Checklist

Do not claim the migration is complete until these checks have been run or explicitly marked blocked.

## Auth

- login succeeds with real API
- invalid credentials show backend error
- token persists across refresh
- refresh token flow replays the failed request
- repeated concurrent `401` responses do not trigger repeated refresh calls
- logout clears session and returns to login
- if a local dev proxy is used, verify the same auth request succeeds through the proxy path, not only when calling the backend directly

## Bootstrap

- app startup fetches user info
- app startup fetches top menu
- app startup fetches dynamic route/menu tree
- app startup fetches button permissions
- if top menus are empty, verify whether a blank `topMenuId` route fetch still returns navigation data

## Navigation

- sidebar items come from backend menu data
- the first accessible page can be opened after login
- inaccessible routes are blocked or hidden
- reload on a protected route restores access correctly

## Permissions

- action buttons are hidden or disabled according to permission codes
- menu visibility changes with different permission sets
- user management actions respect permission helpers
- role management actions respect permission helpers

## Personnel And Role Pages

- user list loads from backend
- role list loads from backend
- detail/edit flows use real endpoints
- empty/loading/error states are handled

## Cleanup

- fake login path removed
- static sidebar source of truth removed
- mock user and role arrays removed from migrated pages
- final response lists commands run and blockers, if any
