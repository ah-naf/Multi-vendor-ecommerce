const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");

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
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

// @desc    Create a new product
// @route   POST /api/seller/products
// @access  Private/Seller
const createProduct = async (req, res) => {
  try {
    const productDataString = req.body.productData;
    if (!productDataString) {
      return res.status(400).json({ message: "Product data is missing." });
    }
    const { id, general, specifications, pricing, inventory, additional, seo } =
      JSON.parse(productDataString);

    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagePaths.push(`/uploads/product_images/${file.filename}`);
      });
    } else if (general && general.images && Array.isArray(general.images)) {
      imagePaths.push(...general.images);
    }

    const productData = {
      id,
      general: {
        ...general,
        images: imagePaths,
      },
      specifications,
      pricing,
      inventory,
      additional,
      seo,
      seller: req.user.id,
    };

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
      productData.general.images = [];
    }

    const product = new Product(productData);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "Multer error: " + error.message });
    }
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
    const productDataString = req.body.productData;
    if (!productDataString) {
      return res.status(400).json({ message: "Product data is missing." });
    }
    const { general, specifications, pricing, inventory, additional, seo } =
      JSON.parse(productDataString);
    const productId = req.params.id;

    let product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this product" });
    }

    let imagePaths = product.general.images || [];
    if (req.files && req.files.length > 0) {
      imagePaths = [];
      req.files.forEach((file) => {
        imagePaths.push(`/uploads/product_images/${file.filename}`);
      });
    } else if (general && general.images && Array.isArray(general.images)) {
      imagePaths = general.images;
    }

    if (general) {
      product.general.title = general.title || product.general.title;
      product.general.description =
        general.description || product.general.description;
      product.general.category = general.category || product.general.category;
      product.general.images = imagePaths;
    }
    if (specifications)
      product.specifications = { ...product.specifications, ...specifications };
    if (pricing) product.pricing = { ...product.pricing, ...pricing };
    if (inventory) product.inventory = { ...product.inventory, ...inventory };
    if (additional)
      product.additional = { ...product.additional, ...additional };
    if (seo) product.seo = { ...product.seo, ...seo };

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
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this product" });
    }

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
    const { searchTerm } = req.query;

    let filterQuery = { seller: sellerId };

    if (searchTerm) {
      const regex = { $regex: searchTerm, $options: "i" };
      filterQuery.$or = [
        { "general.title": regex },
        { "inventory.sku": regex },
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

// @desc    Get a single product by ID for a seller
// @route   GET /api/seller/products/:id
// @access  Private/Seller
const getSellerProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
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
  console.log("first");
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
  getSellerProductById,
  upload,
  getAllProducts,
  getProductById,
};
