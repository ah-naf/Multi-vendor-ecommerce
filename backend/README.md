# Backend API Documentation

This document provides details about the backend API routes.

## Authentication Routes (`authRoutes.js`)

### POST /register

Registers a new user.

*   **Request Body:**
    *   `firstName` (String, required): User's first name.
    *   `lastName` (String, required): User's last name.
    *   `email` (String, required): User's email address.
    *   `password` (String, required): User's password.
    *   `roles` (Array of Strings, optional): User's roles (e.g., `["customer", "seller"]`). Defaults to `["customer"]`.
*   **Responses:**
    *   `201 Created`: `{ "message": "User registered successfully" }`
    *   `400 Bad Request`: 
        *   `{ "message": "Please provide firstName, lastName, email, and password." }`
        *   `{ "message": "User already exists with this email." }`
    *   `500 Internal Server Error`: `{ "message": "Server error during registration." }`

### POST /login

Logs in an existing user.

*   **Request Body:**
    *   `email` (String, required): User's email address.
    *   `password` (String, required): User's password.
*   **Responses:**
    *   `200 OK`: `{ "_id": "...", "firstName": "...", "lastName": "...", "email": "...", "roles": ["..."], "token": "..." }` (JWT token is also set as an HTTP-only cookie `jwt_token`)
    *   `400 Bad Request`: `{ "message": "Please provide email and password." }`
    *   `401 Unauthorized`: `{ "message": "Invalid credentials." }`
    *   `500 Internal Server Error`: `{ "message": "Server error during login." }`

### POST /logout

Logs out the current user.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "message": "Logged out successfully" }` (Clears the `jwt_token` cookie)

## Cart Routes (`cartRoutes.js` & `cartController.js`)

All cart routes require authentication (user must be logged in). The API prefix for these routes is `/api/cart`.

### POST /api/cart/add

Adds an item to the user's shopping cart. If the item (with the same `productId` and `attributes`) already exists, its quantity is updated.

*   **Request Body:**
    *   `productId` (String, required): The ID of the product to add.
    *   `quantity` (Number, required): The quantity of the product.
    *   `name` (String, required): The name of the product.
    *   `price` (Number, required): The price of the product.
    *   `image` (String, optional): URL of the product image.
    *   `attributes` (String, optional): Product attributes (e.g., size, color).
*   **Responses:**
    *   `200 OK`: Returns the updated cart (Array of cart item objects).
        *   Cart Item Object: `{ "productId": "...", "name": "...", "price": ..., "quantity": ..., "image": "...", "attributes": "..." }`
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`

### DELETE /api/cart/remove/:productId

Removes an item from the user's shopping cart.

*   **URL Parameters:**
    *   `productId` (String, required): The ID of the product to remove.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Returns the updated cart (Array of cart item objects).
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`

### PUT /api/cart/update/:productId

Updates the quantity of an item in the user's shopping cart. If quantity is set to 0 or less, the item is removed.

*   **URL Parameters:**
    *   `productId` (String, required): The ID of the product to update.
*   **Request Body:**
    *   `quantity` (Number, required): The new quantity for the product.
*   **Responses:**
    *   `200 OK`: Returns the updated cart (Array of cart item objects).
    *   `404 Not Found`:
        *   `{ "message": "User not found" }`
        *   `{ "message": "Item not found in cart" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`

### GET /api/cart/

Retrieves all items in the user's shopping cart.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Returns the user's cart (Array of cart item objects).
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`

### DELETE /api/cart/clear

Clears all items from the user's shopping cart.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "message": "Cart cleared successfully", "cart": [] }`
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error while clearing cart" }`

## Customer Routes (`customerRoutes.js`, `customerDashboardController.js`, `productController.js`)

These routes are primarily for customer-facing functionalities, including dashboard data and product listings. The API prefix for these routes is `/api/customer`.

### Customer Dashboard Routes

All dashboard routes require authentication and authorization for the 'customer' role.

#### GET /api/customer/dashboard/total-orders

Retrieves the total number of orders placed by the logged-in customer.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "totalOrders": Number }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching total orders." }`

#### GET /api/customer/dashboard/wishlist-items-count

Retrieves the count of items in the logged-in customer's wishlist.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "wishlistItemsCount": Number }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching wishlist items count." }`

#### GET /api/customer/dashboard/total-spent

