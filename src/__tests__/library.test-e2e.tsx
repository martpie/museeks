import { describe, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { app } from '../main';

describe('Museeks E2E Tests', () => {
  test('renders the main app', async () => {
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'development',
      },
    });
    vi.stubEnv('NODE_ENV', 'development');

    vi.mock('../lib/bridge-config');
    // process.env.NODE_ENV
    // vi.mock('@lingui/core/macro/index.js');
    // vi.mock('@lingui/react/macro');
    render(app);
  });
});
