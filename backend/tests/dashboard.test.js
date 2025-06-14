const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const mongoose = require('mongoose');
const { generateToken, createUser, createOrder, createProduct, clearDatabase } = require('./helpers');
const User = require('../models/User');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');

describe('Customer Dashboard API Endpoints', () => {
  let customerToken;
  let customerUser;

  beforeAll(async () => {
    // Create a customer user for testing
    customerUser = await createUser({
      firstName: 'Customer',
      lastName: 'TestUser',
      email: 'customer@example.com',
      password: 'password123', // Will be hashed by pre-save hook
      roles: ['customer'],
      wishlist: [{ productId: 'prod123', name: 'Test Wish Product', price: 100, image: 'img.jpg' }] // Example wishlist item
    });
    customerToken = generateToken(customerUser._id, ['customer']);
  });

  afterEach(async () => {
    // Clear only order and product data specific to tests, user might be needed across tests in this describe block
    // Or rely on global afterEach in setup.js if that's preferred. For now, specific clearing:
    await OrderDetail.deleteMany({});
    // await Product.deleteMany({}); // If products are created specific to customer dashboard tests
  });

  afterAll(async () => {
    await User.deleteMany({}); // Clean up users after all tests in this suite
  });

  it('GET /api/customer/dashboard/total-orders - should get total orders for a customer', async () => {
    await createOrder({ user: customerUser._id, id: 'ORD001', items: [], summary: { total: 50 }, date: new Date(), status: 'Delivered' });
    await createOrder({ user: customerUser._id, id: 'ORD002', items: [], summary: { total: 100 }, date: new Date(), status: 'Processing' });

    const response = await request(app)
      .get('/api/customer/dashboard/total-orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalOrders', 2);
  });

  it('GET /api/customer/dashboard/wishlist-items-count - should get wishlist items count', async () => {
    const response = await request(app)
      .get('/api/customer/dashboard/wishlist-items-count')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('wishlistItemsCount', 1); // From user created in beforeAll
  });

  it('GET /api/customer/dashboard/total-spent - should get total spent on delivered orders', async () => {
    await createOrder({ user: customerUser._id, id: 'ORD003', items: [], summary: { total: 75 }, date: new Date(), status: 'Delivered' });
    await createOrder({ user: customerUser._id, id: 'ORD004', items: [], summary: { total: 125 }, date: new Date(), status: 'Delivered' });
    await createOrder({ user: customerUser._id, id: 'ORD005', items: [], summary: { total: 200 }, date: new Date(), status: 'Processing' }); // Not delivered

    const response = await request(app)
      .get('/api/customer/dashboard/total-spent')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalSpent', 200); // 75 + 125
  });

  it('GET /api/customer/dashboard/recent-orders - should get recent orders with limit', async () => {
    await createOrder({ user: customerUser._id, id: 'ORD006', date: new Date(2023, 0, 1), summary: {total: 10}, status: 'Delivered' });
    await createOrder({ user: customerUser._id, id: 'ORD007', date: new Date(2023, 0, 2), summary: {total: 20}, status: 'Delivered' });
    await createOrder({ user: customerUser._id, id: 'ORD008', date: new Date(2023, 0, 3), summary: {total: 30}, status: 'Delivered' });

    const response = await request(app)
      .get('/api/customer/dashboard/recent-orders?limit=2')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.recentOrders).toHaveLength(2);
    expect(response.body.recentOrders[0].id).toBe('ORD008'); // Most recent
  });

  it('GET /api/customer/dashboard/active-order - should get the most recent active order', async () => {
    await createOrder({ user: customerUser._id, id: 'ORD009', date: new Date(2023, 1, 1), status: 'Delivered', summary: {total: 10} });
    await createOrder({ user: customerUser._id, id: 'ORD010', date: new Date(2023, 1, 2), status: 'Processing', summary: {total: 20} }); // Active
    await createOrder({ user: customerUser._id, id: 'ORD011', date: new Date(2023, 1, 3), status: 'Shipped', summary: {total: 30} });    // Also active, more recent

    const response = await request(app)
      .get('/api/customer/dashboard/active-order')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.activeOrder).toBeDefined();
    expect(response.body.activeOrder.id).toBe('ORD011');
  });

   it('GET /api/customer/dashboard/active-order - should return null if no active order', async () => {
    await createOrder({ user: customerUser._id, id: 'ORD012', date: new Date(2023, 1, 1), status: 'Delivered', summary: {total: 10} });
    await createOrder({ user: customerUser._id, id: 'ORD013', date: new Date(2023, 1, 2), status: 'Cancelled', summary: {total: 20} });

    const response = await request(app)
      .get('/api/customer/dashboard/active-order')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200); // Backend returns 200 with { activeOrder: null }
    expect(response.body.activeOrder).toBeNull();
  });
});