Retrieves the total amount spent by the logged-in customer on delivered orders.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "totalSpent": Number }` (Formatted to two decimal places)
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching total spent." }`

#### GET /api/customer/dashboard/recent-orders

Retrieves a list of recent orders for the logged-in customer.

*   **Query Parameters:**
    *   `limit` (Number, optional): Number of recent orders to fetch. Defaults to 5.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "recentOrders": [...] }` (Array of order objects, selected fields: `id`, `items`, `status`, `summary.total`, `date`)
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching recent orders." }`

#### GET /api/customer/dashboard/active-order

Retrieves the currently active order (status: 'Processing', 'Shipped', or 'Out for Delivery') for the logged-in customer.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "activeOrder": OrderObject | null }` (Full order object or null if no active order)
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching active order." }`

### Product Routes (Public Access)

#### GET /api/customer/products

Retrieves a list of all available products. This is a public route.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Array of product objects.
    *   `500 Internal Server Error`: `{ "message": "Error fetching products", "error": "..." }`

#### GET /api/customer/products/:id

Retrieves a single product by its ID. This is a public route.

*   **URL Parameters:**
    *   `id` (String, required): The ID of the product.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Product object (populated with seller details: `firstName`, `lastName`, `email`, `phone`, `_id`).
    *   `404 Not Found`: `{ "message": "Product not found" }`
    *   `500 Internal Server Error`: `{ "message": "Error fetching product", "error": "..." }`

## Order Routes (`orderRoutes.js` & `orderController.js`)

These routes handle order creation and management. All routes require authentication. The API prefix is `/api/orders`.

### POST /api/orders/place

Places a new order.

*   **Request Body:**
    *   `items` (Array of Objects, required): List of items to order. Each item object should contain:
        *   `productId` (String, required): ID of the product.
        *   `quantity` (Number, required): Quantity of the product.
    *   `shippingAddressId` (String, optional): ID of a saved shipping address for the user.
    *   `shippingAddressDetails` (Object, optional): Details for a new shipping address. Required if `shippingAddressId` is not provided.
        *   `name` (String, required)
        *   `addressLine1` (String, required)
        *   `addressLine2` (String, optional)
        *   `city` (String, required)
        *   `state` (String, required)
        *   `zipCode` (String, required)
        *   `country` (String, required)
        *   `phone` (String, required)
*   **Responses:**
    *   `201 Created`: Returns the newly created order object.
    *   `400 Bad Request`:
        *   `{ "message": "No items in order" }`
        *   `{ "message": "Shipping address is required" }`
        *   `{ "message": "Complete shipping address details are required for a new address." }`
        *   `{ "message": "Shipping address information is missing." }`
    *   `404 Not Found`:
        *   `{ "message": "User not found" }`
        *   `{ "message": "Saved address not found" }`
        *   `{ "message": "Product with ID ... not found" }`
    *   `500 Internal Server Error`:
        *   `{ "message": "Product with ID ... is missing seller information." }`
        *   `{ "message": "Server error while placing order" }`

### GET /api/orders/my-orders

Retrieves all orders placed by the logged-in user.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Array of order objects, sorted by date descending.
    *   `404 Not Found`: `{ "message": "No orders found for this user." }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching orders." }`

### GET /api/orders/seller-orders

Retrieves all orders containing items sold by the logged-in seller. (Requires 'seller' role).

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Array of order objects, sorted by date descending.
    *   `404 Not Found`:
        *   `{ "message": "No products found for this seller." }`
        *   `{ "message": "No orders found containing items from this seller." }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching seller orders." }`

### PUT /api/orders/seller-orders/:orderId

Updates the status of an order by the seller. (Requires 'seller' role).
This route is also available via `/api/seller/orders/:orderId/status`.

*   **URL Parameters:**
    *   `orderId` (String, required): The ID (UUID) of the order to update.
*   **Request Body:**
    *   `status` (String, optional): New status for the order (e.g., "Shipped", "Delivered", "Cancelled").
        *   Allowed values: As defined in `OrderDetail.schema.path("status").enumValues`.
    *   `trackingNumber` (String, optional): Tracking number for the shipment.
    *   `carrier` (String, optional): Shipping carrier.
    *   `estimatedShipDate` (Date, optional): Estimated shipping date.
    *   `estimatedDelivery` (Date, optional): Estimated delivery date.
    *   `cancellationReason` (String, optional): Reason for cancellation (required if status is "Cancelled").
