import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './page'; // Adjust path to your ProfilePage component
// import * as userProfileService from '@/services/userProfileService'; // We will mock its functions individually
// import { AuthContext } from '@/context/AuthContext'; // Assuming AuthContext is used, adjust path

// Mock the userProfileService with an inline factory
jest.mock('@/services/userProfileService', () => ({
  __esModule: true,
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  addAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));

// Import the mocked service to access the mock functions
import {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} from '@/services/userProfileService';


// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    // other router methods if needed
  }),
  usePathname: jest.fn().mockReturnValue('/dashboard-customer/profile'),
  // other next/navigation exports if needed
}));


// Mock AuthContext if your page uses it directly
// For this example, ProfilePage manages token via useState("mock-auth-token")
// If it were using AuthContext:
/*
const mockAuthContextValue = {
  user: { _id: 'user123', name: 'Test User', /* other user properties *\/ },
  token: 'fake-token',
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  setToken: jest.fn(),
  // ... any other values provided by your AuthContext
};

const renderWithAuth = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      {component}
    </AuthContext.Provider>
  );
};
*/

// Since ProfilePage uses a local `token` state initialized to "mock-auth-token"
// and doesn't use AuthContext directly for the token, we can render it directly.
// If AuthContext was used for user data (not just token), we'd need to mock it.

describe('ProfilePage', () => {
  const mockUserProfile = {
    _id: 'user123',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Test bio',
    isAdmin: false,
    addresses: [
      { _id: 'addr1', street: '12 Rosewood Lane', city: 'Manchester', state: 'MAN', zip: 'M14 5TP', country: 'UK', isDefault: true, type: 'Home' },
      { _id: 'addr2', street: 'Unit 7, Orion Park', city: 'Slough', state: 'BER', zip: 'SL1 4OT', country: 'UK', isDefault: false, type: 'Work' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock implementations for service functions
    // Setup mock implementations for service functions
    (getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
    (updateUserProfile as jest.Mock).mockResolvedValue({ ...mockUserProfile, name: 'Alexandra Johnson' });
    (addAddress as jest.Mock).mockResolvedValue([
      ...mockUserProfile.addresses,
      { _id: 'addr3', street: 'New Street', city: 'New City', state: 'NC', zip: '12345', country: 'USA', isDefault: false, type: 'Other' },
    ]);
    (updateAddress as jest.Mock).mockResolvedValue(mockUserProfile.addresses.map(a => a._id === 'addr2' ? { ...a, street: 'Updated Street' } : a));
    (deleteAddress as jest.Mock).mockResolvedValue(mockUserProfile.addresses.filter(a => a._id !== 'addr2'));
  });

  it('should render personal information form and load data', async () => {
    render(<ProfilePage />);

    // Wait for profile data to load and form to be populated
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue('Alex');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('Johnson');
      expect(screen.getByLabelText(/email/i)).toHaveValue('alex.johnson@example.com');
      expect(screen.getByLabelText(/phone/i)).toHaveValue('+1 (555) 123-4567');
      expect(screen.getByLabelText(/bio/i)).toHaveValue('Test bio');
    });
    expect(getUserProfile).toHaveBeenCalledTimes(1);
  });

  it('should allow updating personal information', async () => {
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toHaveValue('Alex'));

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Alexandra' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alexandra Johnson', email: mockUserProfile.email }),
        "mock-auth-token" // This comes from the page's internal state
      );
    });
    // Optionally, verify that a success message is shown (e.g., an alert)
    // window.alert = jest.fn(); // Mock alert
    // expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
  });

  it('should display existing addresses', async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText(/12 Rosewood Lane/i)).toBeInTheDocument();
      expect(screen.getByText(/Unit 7, Orion Park/i)).toBeInTheDocument();
    });
  });

  it('should allow adding a new address', async () => {
    render(<ProfilePage />);
    // Wait for the main content to load, specifically for the "Add Address" button to be visible
    // Wait for the main content to load, specifically for the "Add Address" button (to open the form) to be visible
    const openAddAddressFormButton = await screen.findByRole('button', { name: /add address/i });
    fireEvent.click(openAddAddressFormButton);

    // Wait for the form to appear and get it by its data-testid
    const addAddressForm = await screen.findByTestId('add-address-form');

    // Fill out the new address form
    within(addAddressForm).getByPlaceholderText('Street').value = 'New Street'; // Direct value setting for non-React controlled inputs or use fireEvent.change
    fireEvent.change(within(addAddressForm).getByPlaceholderText('Street'), { target: { value: 'New Street' } });
    fireEvent.change(within(addAddressForm).getByPlaceholderText('City'), { target: { value: 'New City' } });
    fireEvent.change(within(addAddressForm).getByPlaceholderText('State/Province'), { target: { value: 'NC' } });
    fireEvent.change(within(addAddressForm).getByPlaceholderText('Zip/Postal Code'), { target: { value: '12345' } });
    fireEvent.change(within(addAddressForm).getByPlaceholderText('Country'), { target: { value: 'USA' } });
    fireEvent.change(within(addAddressForm).getByPlaceholderText('Label (e.g. Home, Work)'), { target: { value: 'Other' } });

    // Click the submit button within the form (which is also named "Add Address")
    const submitButtonInForm = within(addAddressForm).getByRole('button', { name: /add address/i });
    fireEvent.click(submitButtonInForm);

    await waitFor(() => {
      expect(addAddress).toHaveBeenCalledWith(
        expect.objectContaining({ street: 'New Street', city: 'New City', type: 'Other' }),
        "mock-auth-token"
      );
    });
  });

  it('should allow editing an address', async () => {
    render(<ProfilePage />);
    // Wait for addresses to be rendered
    const addressToEdit = mockUserProfile.addresses[1]; // Unit 7, Orion Park
    const addressItem = await screen.findByTestId(`address-item-${addressToEdit._id}`);

    const editButton = within(addressItem).getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const editAddressForm = await screen.findByTestId('edit-address-form');

    await waitFor(() => {
      expect(within(editAddressForm).getByPlaceholderText('Street')).toHaveValue(addressToEdit.street);
    });

    fireEvent.change(within(editAddressForm).getByPlaceholderText('Street'), { target: { value: 'Updated Street' } });

    const saveButtonInForm = within(editAddressForm).getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButtonInForm);

    await waitFor(() => {
      expect(updateAddress).toHaveBeenCalledWith(
        'addr2',
        expect.objectContaining({ street: 'Updated Street' }),
        "mock-auth-token"
      );
    });
  });

  it('should allow deleting an address', async () => {
    window.confirm = jest.fn(() => true);
    render(<ProfilePage />);

    const addressToDelete = mockUserProfile.addresses[1]; // Unit 7, Orion Park
    const addressItem = await screen.findByTestId(`address-item-${addressToDelete._id}`);

    const deleteButton = within(addressItem).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteAddress).toHaveBeenCalledWith('addr2', "mock-auth-token");
    });
  });

  it('should allow setting an address as default', async () => {
    render(<ProfilePage />);
    // Ensure addresses are loaded and buttons are present
    await screen.findByText(/Set as Default/i);

    const setDefaultButtons = screen.getAllByRole('button', { name: /set as default/i });
    fireEvent.click(setDefaultButtons[0]);

    await waitFor(() => {
      expect(updateAddress).toHaveBeenCalledWith(
        'addr2', // ID of the address being set to default
        expect.objectContaining({ _id: 'addr2', isDefault: true }),
        "mock-auth-token"
      );
    });
  });
});
