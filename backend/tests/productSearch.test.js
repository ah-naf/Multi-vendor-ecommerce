const request = require('supertest');
const app = require('../server'); // Correctly imports the app
const mongoose = require('mongoose');
const { generateToken, createUser, createProduct, clearDatabase } = require('./helpers');
const User = require('../models/User');
const Product = require('../models/Product');

describe('Seller Product Search API Endpoint', () => {
  let sellerToken;
  let sellerUser;
  let product1, product2, product3; // To store created products for reference

  beforeAll(async () => {
    // Create a seller user for testing
    sellerUser = await createUser({
      firstName: 'SearchSeller',
      lastName: 'TestUser',
      email: 'searchseller@example.com',
      password: 'password123',
      roles: ['seller'],
    });
    sellerToken = generateToken(sellerUser._id, ['seller']);

    // Create some products for this seller
    product1 = await createProduct({
      id: 'PROD_S1',
      general: { title: 'Apple iPhone 13', description: 'Latest iPhone', images: [], category: 'Electronics' },
      pricing: { price: 999, salePrice: 999 },
      inventory: { quantity: 10, sku: 'IP13' },
      seo: { title: 'iPhone 13', description: 'Buy iPhone 13' },
      seller: sellerUser._id,
    });
    product2 = await createProduct({
      id: 'PROD_S2',
      general: { title: 'Samsung Galaxy S21', description: 'Latest Samsung phone', images: [], category: 'Electronics' },
      pricing: { price: 899, salePrice: 899 },
      inventory: { quantity: 5, sku: 'SGS21' },
      seo: { title: 'Galaxy S21', description: 'Buy Galaxy S21' },
      seller: sellerUser._id,
    });
    product3 = await createProduct({ // A product with a different name for negative testing
      id: 'PROD_S3',
      general: { title: 'Google Pixel 6', description: 'Latest Pixel phone', images: [], category: 'Electronics' },
      pricing: { price: 799, salePrice: 799 },
      inventory: { quantity: 8, sku: 'GP6' },
      seo: { title: 'Pixel 6', description: 'Buy Pixel 6' },
      seller: sellerUser._id,
    });
     // Product for another seller (should not appear in results)
    const otherSeller = await createUser({ firstName: 'OtherS', lastName: 'U', email: 'others@example.com', password: 'pw', roles: ['seller'] });
    await createProduct({
      id: 'PROD_S_OTHER',
      general: { title: 'Apple iPhone 13 (Other Seller)', description: '...', images: [], category: 'Electronics' },
      pricing: { price: 999, salePrice: 999 },
      inventory: { quantity: 10, sku: 'IP13_O' },
      seo: { title: 'iPhone 13 Other', description: '...' },
      seller: otherSeller._id,
    });
  });

  afterAll(async () => {
    // Clear all data after tests
    // Relying on global afterEach in setup.js might be sufficient,
    // but explicit cleanup here for users and products ensures this suite is clean.
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  it('GET /api/seller/products - should return all products for the seller if no search term is provided', async () => {
    const response = await request(app)
      .get('/api/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(3); // Only products for 'sellerUser'
    const titles = response.body.map(p => p.general.title);
    expect(titles).toContain('Apple iPhone 13');
    expect(titles).toContain('Samsung Galaxy S21');
    expect(titles).toContain('Google Pixel 6');
  });

  it('GET /api/seller/products?search=iPhone - should return products matching the search term for the seller', async () => {
    const response = await request(app)
      .get('/api/seller/products?search=iPhone')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].general.title).toBe('Apple iPhone 13');
  });

  it('GET /api/seller/products?search=apple - should be case-insensitive', async () => {
    const response = await request(app)
      .get('/api/seller/products?search=apple')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].general.title).toBe('Apple iPhone 13');
  });

  it('GET /api/seller/products?search=NonExistent - should return an empty array if no products match', async () => {
    const response = await request(app)
      .get('/api/seller/products?search=NonExistentProductXYZ')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });

  it('GET /api/seller/products - should not be accessible without authentication', async () => {
    const response = await request(app).get('/api/seller/products');
    expect(response.status).toBe(401); // Or 403 depending on auth middleware
  });

  it('GET /api/seller/products?search=Galaxy - should only return products for the authenticated seller', async () => {
    // We already created a product "Apple iPhone 13 (Other Seller)" for another seller.
    // This test ensures that searching for "Galaxy" (which matches one of our seller's products)
    // does not accidentally include products from other sellers if search logic was flawed.
    const response = await request(app)
      .get('/api/seller/products?search=Galaxy')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].general.title).toBe('Samsung Galaxy S21');
    // Ensure no products from otherSeller are returned
    response.body.forEach(product => {
        expect(product.seller.toString()).toBe(sellerUser._id.toString());
    });
  });
});