*   **Responses:**
    *   `200 OK`: Returns the updated order object.
    *   `400 Bad Request`: `{ "message": "Invalid order status" }`
    *   `404 Not Found`: `{ "message": "Order not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error while updating order status" }`

### GET /api/orders/seller-orders/:id

Retrieves a specific order by its ID, if it contains items sold by the logged-in seller. (Requires 'seller' role).

*   **URL Parameters:**
    *   `id` (String, required): The ID (UUID) of the order.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Order object.
    *   `404 Not Found`:
        *   `{ "message": "Order not found." }`
        *   `{ "message": "Seller has no products, order cannot be verified." }`
        *   `{ "message": "Order not found or does not contain any items from this seller." }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching seller order." }`

### GET /api/orders/:id

Retrieves a specific order by its ID. The user must be the owner of the order or a seller whose product is in the order.

*   **URL Parameters:**
    *   `id` (String, required): The ID (UUID) of the order.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Order object.
    *   `404 Not Found`: `{ "message": "Order not found." }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching order." }`

### PUT /api/orders/:orderId/cancel-by-customer

Allows a customer to request cancellation of their order.

*   **URL Parameters:**
    *   `orderId` (String, required): The ID (UUID) of the order to cancel.
*   **Request Body:**
    *   `cancellationReason` (String, required): Reason for cancellation.
*   **Responses:**
    *   `200 OK`: Returns the updated order object with status "Cancelled".
    *   `400 Bad Request`:
        *   `{ "message": "Cancellation reason is required" }`
        *   `{ "message": "Order cannot be cancelled as it is already [status]." }` (If status is not "Processing")
    *   `403 Forbidden`: `{ "message": "Forbidden: You do not own this order." }`
    *   `404 Not Found`: `{ "message": "Order not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error while requesting order cancellation." }`

## Seller Routes (`sellerRoutes.js`, `sellerDashboardController.js`, `productController.js`)

These routes are for seller-specific functionalities, including dashboard analytics and product management. All routes require authentication and 'seller' role authorization. The API prefix is `/api/seller`.

### Seller Dashboard Routes

#### GET /api/seller/dashboard/sales-data

Retrieves sales data for the seller for a specified period.

*   **Query Parameters:**
    *   `period` (String, optional): Time period for sales data. Values: `today`, `week`, `month`, `year`. Defaults to `today`.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "period": "...", "totalSales": Number, "totalOrdersCount": Number }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching sales data." }`

#### GET /api/seller/dashboard/sales-performance

Retrieves sales performance data (e.g., current month vs. last month).
*Note: The controller implementation for this route currently returns placeholder data.*

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "currentMonthSales": 0, "previousMonthSales": 0, "performanceTrend": "N/A", "percentageChange": 0 }` (Placeholder)
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching sales performance." }`

#### GET /api/seller/dashboard/order-status-counts

Retrieves counts of orders based on their status for items sold by the seller.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "Pending": Number, "Processing": Number, "Shipped": Number, "Delivered": Number, "Cancelled": Number }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching order status counts." }`

#### GET /api/seller/dashboard/revenue-trend

Retrieves monthly revenue trend data for the seller over the last 12 months.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Array of objects `[{ "name": "MonthName", "revenue": Number }, ...]`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching revenue trend data." }`

#### GET /api/seller/dashboard/low-stock-count

Retrieves the count of products with low stock for the seller.

*   **Query Parameters:**
    *   `threshold` (Number, optional): The stock quantity below which a product is considered low stock. Defaults to 5.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "lowStockProductCount": Number, "threshold": Number }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching low stock product count." }`

### Seller Product Management Routes

#### POST /api/seller/products

Creates a new product for the logged-in seller. Handles multipart/form-data for image uploads.

*   **Request Body (multipart/form-data):**
    *   `productData` (Stringified JSON, required): A JSON string containing product details.
        *   `id` (String, required): Unique product ID.
        *   `general` (Object, required):
            *   `title` (String, required)
            *   `description` (String, optional)
            *   `category` (String, required)
            *   `images` (Array of Strings, optional): Paths to existing images if not uploading new ones.
        *   `specifications` (Object, optional)
        *   `pricing` (Object, required):
            *   `price` (Number, required)
        *   `inventory` (Object, required):
            *   `quantity` (Number, required)
            *   `sku` (String, required)
        *   `additional` (Object, optional)
        *   `seo` (Object, required):
            *   `title` (String, required)
            *   `description` (String, required)
    *   `images` (File(s), optional): Product image files (up to 10). Field name should be `images`.
