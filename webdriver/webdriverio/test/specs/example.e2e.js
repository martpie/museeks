// calculates the luma from a hex color `#abcdef`
function luma(hex) {
  if (hex.startsWith('#')) {
    hex = hex.substring(1);
  }

  const rgb = Number.parseInt(hex, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe('Hello Tauri', () => {
  it('should be cordial', async () => {
    const header = await $('body > h1');
    const text = await header.getText();
    expect(text).toMatch(/^[hH]ello/);
  });

  it('should be excited', async () => {
    const header = await $('body > h1');
    const text = await header.getText();
    expect(text).toMatch(/!$/);
  });

  it('should be easy on the eyes', async () => {
    const body = await $('body');
    const backgroundColor = await body.getCSSProperty('background-color');
    expect(luma(backgroundColor.parsed.hex)).toBeLessThan(100);
  });
});
