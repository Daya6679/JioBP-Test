/**
 * Starter test suite for the JioBP portal.
 *
 * The root page.tsx redirects immediately, so we test basic utility logic here.
 * Add more test files alongside each feature as the project grows:
 *   - app/components/__tests__/
 *   - lib/__tests__/
 *   - models/__tests__/
 */

describe('JioBP Portal — smoke tests', () => {
  it('sanity check: Jest + @testing-library/jest-dom are set up correctly', () => {
    // Create a DOM element and assert using jest-dom matchers
    const div = document.createElement('div');
    div.textContent = 'JioBP Portal';
    document.body.appendChild(div);

    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('JioBP Portal');

    document.body.removeChild(div);
  });

  it('environment is correct', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
