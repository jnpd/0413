import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LoginView } from '../views/Login';

describe('LoginView', () => {
  it('renders the animated wave path with an explicit initial d attribute', () => {
    const markup = renderToStaticMarkup(
      <LoginView
        onLogin={vi.fn(async () => {})}
        loading={false}
        error={null}
      />,
    );

    expect(markup).toContain('<path');
    expect(markup).toMatch(/<path[^>]* d=\"M0,160L48,176/);
  });
});
