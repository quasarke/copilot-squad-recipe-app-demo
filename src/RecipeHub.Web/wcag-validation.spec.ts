import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * WCAG 2.2 Level AA rendered UI validation.
 *
 * This catches failures that static CSS inspection missed, including REGR-1:
 * Cook Mode instruction text inheriting a low-contrast foreground on a light card.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const MIN_TEXT_CONTRAST = 4.5;

type Rgb = { r: number; g: number; b: number; a: number };

function parseRgb(value: string): Rgb {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) {
    throw new Error(`Unsupported color format: ${value}`);
  }

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function channelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function luminance(color: Rgb): number {
  return (
    0.2126 * channelToLinear(color.r) +
    0.7152 * channelToLinear(color.g) +
    0.0722 * channelToLinear(color.b)
  );
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

async function renderedColors(locator: Locator): Promise<{
  color: string;
  backgroundColor: string;
  ratio: number;
}> {
  const styles = await locator.evaluate((element) => {
    const color = window.getComputedStyle(element).color;
    let current: Element | null = element;
    let backgroundColor = 'rgb(255, 255, 255)';

    while (current) {
      const candidate = window.getComputedStyle(current).backgroundColor;
      if (!candidate.includes('rgba(0, 0, 0, 0)') && candidate !== 'transparent') {
        backgroundColor = candidate;
        break;
      }
      current = current.parentElement;
    }

    return { color, backgroundColor };
  });

  return {
    ...styles,
    ratio: contrastRatio(parseRgb(styles.color), parseRgb(styles.backgroundColor)),
  };
}

async function expectReadable(locator: Locator, label: string): Promise<void> {
  await expect(locator).toBeVisible();
  const colors = await renderedColors(locator);
  console.log(
    `${label} - Text: ${colors.color}, BG: ${colors.backgroundColor}, Contrast: ${colors.ratio.toFixed(2)}:1`,
  );
  expect(colors.ratio, `${label} contrast`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
}

async function gotoPath(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');
}

test.describe('WCAG 2.2 Accessibility Validation', () => {
  test('REGR-1: Cook Mode instruction text is readable in light and dark preferences', async ({
    page,
  }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await gotoPath(page, '/recipes/2/cook');

      const instructionText = page.getByText(
        'Whisk flour, sugar, baking powder, baking soda, and salt in a large bowl.',
        { exact: true },
      );

      await expectReadable(instructionText, `Cook Mode instruction (${colorScheme})`);
      await page.screenshot({
        path: `test-results/wcag-cook-mode-${colorScheme}.png`,
        fullPage: true,
      });
    }
  });

  test('Navigation header links are readable', async ({ page }) => {
    await gotoPath(page, '/');

    await expectReadable(page.getByRole('link', { name: 'RecipeHub' }), 'Brand link');
    await expectReadable(
      page.getByRole('link', { name: 'Recipes', exact: true }),
      'Recipes nav link',
    );
  });

  test('Recipe cards have readable title, description, and metadata', async ({ page }) => {
    await gotoPath(page, '/recipes');

    await expect(page.getByRole('button', { name: /Classic Margherita Pizza/ })).toBeVisible();
    await expectReadable(
      page.getByText('Classic Margherita Pizza', { exact: true }),
      'Recipe card title',
    );
    await expectReadable(
      page.getByText(/A Neapolitan classic: blistered crust/),
      'Recipe card description',
    );
    await expectReadable(page.getByText(/Prep 30m.*Cook 15m/), 'Recipe card metadata');

    await page.screenshot({ path: 'test-results/wcag-recipe-cards.png', fullPage: true });
  });

  test('Primary, secondary, and disabled buttons are readable', async ({ page }) => {
    await gotoPath(page, '/');
    await expectReadable(page.getByRole('button', { name: 'Browse Recipes' }), 'Primary button');

    await gotoPath(page, '/recipes/2');
    await expect(page.getByRole('heading', { name: 'Fluffy Pancakes' })).toBeVisible();
    await expectReadable(page.getByRole('button', { name: 'Cook Mode' }), 'Secondary button');

    await gotoPath(page, '/recipes/2/cook');
    await expectReadable(page.getByRole('button', { name: 'Previous step' }), 'Disabled button');
  });

  test('Form labels are readable', async ({ page }) => {
    await gotoPath(page, '/recipes/new');

    await expectReadable(page.getByText('Title *', { exact: true }), 'Form title label');
  });

  test('Error messages have sufficient contrast', async ({ page }) => {
    await gotoPath(page, '/recipes/new');

    await page.getByRole('button', { name: /create recipe/i }).click();
    const errorMsg = page.getByText(/required/i).first();

    await expectReadable(errorMsg, 'Required-field error message');
  });
});
