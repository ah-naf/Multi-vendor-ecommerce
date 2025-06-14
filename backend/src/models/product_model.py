# backend/src/models/product_model.py

class ProductModel:
    def get_low_stock_count(self, seller_id, threshold=5):
        # Placeholder: Query DB for products with stock < threshold for this seller
        print(f"Fetching low stock product count for seller_id: {seller_id} with threshold: {threshold} (mock)")
        return 3 # Dummy count

    def search_products_by_name(self, seller_id, search_term):
        # Placeholder for product search by name for a specific seller
        print(f"Searching products for seller_id: {seller_id} with term: '{search_term}' (mock)")
        # Dummy data
        if "test" in search_term.lower():
            return [
                {"product_id": 101, "name": "Test Product A", "stock": 10, "price": 50.00},
                {"product_id": 102, "name": "Another Test Product B", "stock": 3, "price": 120.00},
            ]
        return []

    # TODO: Implement other product model methods
