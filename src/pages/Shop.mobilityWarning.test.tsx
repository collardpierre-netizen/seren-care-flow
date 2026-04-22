/**
 * End-to-end test for the mobility-conversion warning banner on the Shop page.
 *
 * Goal: prove that when the profile holds a (valid) mobility value but the
 * profile→filter mapper produces NO tag, the user sees the non-blocking
 * warning banner — instead of a silently empty product list.
 *
 * We mock just enough of Shop's data dependencies (queries, heavy children)
 * to isolate the validation pipeline. Business logic under test
 * (`validateMobilityConversion`, `shouldWarnUser`, the `useMemo` glue inside
 * Shop) is real.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// jsdom doesn't ship ResizeObserver, but Radix's <Slider> (rendered inside
// Shop's price filter) requires it on mount. A no-op stub is enough for our
// non-visual assertions.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
    ResizeObserverStub;
}

// ---------------------------------------------------------------------------
// Mocks: data layer
// ---------------------------------------------------------------------------

// `useUserPreferences` is what feeds the validator with the raw profile value.
// `mapProfileToFilters` is the *mapper under test* — we stub it to simulate
// the failure mode where a valid enum produces no tag (regression scenario).
vi.mock('@/hooks/useUserPreferences', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useUserPreferences')>(
    '@/hooks/useUserPreferences',
  );
  return {
    ...actual,
    useUserPreferences: vi.fn(),
    mapProfileToFilters: vi.fn(),
  };
});

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({ data: [], isLoading: false }),
  useBrands: () => ({ data: [] }),
  useCategories: () => ({ data: [] }),
}));

// ---------------------------------------------------------------------------
// Mocks: heavy children we don't need to render for this test
// ---------------------------------------------------------------------------

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/shop/ProductCard', () => ({
  default: () => <div data-testid="product-card" />,
}));

vi.mock('@/components/shop/ProductQuickView', () => ({
  default: () => null,
}));

vi.mock('@/components/shop/ProductSelector', () => ({
  default: () => null,
}));

vi.mock('@/components/shop/SearchBar', () => ({
  default: () => <div data-testid="search-bar" />,
}));

// ---------------------------------------------------------------------------
// Imports must come AFTER vi.mock declarations.
// ---------------------------------------------------------------------------

import Shop from './Shop';
import {
  useUserPreferences,
  mapProfileToFilters,
} from '@/hooks/useUserPreferences';

const mockedUseUserPreferences = vi.mocked(useUserPreferences);
const mockedMapProfileToFilters = vi.mocked(mapProfileToFilters);

const renderShop = () => {
  // Each test gets its own QueryClient to avoid cross-test cache leakage.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/boutique']}>
          <Shop />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
};

describe('Shop — mobility conversion warning banner (e2e)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the warning banner when the mapper returns no mobility tag for a valid profile value', async () => {
    // Profile says "mobile" — a perfectly valid `MobilityEnum`. The validator
    // should therefore expect a corresponding tag in the filter state.
    mockedUseUserPreferences.mockReturnValue({
      data: {
        gender: null,
        mobility_level: 'mobile',
        incontinence_level: null,
        usage_time: null,
      },
      isLoading: false,
    } as ReturnType<typeof useUserPreferences>);

    // Simulate the regression: mapper produces NO mobility tag despite a
    // valid input. This is the exact scenario that previously left users
    // staring at an empty product list with no explanation.
    mockedMapProfileToFilters.mockReturnValue({
      gender: undefined,
      mobility: undefined,
      incontinenceLevel: undefined,
      usageTime: undefined,
    });

    renderShop();

    // Banner is rendered with role="alert" so screen readers announce it.
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();

    // Headline copy that the user actually reads.
    expect(alert).toHaveTextContent(/Filtre mobilité non appliqué/i);

    // Technical breadcrumbs help support diagnose the issue without leaking
    // sensitive data — must show the raw profile value and the resolved tag.
    expect(alert).toHaveTextContent(/profil = "mobile"/);
    expect(alert).toHaveTextContent(/filtre = "∅"/);

    // The structured status code is what the validator emits for this case.
    expect(alert).toHaveTextContent(/mapping_failed/);

    // Actionable CTA: link to the account page so the user can fix it.
    const cta = screen.getByRole('link', { name: /mettre à jour mon profil/i });
    expect(cta).toHaveAttribute('href', '/compte');
  });

  it('does NOT show the warning banner when the mapper resolves to a valid tag', async () => {
    mockedUseUserPreferences.mockReturnValue({
      data: {
        gender: null,
        mobility_level: 'mobile',
        incontinence_level: null,
        usage_time: null,
      },
      isLoading: false,
    } as ReturnType<typeof useUserPreferences>);

    // Healthy mapping: enum "mobile" → tag "mobile".
    mockedMapProfileToFilters.mockReturnValue({
      gender: undefined,
      mobility: 'mobile',
      incontinenceLevel: undefined,
      usageTime: undefined,
    });

    renderShop();

    // Wait for the preferences `useEffect` to flush so we know the validator
    // has had its chance to run.
    await waitFor(() => {
      expect(mockedMapProfileToFilters).toHaveBeenCalled();
    });

    // No alert should have been rendered for this healthy path.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does NOT show the warning banner when the profile has no mobility value', async () => {
    mockedUseUserPreferences.mockReturnValue({
      data: {
        gender: null,
        mobility_level: null,
        incontinence_level: null,
        usage_time: null,
      },
      isLoading: false,
    } as ReturnType<typeof useUserPreferences>);

    mockedMapProfileToFilters.mockReturnValue({
      gender: undefined,
      mobility: undefined,
      incontinenceLevel: undefined,
      usageTime: undefined,
    });

    renderShop();

    await waitFor(() => {
      expect(mockedMapProfileToFilters).toHaveBeenCalled();
    });

    // "empty" status must stay silent — no banner, no false positive.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
