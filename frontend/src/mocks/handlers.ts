import { http, HttpResponse } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const handlers = [
  // Customer Dashboard Handlers
  http.get(`${API_BASE_URL}/customer/dashboard/total-orders`, ({ request }) => {
    // Check for auth token if needed: request.headers.get('Authorization')
    return HttpResponse.json({ totalOrders: 10 });
  }),
  http.get(`${API_BASE_URL}/customer/dashboard/wishlist-items-count`, () => {
    return HttpResponse.json({ wishlistItemsCount: 5 });
  }),
  http.get(`${API_BASE_URL}/customer/dashboard/total-spent`, () => {
    return HttpResponse.json({ totalSpent: 1250.75 });
  }),
  http.get(`${API_BASE_URL}/customer/dashboard/recent-orders`, () => {
    return HttpResponse.json({ recentOrders: [{ id: 'ORD123', date: new Date().toISOString(), summary: { total: 75.50 }, status: 'Delivered' }] });
  }),
  http.get(`${API_BASE_URL}/customer/dashboard/active-order`, () => {
    return HttpResponse.json({ activeOrder: { id: 'ORD456', status: 'Shipped', estimatedDelivery: 'Tomorrow' } });
  }),

  // Seller Dashboard Handlers
  http.get(`${API_BASE_URL}/seller/dashboard/sales-data`, ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    return HttpResponse.json({ period: period, totalSales: 5500, totalOrdersCount: 50 });
  }),
  http.get(`${API_BASE_URL}/seller/dashboard/order-status-counts`, () => {
    return HttpResponse.json({ Pending: 5, Processing: 10, Shipped: 15, Delivered: 20, Cancelled: 2 });
  }),
  http.get(`${API_BASE_URL}/seller/dashboard/low-stock-count`, () => {
    return HttpResponse.json({ lowStockProductCount: 3, threshold: 5 });
  }),
   // Placeholder for sales performance and revenue trend as their backend is also placeholder
  http.get(`${API_BASE_URL}/seller/dashboard/sales-performance`, () => {
    return HttpResponse.json({ currentMonthSales: 5500, previousMonthSales: 5000, performanceTrend: 'up', percentageChange: 10 });
  }),
  http.get(`${API_BASE_URL}/seller/dashboard/revenue-trend`, () => {
    return HttpResponse.json([{ name: "Jan", revenue: 4000 }, { name: "Feb", revenue: 3000 }]);
  }),


  // Seller Product Search Handler
  http.get(`${API_BASE_URL}/seller/products`, ({ request }) => {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search');

    const mockProducts = [
      { id: 'P1', general: { title: 'Test Product Alpha', images:['/img1.jpg'], category: 'Elec'}, inventory: {sku:'TPA', quantity:10}, pricing:{price:100, salePrice:90} },
      { id: 'P2', general: { title: 'Test Product Beta', images:['/img2.jpg'], category: 'Books'}, inventory: {sku:'TPB', quantity:5}, pricing:{price:20, salePrice:20} },
      { id: 'P3', general: { title: 'Another Product Gamma', images:['/img3.jpg'], category: 'Home'}, inventory: {sku:'APG', quantity:0}, pricing:{price:50, salePrice:50} },
    ];

    if (searchTerm) {
      const filteredProducts = mockProducts.filter(p => p.general.title.toLowerCase().includes(searchTerm.toLowerCase()));
      return HttpResponse.json(filteredProducts);
    }
    return HttpResponse.json(mockProducts); // Return all if no search term
  }),

  // Mock for AuthContext or user profile if needed by dashboard welcome messages
  // Example:
  // http.get(`${API_BASE_URL}/users/profile`, () => {
  //   return HttpResponse.json({ firstName: 'Test', email: 'test@example.com' });
  // }),
];
