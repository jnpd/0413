---
name: migrating-saber-auth-rbac-to-react
description: Use when migrating an existing frontend's login, token refresh, request wrapper, dynamic menu, dynamic route, button permission, or user-role-menu API integration into a React or Vite frontend that still relies on mock data, local view state, or static menus, especially when the source is a Saber or Blade-style project.
---

# Migrating Saber Auth And RBAC To React

## Overview

Use this skill when the user needs a working migration, not a high-level suggestion. The source project already contains mature auth and RBAC behavior. The target project already contains the UI prototype. Your job is to preserve the target UI while rebuilding the missing integration substrate in React.

This skill is for capability migration:

- Port auth, token refresh, menu, route, and permission behavior.
- Rebuild those capabilities in the target framework.
- Do not copy Vue, Vuex, Avue, or `.vue` implementation patterns verbatim into React.

For the WaterManger workspace, read these references first:

1. `references/watermanager-repo-map.md`
2. `references/api-surface.md`
3. `references/migration-playbook.md`
4. `references/verification-checklist.md`

## When To Use

Use this skill when the user mentions any of these conditions:

- "把已有项目的接口层迁到新前端"
- "接入登录、token、刷新token"
- "接入动态菜单、动态路由"
- "接入按钮权限、角色权限、人员接口"
- "原型图/静态页面/React 页面现在都是 mock 数据"
- "source 项目已经有完整请求封装和权限体系"

Do not use this skill for a normal greenfield frontend that has no existing source system to borrow from.

## Core Rules

1. Audit source and target first.
2. Port behavior, not framework code.
3. Keep the target UI structure and interaction style unless the user asks for redesign.
4. Add only the minimum new dependencies needed to support the migrated behavior.
5. Replace mock data only after the target page has a stable API contract.
6. Never leave auth half-migrated. Login, bootstrap, refresh, logout, menu load, and permission checks must form one closed loop.

## Default WaterManger Assumptions

If these paths exist, use them without asking:

- Source repo: `E:\work\WaterManger\Saber3-master`
- Target repo: `E:\work\WaterManger\frontEnd`

Treat the source repo as the integration donor and the target repo as the UI recipient.

## Required Migration Order

Follow this order unless the user explicitly overrides it.

### 1. Baseline Inventory

Confirm:

- which auth endpoints exist
- how tokens are stored
- how refresh is triggered
- how user info is bootstrapped
- how menu trees are fetched
- how button permissions are fetched
- which target pages still use mock data
- whether the target has routing and request infrastructure

For WaterManger, the repo map already captures this baseline.

### 2. Rebuild The Target Integration Substrate

If the target lacks these pieces, add them before page wiring:

- HTTP client with interceptors and refresh queue
- token storage helpers
- auth/session bootstrap layer
- route system
- menu normalization layer
- permission helper layer

Preferred target shape:

- `src/api/` for endpoint wrappers
- `src/lib/http/` or `src/services/http/` for client setup
- `src/auth/` for token/session/bootstrap
- `src/router/` for route manifest and dynamic route building
- `src/permissions/` for button/menu permission helpers

If the target currently uses local state for navigation, replace that with a real router before attempting dynamic routes.

### 3. Create An Explicit Menu And Route Adapter

Never assume the backend menu tree can render directly into the target UI.

Build a mapping layer that converts backend menu records into:

- React routes
- sidebar groups/items
- page component bindings
- hidden/disabled states driven by permissions

If a backend route has no matching React page, do not silently drop it. Record the gap and either:

- map it to a placeholder route with a clear label, or
- document it as intentionally unsupported

### 4. Port Auth As A Full Lifecycle

The auth lifecycle must include:

- login request
- token persistence
- refresh token persistence
- bootstrap on app load
- user info fetch
- logout
- 401 handling
- one-flight refresh logic

If the source uses custom headers like tenant, dept, role, captcha, or basic auth headers, preserve that request contract in the target client.

### 5. Port Permission Behavior

Port both:

- route/menu-level permission filtering
- button/action-level permission filtering

If the backend exposes a button permission dictionary or list, convert it into a target-side helper such as:

- `hasPermission(code)`
- `canAccessMenu(code)`
- `filterMenuTree(tree, permissions)`

### 6. Replace Mock Pages In Priority Order

Replace target mock data in this order:

1. login page
2. app bootstrap and navigation shell
3. permissions / user / role / menu related pages
4. remaining business pages

For WaterManger, the static `Permissions` view is in scope immediately because the user explicitly requested personnel, role, menu, token, refresh, button permissions, dynamic routes, and dynamic menus.

## Framework Translation Rules

Apply these rules when moving from Saber/Blade to React:

- Vuex state becomes React context, reducer, or a small target-appropriate store.
- Axios interceptors can be ported nearly one-to-one, but rewrite them in target structure.
- Dynamic Vue routes become React route objects plus lazy component mapping.
- Avue-specific menu metadata must be normalized; do not leak Avue assumptions into target UI components.
- Button permissions should become plain utility checks, not framework directives.

## Guardrails

Do not do any of the following:

- copy `.vue` files into the target repo
- preserve `setTimeout` fake login after real auth exists
- keep static sidebar config as the source of truth after dynamic menu support is added
- keep `mockUsers` or `mockRoles` for pages that are explicitly in migration scope
- implement refresh without replaying the failed request
- refresh on every 401 independently without a shared lock or queue

## Delivery Contract

When using this skill, the final response must include:

- what source capabilities were migrated
- what target files were added or changed
- which backend endpoints were wired
- what gaps still require business confirmation
- what verification was actually run

Do not claim the migration is complete without running the verification checklist.

## WaterManger-Specific Notes

For this workspace, assume these repo facts unless the code has changed:

- the source repo already owns auth, refresh, menu, buttons, user, role, and menu APIs
- the target repo currently uses local component state and static menu config
- the target repo currently has no real request layer
- the target login flow is still mocked

Read `references/watermanager-repo-map.md` before editing code so you do not rediscover the same facts from scratch.

## Example Triggers

Example 1:

User: "把 Saber3-master 的登录、token 刷新、动态菜单、按钮权限接到 frontEnd"

Use this skill.

Example 2:

User: "这个 React 原型图要接上旧系统的人员、角色、菜单接口"

Use this skill.

Example 3:

User: "现在菜单是写死的，登录也是假的，要复用现成后台接口体系"

Use this skill.
