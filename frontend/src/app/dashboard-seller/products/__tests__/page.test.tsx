import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // For more advanced user interactions
import ProductsPage from '../page'; // Adjust path if your file structure is different
import { AuthContext, AuthContextType } from '@/context/AuthContext';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw'; // For overriding handlers
import { toast } from 'sonner'; // To check for toast messages

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Next.js router
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));


const mockAuthContextValue: AuthContextType = {
  user: { id: 'seller123', firstName: 'Seller', lastName: 'ProductTest', email: 'sellerprod@example.com', roles: ['seller'] },
  token: 'fake-seller-jwt-token',
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  showLoginModal: false,
  setShowLoginModal: jest.fn(),
};

const renderProductsPage = (authValue = mockAuthContextValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <ProductsPage />
    </AuthContext.Provider>
  );
};

const mockInitialProducts = [
  { id: 'P1', general: { title: 'Test Product Alpha', images: ['/img1.jpg'], category: 'Elec' }, inventory: { sku: 'TPA', quantity: 10 }, pricing: { price: 100, salePrice: 90 } },
  { id: 'P2', general: { title: 'Test Product Beta', images: ['/img2.jpg'], category: 'Books' }, inventory: { sku: 'TPB', quantity: 5 }, pricing: { price: 20, salePrice: 20 } },
];

const mockSearchedProducts = [
  { id: 'P1', general: { title: 'Test Product Alpha', images: ['/img1.jpg'], category: 'Elec' }, inventory: { sku: 'TPA', quantity: 10 }, pricing: { price: 100, salePrice: 90 } },
];


describe('Seller ProductsPage - Search Functionality', () => {
  beforeEach(() => {
    // Reset mocks for each test
    jest.clearAllMocks();
    // Default handler for initial load (all products)
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/seller/products`, ({request}) => {
         const url = new URL(request.url);
         const searchTerm = url.searchParams.get('search');
         if (searchTerm === 'Alpha') {
            return HttpResponse.json(mockSearchedProducts);
         }
         if (!searchTerm || searchTerm === "") {
            return HttpResponse.json(mockInitialProducts);
         }
         return HttpResponse.json([]); // Default empty for other searches
      })
    );
  });


  test('renders products list initially', async () => {
    renderProductsPage();
    await waitFor(() => {
      expect(screen.getByText('Test Product Alpha')).toBeInTheDocument();
      expect(screen.getByText('Test Product Beta')).toBeInTheDocument();
    });
  });

  test('allows user to type in search input', async () => {
    renderProductsPage();
    const searchInput = screen.getByPlaceholderText(/Search by product name.../i);
    await userEvent.type(searchInput, 'Alpha');
    expect(searchInput).toHaveValue('Alpha');
  });

  test('fetches and displays filtered products when search button is clicked', async () => {
    renderProductsPage();
    const searchInput = screen.getByPlaceholderText(/Search by product name.../i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    await userEvent.type(searchInput, 'Alpha');
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Test Product Beta')).not.toBeInTheDocument();
    });
  });

  test('fetches and displays filtered products when Enter is pressed in search input', async () => {
    renderProductsPage();
    const searchInput = screen.getByPlaceholderText(/Search by product name.../i);

    await userEvent.type(searchInput, 'Alpha');
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('Test Product Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Test Product Beta')).not.toBeInTheDocument();
    });
  });

  test('shows "no products found" toast when search yields no results', async () => {
    renderProductsPage();
    const searchInput = screen.getByPlaceholderText(/Search by product name.../i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    await userEvent.type(searchInput, 'NonExistentSearchTerm');
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('No products found matching "NonExistentSearchTerm".');
      // Also check that the table is empty or shows a no products message if applicable
      expect(screen.queryByText('Test Product Alpha')).not.toBeInTheDocument();
    });
  });

  test('clears search and fetches all products when "Clear" button is clicked', async () => {
    renderProductsPage();
    const searchInput = screen.getByPlaceholderText(/Search by product name.../i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Perform a search first
    await userEvent.type(searchInput, 'Alpha');
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Test Product Beta')).not.toBeInTheDocument();
    });

    // Now click clear search (it becomes visible after a search)
    const clearButton = screen.getByRole('button', { name: /Clear/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      // Check if input is cleared
      expect(searchInput).toHaveValue('');
      // Check if all products are back
      expect(screen.getByText('Test Product Alpha')).toBeInTheDocument();
      expect(screen.getByText('Test Product Beta')).toBeInTheDocument();
    });
  });

  test('handles API error during product fetch', async () => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/seller/products`, () => {
        return new HttpResponse(null, { status: 500, statusText: 'Server Error' });
      })
    );
    renderProductsPage();
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch products: Server Error/i)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch products.');
    });
  });

});
