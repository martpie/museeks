import { describe, expect, it } from 'safetest/vitest';
import { render } from 'safetest/react';

// Whole App testing
describe('App', () => {
  it('renders without crashing', async () => {
    const { page } = await render();
    await expect(page.locator('text=Welcome to The App')).toBeVisible();
  });
});

// // Component testing
// describe('Header', () => {
//   it('renders without crashing', async () => {
//     const { page } = await render(<Header />);
//     await expect(page.locator('text=Logout')).toBeVisible();
//     expect(await page.screenshot()).toMatchImageSnapshot();
//   });
// });
