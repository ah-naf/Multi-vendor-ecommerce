const Product = require("../models/Product"); // Assuming the Product model path
const multer = require("multer");
const path = require("path");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/product_images/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(
    new Error(
      "Error: File upload only supports the following filetypes - " +
        allowedTypes
    )
  );
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: fileFilter,
});

// @desc    Create a new product
// @route   POST /api/seller/products
// @access  Private/Seller
const createProduct = async (req, res) => {
  try {
    // productDataString is expected to be a JSON string from FormData
    const productDataString = req.body.productData;
    if (!productDataString) {
      return res.status(400).json({ message: "Product data is missing." });
    }
    const { id, general, specifications, pricing, inventory, additional, seo } =
      JSON.parse(productDataString); // Parse the JSON string

    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagePaths.push(`/uploads/product_images/${file.filename}`);
      });
    } else if (general && general.images && Array.isArray(general.images)) {
      // Use provided image URLs if no files are uploaded
      imagePaths.push(...general.images);
    }

    const productData = {
      id,
      general: {
        ...general,
        images: imagePaths, // Overwrite images with uploaded file paths or existing URLs
      },
      specifications,
      pricing,
      inventory,
      additional,
      seo,
      seller: req.user.id, // Correctly uses req.user.id
    };

    // Basic validation to ensure required fields are present
    if (
      !id ||
      !productData.general?.title ||
      !productData.general?.category ||
      !productData.pricing?.price ||
      !productData.inventory?.quantity ||
      !productData.inventory?.sku ||
      !productData.seo?.title ||
      !productData.seo?.description
    ) {
      return res
        .status(400)
        .json({ message: "Missing required product fields." });
    }
    if (
      imagePaths.length === 0 &&
      (!general || !general.images || general.images.length === 0)
    ) {
      productData.general.images = []; // Ensure images is an empty array if none provided/uploaded
    }

    const product = new Product(productData);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    // Check for multer specific errors
    if (error instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "Multer error: " + error.message });
    }
    // Check for duplicate key error (for 'id' field)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Error creating product: ID already exists." });
    }
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
  try {
    // productDataString is expected to be a JSON string from FormData
    const productDataString = req.body.productData;
    if (!productDataString) {
      return res.status(400).json({ message: "Product data is missing." });
    }
    const {
      general,
      specifications,
      pricing,
      inventory,
      additional,
      seo,
      // Note: The 'id' of the product to update is from req.params.id, not from productDataString for update.
      // The 'id' field within productDataString (if present) should ideally match req.params.id or be ignored for update.
    } = JSON.parse(productDataString);
    const productId = req.params.id; // Product's unique 'id' field from URL

    // Find product by its custom 'id' field
    let product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product belongs to the authenticated seller
    if (product.seller.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this product" });
    }

    // Handle image uploads
    let imagePaths = product.general.images || []; // Keep existing images by default
    if (req.files && req.files.length > 0) {
      imagePaths = []; // Replace existing images if new ones are uploaded
      req.files.forEach((file) => {
        imagePaths.push(`/uploads/product_images/${file.filename}`);
      });
      // Note: Old images are not deleted from the filesystem here.
    } else if (general && general.images && Array.isArray(general.images)) {
      // If no files uploaded, but 'images' array is in request body, use that
      imagePaths = general.images;
    }

    // Update product fields (nested structure)
    if (general) {
      product.general.title = general.title || product.general.title;
      product.general.description =
        general.description || product.general.description;
      product.general.category = general.category || product.general.category;
      product.general.images = imagePaths; // Assign new or existing image paths
    }
    if (specifications)
      product.specifications = { ...product.specifications, ...specifications };
    if (pricing) product.pricing = { ...product.pricing, ...pricing };
    if (inventory) product.inventory = { ...product.inventory, ...inventory };
    if (additional)
      product.additional = { ...product.additional, ...additional };
    if (seo) product.seo = { ...product.seo, ...seo };

    // The 'id' field of the product should not be changed.
    // The 'seller' field should not be changed.

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "Multer error: " + error.message });
    }
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
  try {
    // Find product by its custom 'id' field
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product belongs to the authenticated seller
    if (product.seller.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this product" });
    }

    // await product.remove(); // .remove() is deprecated
    await Product.deleteOne({ id: req.params.id });
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// @desc    Get all products for a seller
// @route   GET /api/seller/products
// @access  Private/Seller
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    // The frontend service sends searchTerm, so we use that.
    // If it were 'search', we'd use req.query.search
    const { searchTerm } = req.query;

    let filterQuery = { seller: sellerId };

    if (searchTerm) {
      // Build a regex query for case-insensitive search on title or SKU
      const regex = { $regex: searchTerm, $options: 'i' };
      filterQuery.$or = [
        { 'general.title': regex },
        { 'inventory.sku': regex }
      ];
    }

    const products = await Product.find(filterQuery);
    res.json(products);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  upload, // Export multer instance
};

// @desc    Get a single product by ID for a seller
// @route   GET /api/seller/products/:id
// @access  Private/Seller
const getSellerProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product belongs to the authenticated seller
    if (product.seller.toString() !== req.user.id) {
      // Note: Even if the product exists, if it's not owned by this seller,
      // it's better to return 404 to not reveal its existence.
      // Or, return 401/403 if you want to explicitly state an auth error.
      // For this case, 404 is often preferred for security.
      return res
        .status(404)
        .json({ message: "Product not found or not authorized" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/customer/products
// @access  Public
const getAllProducts = async (req, res) => {
  console.log("first")
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/customer/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).populate(
      "seller",
      "firstName lastName email phone _id"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getSellerProductById, // Export new function
  upload,
  getAllProducts, // Export new function
  getProductById, // Export new function
};
