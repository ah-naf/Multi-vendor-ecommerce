const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In a real app, use an environment variable!
const JWT_SECRET = 'yourjwtsecretkey';

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt_token) {
    token = req.cookies.jwt_token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
    res.status(500).json({ message: 'Server error during token authentication' });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
      return res.status(403).json({ message: 'User role not authorized, user data missing' });
    }

    const hasRequiredRole = allowedRoles.some(role => req.user.roles.includes(role));

    if (hasRequiredRole) {
      next();
    } else {
      res.status(403).json({ message: 'User role not authorized' });
    }
  };
};

module.exports = { protect, authorize };
