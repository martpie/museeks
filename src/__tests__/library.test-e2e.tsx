import { page } from '@vitest/browser/context';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

test('renders hello world', async () => {
  await page.viewport(900, 500);
  render(<div>hello world</div>);
  expect(page.getByText('hello world')).toBeVisible();
});