describe('Seller Dashboard API Endpoints', () => {
  let sellerToken;
  let sellerUser;
  let otherSellerUser; // For testing data isolation

  beforeAll(async () => {
    sellerUser = await createUser({ firstName: 'Seller', lastName: 'TestUser', email: 'seller@example.com', password: 'password123', roles: ['seller'] });
    otherSellerUser = await createUser({ firstName: 'OtherSeller', lastName: 'Test', email: 'otherseller@example.com', password: 'password123', roles: ['seller'] });
    sellerToken = generateToken(sellerUser._id, ['seller']);
  });

  afterEach(async () => {
    // Clear data relevant to these tests
    await OrderDetail.deleteMany({});
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it('GET /api/seller/dashboard/sales-data - should get sales data for a period (month)', async () => {
    // Product belonging to the seller
    const product1 = await createProduct({ id: 'P1', seller: sellerUser._id, general: { title: 'P1'}, pricing: {price: 100}, inventory: {quantity:10, sku:'S1'} });
    // Order with seller's product
    await createOrder({
      id: 'SELLER_ORD001',
      user: new mongoose.Types.ObjectId(), // some customer
      items: [{ productId: product1.id, name: 'P1', quantity: 2, price: 100, sellerId: sellerUser._id }],
      summary: { total: 200 },
      date: new Date(), // today, so falls in 'month'
      status: 'Delivered'
    });
     // Order with other seller's product - should not be counted
    await createOrder({
      id: 'SELLER_ORD002',
      user: new mongoose.Types.ObjectId(),
      items: [{ productId: 'P_OTHER', name: 'P_OTHER', quantity: 1, price: 50, sellerId: otherSellerUser._id }],
      summary: { total: 50 },
      date: new Date(),
      status: 'Delivered'
    });

    const response = await request(app)
      .get('/api/seller/dashboard/sales-data?period=month')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('period', 'month');
    expect(response.body).toHaveProperty('totalSales', 200);
    expect(response.body).toHaveProperty('totalOrdersCount', 1);
  });

  it('GET /api/seller/dashboard/order-status-counts - should get order status counts for seller items', async () => {
    const product1 = await createProduct({ id: 'P2', seller: sellerUser._id, general: { title: 'P2'}, pricing: {price: 10}, inventory: {quantity:10, sku:'S2'} });
    await createOrder({ id: 'SELLER_ORD003', items: [{ productId: product1.id, name: 'P2', quantity: 1, price: 10, sellerId: sellerUser._id }], status: 'Processing', date: new Date(), summary: {total:10} });
    await createOrder({ id: 'SELLER_ORD004', items: [{ productId: product1.id, name: 'P2', quantity: 2, price: 10, sellerId: sellerUser._id }], status: 'Shipped', date: new Date(), summary: {total:20} });
    await createOrder({ id: 'SELLER_ORD005', items: [{ productId: product1.id, name: 'P2', quantity: 1, price: 10, sellerId: sellerUser._id }], status: 'Processing', date: new Date(), summary: {total:10} });
    // Order with other seller's product
    await createOrder({ id: 'SELLER_ORD006', items: [{ productId: 'P_OTHER2', name: 'P_OTHER2', quantity: 1, price: 50, sellerId: otherSellerUser._id }], status: 'Processing', date: new Date(), summary: {total:50} });


    const response = await request(app)
      .get('/api/seller/dashboard/order-status-counts')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      Pending: 0, // Assuming Pending is a possible status
      Processing: 2,
      Shipped: 1,
      Delivered: 0,
      Cancelled: 0,
    });
  });

  it('GET /api/seller/dashboard/low-stock-count - should get count of low stock products', async () => {
    await createProduct({ seller: sellerUser._id, id: 'P_LOW1', general: {title: 'P_LOW1'}, inventory: { quantity: 3, sku: 'LS1' }, pricing: {price:10} });
    await createProduct({ seller: sellerUser._id, id: 'P_LOW2', general: {title: 'P_LOW2'}, inventory: { quantity: 10, sku: 'LS2' }, pricing: {price:10} });
    await createProduct({ seller: sellerUser._id, id: 'P_LOW3', general: {title: 'P_LOW3'}, inventory: { quantity: 1, sku: 'LS3' }, pricing: {price:10} });
    await createProduct({ seller: otherSellerUser._id, id: 'P_LOW_OTHER', general: {title: 'P_LOW_OTHER'}, inventory: { quantity: 2, sku: 'LS_OTHER' }, pricing: {price:10} });


    const response = await request(app)
      .get('/api/seller/dashboard/low-stock-count?threshold=5')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('lowStockProductCount', 2); // P_LOW1 and P_LOW3
    expect(response.body).toHaveProperty('threshold', 5);
  });

  // TODO: Add tests for sales-performance and revenue-trend once their backend logic is implemented beyond placeholders
  it.todo('GET /api/seller/dashboard/sales-performance - should return sales performance data');
  it.todo('GET /api/seller/dashboard/revenue-trend - should return revenue trend data');

});
