import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CustomerDashboardOverview from '../page'; // Adjust path if your file structure is different
import { AuthContext, AuthContextType } from '@/context/AuthContext'; // Assuming AuthContext path
import { server } from '@/mocks/server'; // MSW server
import { http, HttpResponse } from 'msw'; // For overriding handlers if needed

// Mock Next.js Link component as it's not relevant to these tests
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    // Add other router methods if used by the component
  }),
  // Add other navigation exports if used
}));


const mockAuthContextValue: AuthContextType = {
  user: {
    id: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    roles: ['customer'],
    // other fields if your User type has them
  },
  token: 'fake-jwt-token',
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  showLoginModal: false,
  setShowLoginModal: jest.fn(),
};

const renderDashboard = (authValue = mockAuthContextValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <CustomerDashboardOverview />
    </AuthContext.Provider>
  );
};

describe('CustomerDashboardOverview Page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('renders welcome message with user name', async () => {
    renderDashboard();
    // Wait for data to load if necessary, though welcome message might appear before API calls complete
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });
  });

  test('displays loading states initially for stats', () => {
    renderDashboard();
    // Check for loading indicators in stat cards.
    // The StatCardLoading component uses "Loading..." text and a Loader2 icon.
    // There are 3 stat cards.
    expect(screen.getAllByText(/Loading.../i).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByTestId('loader2-icon').length).toBeGreaterThanOrEqual(3); // Assuming you add data-testid="loader2-icon" to Loader2
  });

  test('fetches and displays total orders', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      // Mock handler returns { totalOrders: 10 }
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  test('fetches and displays wishlist items count', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Wishlist')).toBeInTheDocument();
      // Mock handler returns { wishlistItemsCount: 5 }
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('fetches and displays total spent', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      // Mock handler returns { totalSpent: 1250.75 }
      expect(screen.getByText('$1,250.75')).toBeInTheDocument(); // Check formatting
    });
  });

  test('fetches and displays recent orders', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Recent Order History')).toBeInTheDocument();
      // Mock handler returns one recent order
      expect(screen.getByText(/#ORD123/i)).toBeInTheDocument();
      expect(screen.getByText('$75.50')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  test('fetches and displays active order details', async () => {
    renderDashboard();
    await waitFor(() => {
      // Mock handler returns activeOrder: { id: 'ORD456', status: 'Shipped', estimatedDelivery: 'Tomorrow' }
      expect(screen.getByText(/Order #ORD456 is shipped./i)).toBeInTheDocument();
      expect(screen.getByText('Tomorrow')).toBeInTheDocument(); // Estimated delivery
    });
  });

  test('handles API error for one of the stats gracefully', async () => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/customer/dashboard/total-orders`, () => {
        return new HttpResponse(null, { status: 500, statusText: 'Server Error' });
      })
    );
    renderDashboard();
    await waitFor(() => {
      // Check that the specific stat card shows an error or '-'
      // The component shows '-' for totalOrders if null.
      // Also, an error message "Failed to load: Total Orders" should appear in the errorStats state,
      // which results in the StatCardError component being rendered for the combined stats.
      expect(screen.getByText(/Failed to load: Total Orders/i)).toBeInTheDocument();
      // Other stats should still load
      expect(screen.getByText('Wishlist')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Wishlist count
    });
  });

  test('displays message when no active order is found', async () => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/customer/dashboard/active-order`, () => {
        return HttpResponse.json({ activeOrder: null });
      })
    );
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/No Active Orders/i)).toBeInTheDocument();
      expect(screen.getByText(/You have no orders currently being processed or shipped./i)).toBeInTheDocument();
    });
  });

});

// Add data-testid="loader2-icon" to the Loader2 component in page.tsx for the loading test to pass
// Example: <Loader2 data-testid="loader2-icon" className="h-5 w-5 text-gray-400 animate-spin" />
// And similarly for the one in StatCardLoading.
// The test "displays loading states initially for stats" might be tricky if data loads too fast.
// Consider specific loading states for each card if more granular testing is needed.
