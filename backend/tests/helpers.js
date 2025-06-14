const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary
const Product = require('../models/Product'); // Adjust path as necessary
const OrderDetail = require('../models/OrderDetail'); // Adjust path as necessary

// Secret for JWT - must match the one in authMiddleware.js
const JWT_SECRET = 'yourjwtsecretkey';

const generateToken = (userId, roles = ['customer']) => {
  // The authMiddleware expects 'decoded.userId'
  return jwt.sign({ userId: userId, roles: roles }, JWT_SECRET, { expiresIn: '1h' });
};

const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const createOrder = async (orderData) => {
  const order = new OrderDetail(orderData);
  return await order.save();
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await OrderDetail.deleteMany({});
  // Add other models here if needed
};


module.exports = {
  generateToken,
  createUser,
  createProduct,
  createOrder,
  clearDatabase,
  JWT_SECRET, // Export if needed directly in tests, though generateToken is preferred
};
