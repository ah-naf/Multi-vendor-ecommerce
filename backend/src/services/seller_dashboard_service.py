# backend/src/services/seller_dashboard_service.py
from ..models.order_model import OrderModel
from ..models.product_model import ProductModel
from datetime import datetime, timedelta

class SellerDashboardService:
    def __init__(self):
        self.order_model = OrderModel()
        self.product_model = ProductModel()

    def get_sales_data(self, seller_id, period):
        if not isinstance(seller_id, int) or seller_id <= 0:
            raise ValueError("Invalid seller ID")

        # Determine date range based on period
        end_date = datetime.utcnow()
        if period == 'today':
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = (end_date - timedelta(days=end_date.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'month':
            start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == 'year':
            start_date = end_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            # This case should ideally be caught by the controller
            raise ValueError("Invalid period specified")

        # In a real app, orders would be associated with sellers.
        # Assuming OrderModel can filter orders by seller_id and date_range.
        return self.order_model.get_sales_summary_by_seller(seller_id, start_date, end_date, period)

    # TODO: Implement other service methods for seller dashboard
