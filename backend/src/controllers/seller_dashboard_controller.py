# backend/src/controllers/seller_dashboard_controller.py
from flask import jsonify, request
from ..services.seller_dashboard_service import SellerDashboardService

class SellerDashboardController:
    def __init__(self):
        self.service = SellerDashboardService()

    def get_sales_data(self, seller_id):
        period = request.args.get('period', default='today', type=str)
        valid_periods = ['today', 'week', 'month', 'year']
        if period not in valid_periods:
            return jsonify({"error": f"Invalid period. Valid periods are: {', '.join(valid_periods)}"}), 400

        try:
            sales_data = self.service.get_sales_data(seller_id, period)
            return jsonify(sales_data), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_sales_performance(self, seller_id):
        try:
            performance_data = self.service.get_sales_performance(seller_id)
            return jsonify(performance_data), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # TODO: Implement other controller methods for seller dashboard