*   **Responses:**
    *   `201 Created`: Returns the created product object.
    *   `400 Bad Request`:
        *   `{ "message": "Product data is missing." }`
        *   `{ "message": "Missing required product fields." }`
        *   `{ "message": "Multer error: ..." }` (If file upload issue)
        *   `{ "message": "Error creating product: ID already exists." }` (If `id` is not unique)
    *   `500 Internal Server Error`: `{ "message": "Error creating product", "error": "..." }`

#### GET /api/seller/products

Retrieves all products listed by the logged-in seller.

*   **Query Parameters:**
    *   `searchTerm` (String, optional): Filters products by title or SKU (case-insensitive).
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Array of product objects.
    *   `500 Internal Server Error`: `{ "message": "Error fetching products", "error": "..." }`

#### GET /api/seller/products/:id

Retrieves a specific product by its ID, belonging to the logged-in seller.

*   **URL Parameters:**
    *   `id` (String, required): The ID of the product.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Product object.
    *   `404 Not Found`: `{ "message": "Product not found" }` or `{ "message": "Product not found or not authorized" }`
    *   `500 Internal Server Error`: `{ "message": "Error fetching product", "error": "..." }`

#### PUT /api/seller/products/:id

Updates an existing product belonging to the logged-in seller. Handles multipart/form-data for image uploads.

*   **URL Parameters:**
    *   `id` (String, required): The ID of the product to update.
*   **Request Body (multipart/form-data):**
    *   `productData` (Stringified JSON, required): A JSON string containing fields to update (similar structure to create).
    *   `images` (File(s), optional): New product image files to replace existing ones.
*   **Responses:**
    *   `200 OK`: Returns the updated product object.
    *   `400 Bad Request`:
        *   `{ "message": "Product data is missing." }`
        *   `{ "message": "Multer error: ..." }`
    *   `401 Unauthorized`: `{ "message": "Not authorized to update this product" }`
    *   `404 Not Found`: `{ "message": "Product not found" }`
    *   `500 Internal Server Error`: `{ "message": "Error updating product", "error": "..." }`

#### DELETE /api/seller/products/:id

Deletes a product belonging to the logged-in seller.

*   **URL Parameters:**
    *   `id` (String, required): The ID of the product to delete.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "message": "Product removed successfully" }`
    *   `401 Unauthorized`: `{ "message": "Not authorized to delete this product" }`
    *   `404 Not Found`: `{ "message": "Product not found" }`
    *   `500 Internal Server Error`: `{ "message": "Error deleting product", "error": "..." }`

### Seller Order Management Route (Alias)

#### PUT /api/seller/orders/:orderId/status

Updates the status of an order. This is an alias for `PUT /api/orders/seller-orders/:orderId` and is documented under Order Routes.
(Requires 'seller' role).

## User Routes (`userRoutes.js` & `userController.js`)

These routes handle user profile and address management. All routes require authentication. The API prefix is `/api/users`.

### GET /api/users/profile

Retrieves the profile of the logged-in user.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: User object (details depend on the `req.user` object populated by `authMiddleware`).
    *   `404 Not Found`: `{ "message": "User not found after authentication" }` (Should ideally not happen if `protect` middleware works)

### PUT /api/users/profile

Updates the profile of the logged-in user.

*   **Request Body:**
    *   `firstName` (String, optional): User's first name.
    *   `lastName` (String, optional): User's last name.
    *   `phone` (String, optional): User's phone number.
    *   `bio` (String, optional): User's biography.
*   **Responses:**
    *   `200 OK`: `{ "_id": "...", "username": "...", "email": "...", "firstName": "...", "lastName": "...", "phone": "...", "bio": "...", "isAdmin": ... }` (Returns selected fields of the updated user)
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error` (or other status from error handler): `{ "message": "Error message" }`

### GET /api/users/addresses

Retrieves all saved addresses for the logged-in user.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Array of address objects.
        *   Address Object: `{ "_id": "...", "type": "...", "addressLine1": "...", "addressLine2": "...", "city": "...", "state": "...", "zipCode": "...", "country": "...", "isDefault": Boolean }`
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error while fetching addresses" }`

