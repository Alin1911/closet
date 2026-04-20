const { test, expect } = require('@playwright/test');

const closets = [
  {
    id: '65d4f1a2b3c4d5e6f7080901',
    name: 'Monochrome Layers',
    description: 'Layered neutrals for all-day comfort.',
    poster: 'https://images.example.com/closets/mono.jpg',
    images: ['https://images.example.com/closets/mono-backdrop.jpg'],
    trailerLink: 'https://www.youtube.com/watch?v=abcdefghijk',
    style: 'Minimal',
    season: 'Fall',
    color: 'Black'
  },
  {
    id: '65d4f1a2b3c4d5e6f7080902',
    name: 'Summer Pop',
    description: 'Bright looks for warmer weather.',
    poster: 'https://images.example.com/closets/summer.jpg',
    images: ['https://images.example.com/closets/summer-backdrop.jpg'],
    trailerLink: 'https://www.youtube.com/watch?v=lmnopqrstuv',
    style: 'Street',
    season: 'Summer',
    color: 'Blue'
  }
];

const favoriteCloset = closets[0];

async function mockApi(page) {
  let activeToken = 'stale-access-token';
  let refreshCalls = 0;
  let favoriteSet = new Set();
  let coatNotes = [{ id: '75d4f1a2b3c4d5e6f7080901', name: 'Closet note', description: 'Try oversized blazer.', images: [] }];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname, searchParams } = url;
    const method = request.method();
    const json = (body, status = 200, headers = {}) => route.fulfill({
      status,
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });

    if (pathname === '/api/v1/closets' && method === 'GET') {
      const q = (searchParams.get('q') || '').toLowerCase();
      const filtered = q ? closets.filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) : closets;
      return json(filtered, 200, {
        'x-total-pages': '1',
        'x-total-count': String(filtered.length),
        'x-facet-styles': JSON.stringify({ Minimal: 1, Street: 1 }),
        'x-facet-seasons': JSON.stringify({ Fall: 1, Summer: 1 }),
        'x-facet-colors': JSON.stringify({ Black: 1, Blue: 1 })
      });
    }

    if (pathname === `/api/v1/closets/${favoriteCloset.id}` && method === 'GET') {
      return json(favoriteCloset);
    }

    if (pathname === `/api/v1/closets/${favoriteCloset.id}/coats` && method === 'GET') {
      return json(coatNotes);
    }

    if (pathname === `/api/v1/closets/${favoriteCloset.id}/coats` && method === 'POST') {
      const payload = request.postDataJSON();
      const created = {
        id: '75d4f1a2b3c4d5e6f7080902',
        name: payload.name,
        description: payload.description,
        images: payload.images || []
      };
      coatNotes = [...coatNotes, created];
      return json({ message: 'Item note created.', data: created }, 201);
    }

    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      favoriteSet = new Set();
      return json({
        message: 'Login successful.',
        data: {
          userId: '65d4f1a2b3c4d5e6f7080999',
          email: 'user@example.com',
          displayName: 'E2E User',
          favoriteClosetIds: [],
          token: activeToken,
          refreshToken: 'refresh-token-1'
        }
      });
    }

    if (pathname === '/api/v1/auth/refresh' && method === 'POST') {
      refreshCalls += 1;
      activeToken = `fresh-access-token-${refreshCalls}`;
      return json({
        message: 'Session refreshed.',
        data: {
          userId: '65d4f1a2b3c4d5e6f7080999',
          email: 'user@example.com',
          displayName: 'E2E User',
          favoriteClosetIds: [...favoriteSet],
          token: activeToken,
          refreshToken: 'refresh-token-2'
        }
      });
    }

    if (pathname === '/api/v1/users/65d4f1a2b3c4d5e6f7080999/favorites' && method === 'GET') {
      const savedClosets = closets.filter((item) => favoriteSet.has(item.id));
      return json(savedClosets);
    }

    if (pathname === `/api/v1/users/65d4f1a2b3c4d5e6f7080999/favorites/${favoriteCloset.id}` && method === 'PUT') {
      const authHeader = request.headers().authorization;
      if (authHeader === 'Bearer stale-access-token') {
        return json({ message: 'Unauthorized' }, 401);
      }
      favoriteSet.add(favoriteCloset.id);
      return json({
        message: 'Closet saved.',
        data: {
          userId: '65d4f1a2b3c4d5e6f7080999',
          email: 'user@example.com',
          displayName: 'E2E User',
          favoriteClosetIds: [...favoriteSet],
          token: activeToken,
          refreshToken: 'refresh-token-2'
        }
      });
    }

    return route.fulfill({ status: 404, body: 'Not found in test mock' });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('supports cross-page browsing journey with closet details, coats, and trailer', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Continue browsing' })).toBeVisible();
  await page.getByRole('button', { name: 'View details' }).first().click();

  await expect(page).toHaveURL(`/closets/${favoriteCloset.id}`);
  await expect(page.getByRole('heading', { name: favoriteCloset.name })).toBeVisible();

  await page.getByRole('button', { name: 'View items' }).click();
  await expect(page).toHaveURL(`/coats/${favoriteCloset.id}`);

  await page.getByLabel('Add item note').fill('Pack a denim jacket for cooler evenings.');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Pack a denim jacket for cooler evenings.')).toBeVisible();

  await page.getByRole('button', { name: 'Closet details' }).click();
  await page.getByRole('button', { name: 'Watch lookbook' }).click();
  await expect(page).toHaveURL('/trailer/abcdefghijk');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Continue browsing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: favoriteCloset.name })).toBeVisible();
});

test('refreshes session token on 401 and completes save flow', async ({ page }) => {
  await page.goto('/profile?mode=login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.locator('form').getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Login successful.').first()).toBeVisible();

  await page.goto('/browse');
  await page.getByRole('button', { name: 'Save closet' }).first().click();

  await expect(page.getByText('Closet saved.').first()).toBeVisible();
  await page.goto('/saved');
  await expect(page.getByRole('heading', { name: 'Saved closets' })).toBeVisible();
  await expect(page.getByText(favoriteCloset.name).first()).toBeVisible();
});
