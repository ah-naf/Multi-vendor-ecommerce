const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // Added for serving static files

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = "mongodb://localhost:27017/ecomm_auth_db";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// User Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Seller Routes
const sellerRoutes = require("./routes/sellerRoutes");
app.use("/api/seller", sellerRoutes);

// Customer Routes
const customerRoutes = require("./routes/customerRoutes");
app.use("/api/customer", customerRoutes);

// Cart Routes
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

// Wishlist Routes
const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoutes);

// Order Routes
const orderRoutes = require('./routes/orderRoutes'); // Added
app.use('/api/orders', orderRoutes); // Added

// Start Server
const PORT = process.env.PORT || 5000;
// Only start listening if the file is run directly (e.g., `node server.js`)
// and not when imported (e.g., by test files)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export the app for testing
