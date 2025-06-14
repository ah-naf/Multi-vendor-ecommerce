import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SellerDashboard from '../page'; // Adjust path as necessary
import { AuthContext, AuthContextType } from '@/context/AuthContext';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock Recharts components as they can be problematic in JSDOM and are not the focus of these tests
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Bar: () => <div data-testid="bar" />,
  };
});


const mockAuthContextValue: AuthContextType = {
  user: { id: 'seller123', firstName: 'Seller', lastName: 'Test', email: 'seller@example.com', roles: ['seller'] },
  token: 'fake-seller-jwt-token',
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  showLoginModal: false,
  setShowLoginModal: jest.fn(),
};

const renderSellerDashboard = (authValue = mockAuthContextValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <SellerDashboard />
    </AuthContext.Provider>
  );
};

describe('SellerDashboard Page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('renders welcome message with seller name and today\'s sales', async () => {
    renderSellerDashboard();
    // MSW handler for sales-data?period=today returns { totalSales: 5500 }
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Seller!/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/You've made \$5,500 today./i)).toBeInTheDocument();
    });
  });

  test('fetches and displays sales data for Today and Month cards', async () => {
    renderSellerDashboard();
    // Today's Sales (mocked as 5500 in handlers.ts, but the component fetches it specifically)
    // The default handler for period=today is the same as period=month (5500) in the current mock.
    // Let's refine the mock for today specifically for this test.
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/seller/dashboard/sales-data`, async ({ request }) => {
        const url = new URL(request.url);
        const period = url.searchParams.get('period');
        if (period === 'today') {
          return HttpResponse.json({ period: 'today', totalSales: 2450, totalOrdersCount: 10 });
        }
        if (period === 'month') {
          return HttpResponse.json({ period: 'month', totalSales: 45670, totalOrdersCount: 150 });
        }
        return HttpResponse.json({ period: period, totalSales: 1000, totalOrdersCount: 5 });
      })
    );

    await waitFor(() => {
      // Sales Today card
      expect(screen.getByText('Sales Today')).toBeInTheDocument();
      expect(screen.getByText('$2,450')).toBeInTheDocument();
    });
    await waitFor(() => {
      // Sales This Month card
      expect(screen.getByText('Sales This Month')).toBeInTheDocument();
      expect(screen.getByText('$45,670')).toBeInTheDocument();
    });
     // Performance is placeholder "N/A"
    const performanceElements = screen.getAllByText('Performance N/A');
    expect(performanceElements.length).toBeGreaterThanOrEqual(2); // For Today and Month cards
  });

  test('fetches and displays order status counts', async () => {
    renderSellerDashboard();
    // Mock handler returns: { Pending: 5, Processing:10, Shipped: 15, Delivered: 20, Cancelled: 2 }
    await waitFor(() => {
      expect(screen.getByText('Orders Status')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getAllByText('5')[0]).toBeInTheDocument(); // Pending count
      expect(screen.getByText('Shipped')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument(); // Shipped count
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument(); // Delivered count
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Cancelled count
      // Could also check for Processing if it's added to the UI explicitly
    });
  });

  test('fetches and displays low stock product count', async () => {
    renderSellerDashboard();
    // Mock handler returns { lowStockProductCount: 3, threshold: 5 }
    await waitFor(() => {
      expect(screen.getByText(/You have 3 products running low/i)).toBeInTheDocument();
      expect(screen.getByText(/threshold: 5/i)).toBeInTheDocument();
    });
  });

  test('displays placeholder message for revenue trend chart (as backend is placeholder)', async () => {
    renderSellerDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Revenue Trend \(Monthly - Placeholder Data\)/i)).toBeInTheDocument();
      // Check if recharts components are rendered (as per our mock)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  test('handles API error for order status counts gracefully', async () => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/seller/dashboard/order-status-counts`, () => {
        return new HttpResponse(null, { status: 500, statusText: 'Server Error' });
      })
    );
    renderSellerDashboard();
    await waitFor(() => {
      expect(screen.getByText('Orders Status')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load order statuses/i)).toBeInTheDocument();
    });
  });

  test('displays correct message when no products are low on stock', async () => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/seller/dashboard/low-stock-count`, () => {
        return HttpResponse.json({ lowStockProductCount: 0, threshold: 5 });
      })
    );
    renderSellerDashboard();
    await waitFor(() => {
        expect(screen.getByText(/No products are currently below the low stock threshold \(5\)/i)).toBeInTheDocument();
    });
  });

});