### POST /api/users/addresses

Adds a new address for the logged-in user.

*   **Request Body:**
    *   `type` (String, required): Type of address (e.g., "Home", "Work").
    *   `addressLine1` (String, required): First line of the address.
    *   `addressLine2` (String, optional): Second line of the address.
    *   `city` (String, required): City.
    *   `state` (String, required): State/Province.
    *   `zipCode` (String, required): Postal/Zip code.
    *   `country` (String, required): Country.
    *   `isDefault` (Boolean, optional): Whether this address should be set as the default. If true, other addresses will be set to not default.
*   **Responses:**
    *   `201 Created`: Returns the newly added address object.
    *   `400 Bad Request`: `{ "message": "Type, address line 1, city, state, zip code, and country are required" }`
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error` (or other status from error handler): `{ "message": "Error message" }`

### PUT /api/users/addresses/:addressId

Updates an existing address for the logged-in user.

*   **URL Parameters:**
    *   `addressId` (String, required): The ID of the address to update.
*   **Request Body:** (All fields are optional, provide only those to be updated)
    *   `type` (String)
    *   `addressLine1` (String)
    *   `addressLine2` (String)
    *   `city` (String)
    *   `state` (String)
    *   `zipCode` (String)
    *   `country` (String)
    *   `isDefault` (Boolean): If true, other addresses will be set to not default.
*   **Responses:**
    *   `200 OK`: Returns the updated list of all user addresses.
    *   `404 Not Found`:
        *   `{ "message": "User not found" }`
        *   `{ "message": "Address not found" }`
    *   `500 Internal Server Error` (or other status from error handler): `{ "message": "Error message" }`

### DELETE /api/users/addresses/:addressId

Deletes an address for the logged-in user. If the deleted address was the default, and other addresses exist, the first remaining address becomes the default.

*   **URL Parameters:**
    *   `addressId` (String, required): The ID of the address to delete.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: `{ "message": "Address removed", "addresses": [...] }` (Returns the updated list of user addresses)
    *   `404 Not Found`:
        *   `{ "message": "User not found" }`
        *   `{ "message": "Address not found" }`
    *   `500 Internal Server Error` (or other status from error handler): `{ "message": "Error message" }`

### PUT /api/users/addresses/:addressId/default

Sets a specific address as the default for the logged-in user. All other addresses will be marked as not default.

*   **URL Parameters:**
    *   `addressId` (String, required): The ID of the address to set as default.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Returns the updated list of all user addresses.
    *   `404 Not Found`:
        *   `{ "message": "User not found" }`
        *   `{ "message": "Address not found to set as default" }`
    *   `500 Internal Server Error` (or other status from error handler): `{ "message": "Error message" }`

## Wishlist Routes (`wishlistRoutes.js` & `wishlistController.js`)

These routes manage the user's wishlist. All routes require authentication. The API prefix is `/api/wishlist`.

### POST /api/wishlist/add

Adds an item to the user's wishlist.

*   **Request Body:**
    *   `productId` (String, required): The ID of the product.
    *   `name` (String, required): The name of the product.
    *   `price` (Number, required): The price of the product.
    *   `image` (String, optional): URL of the product image.
    *   `attributes` (String, optional): Product attributes (e.g., size, color).
*   **Responses:**
    *   `200 OK`: Returns the updated wishlist (Array of wishlist item objects).
        *   Wishlist Item Object: `{ "productId": "...", "name": "...", "price": ..., "image": "...", "attributes": "..." }`
    *   `400 Bad Request`: `{ "message": "Item already in wishlist" }` (If the exact item already exists)
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`

### DELETE /api/wishlist/remove/:productId

Removes an item from the user's wishlist.

*   **URL Parameters:**
    *   `productId` (String, required): The ID of the product to remove from the wishlist.
*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Returns the updated wishlist (Array of wishlist item objects).
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`

### GET /api/wishlist/

Retrieves all items in the user's wishlist.

*   **Request Body:** None
*   **Responses:**
    *   `200 OK`: Returns the user's wishlist (Array of wishlist item objects).
    *   `404 Not Found`: `{ "message": "User not found" }`
    *   `500 Internal Server Error`: `{ "message": "Server error" }`
