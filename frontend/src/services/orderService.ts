// frontend/src/services/orderService.ts
import {
    Order,
    OrderCreationData,
    PaymentProcessingData,
    PaymentResponse
} from '../types/order';

const API_BASE_URL = '/api/customer'; // Adjust if your API prefix is different

// Helper function to get the auth token
const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// Helper function for making authenticated requests
const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
};

export const processPayment = async (paymentData: PaymentProcessingData): Promise<PaymentResponse> => {
    return fetchWithAuth<PaymentResponse>(`${API_BASE_URL}/payment/process`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
    });
};

export const createOrder = async (orderDetails: OrderCreationData): Promise<Order> => {
    return fetchWithAuth<Order>(`${API_BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderDetails),
    });
};

export const getCustomerOrders = async (): Promise<Order[]> => {
    return fetchWithAuth<Order[]>(`${API_BASE_URL}/orders`);
};

export const getOrderDetails = async (orderId: string): Promise<Order> => {
    return fetchWithAuth<Order>(`${API_BASE_URL}/orders/${orderId}`);
};

// Example Usage (for testing, not part of the service file):
/*
async function testPaymentAndOrderCycle() {
    try {
        // 1. Process Payment
        const paymentDetails: PaymentProcessingData = {
            userId: "user123abc", // Replace with a valid or test user ID
            amount: 150.75,
            paymentMethodData: { type: "test_card", details: "mock_card_xyz123" }
        };
        const paymentResponse = await processPayment(paymentDetails);
        console.log('Payment Response:', paymentResponse);

        if (paymentResponse.transaction && paymentResponse.transaction.status === 'Paid') {
            // 2. Create Order using the transaction ID from the payment response
            const orderDetails: OrderCreationData = {
                userId: "user123abc", // Ensure this matches or backend derives from token
                items: [
                    { id: "prod001", name: "Wireless Mouse", price: 25.50, quantity: 1, image: "mouse.jpg", attributes: "Color: Black" },
                    { id: "prod002", name: "USB Hub", price: 15.25, quantity: 2, image: "hub.jpg" }
                ],
                shippingAddress: {
                    name: "Jane Doe",
                    address: "456 Oak Avenue",
                    city: "Townsville",
                    state: "TX",
                    zip: "75001"
                },
                payment: {
                    method: "Card",
                    last4: "4321", // Example, can be from paymentMethodData or a mock
                    billingAddress: "456 Oak Avenue, Townsville, TX, 75001",
                    clientTransactionId: paymentResponse.transaction.id // Crucial: link to the payment transaction
                },
                summary: {
                    subtotal: 56.00, // 25.50 + (15.25*2)
                    shipping: 10.00,
                    tax: 4.75,
                    total: 70.75 // sum of above
                }
            };
            const createdOrder = await createOrder(orderDetails);
            console.log('Created Order:', createdOrder);

            // 3. Get All Customer Orders
            const allOrders = await getCustomerOrders();
            console.log('All Customer Orders:', allOrders);

            // 4. Get Details for the Created Order
            if (createdOrder && createdOrder.id) {
                const specificOrderDetails = await getOrderDetails(createdOrder.id);
                console.log('Details for new Order:', specificOrderDetails);
            }
        } else {
            console.log('Payment was not successful, skipping order creation.');
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Service Test Error:', error.message);
        } else {
            console.error('Service Test Error:', error);
        }
    }
}

// To run the test:
// testPaymentAndOrderCycle();
*/
