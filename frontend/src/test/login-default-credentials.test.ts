import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LoginView } from '../views/Login';

describe('LoginView local smoke defaults', () => {
  it('uses the seeded local admin credentials in the prefilled form', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LoginView, {
        onLogin: vi.fn(async () => {}),
        loading: false,
        error: null,
      }),
    );

    expect(markup).toContain('autoComplete="username" value="admin"');
    expect(markup).toContain('autoComplete="current-password" value="admin"');
  });
});
