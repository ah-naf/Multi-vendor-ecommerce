# backend/src/services/customer_dashboard_service.py
from ..models.order_model import OrderModel
from ..models.wishlist_model import WishlistModel

class CustomerDashboardService:
    def __init__(self):
        self.order_model = OrderModel()
        self.wishlist_model = WishlistModel()

    def get_total_orders(self, customer_id):
        # Basic validation (can be expanded)
        if not isinstance(customer_id, int) or customer_id <= 0:
            raise ValueError("Invalid customer ID")

        # In a real application, you would fetch data from a database via the model
        # For now, let's assume the model returns a count directly
        return self.order_model.count_orders_by_customer(customer_id)

    def get_wishlist_items(self, customer_id):
        if not isinstance(customer_id, int) or customer_id <= 0:
            raise ValueError("Invalid customer ID")

        # This will call a method on WishlistModel, to be implemented next
        # For now, assume it returns a list of item details (e.g., product name, image, price)
        return self.wishlist_model.get_items_by_customer(customer_id)

    def get_total_spent(self, customer_id):
        if not isinstance(customer_id, int) or customer_id <= 0:
            raise ValueError("Invalid customer ID")

        # This will call a method on OrderModel
        return self.order_model.get_total_spent_by_customer(customer_id)

    def get_recent_orders(self, customer_id, limit):
        if not isinstance(customer_id, int) or customer_id <= 0:
            raise ValueError("Invalid customer ID")
        if not isinstance(limit, int) or limit <= 0:
            raise ValueError("Invalid limit for recent orders")

        # This will call a method on OrderModel
        return self.order_model.get_recent_orders_by_customer(customer_id, limit)

    def get_active_order(self, customer_id):
        if not isinstance(customer_id, int) or customer_id <= 0:
            raise ValueError("Invalid customer ID")

        # This will call a method on OrderModel
        # An active order might be defined as one that is 'Pending' or 'Shipped'
        return self.order_model.get_active_order_by_customer(customer_id)

    # TODO: Implement other service methods for customer dashboard
