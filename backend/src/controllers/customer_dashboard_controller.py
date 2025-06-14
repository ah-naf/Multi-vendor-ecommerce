# backend/src/controllers/customer_dashboard_controller.py
from flask import jsonify
from ..services.customer_dashboard_service import CustomerDashboardService

class CustomerDashboardController:
    def __init__(self):
        self.service = CustomerDashboardService()

    def get_total_orders(self, customer_id):
        try:
            total_orders = self.service.get_total_orders(customer_id)
            return jsonify({"total_orders": total_orders}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_active_order(self, customer_id):
        try:
            active_order = self.service.get_active_order(customer_id)
            if active_order:
                return jsonify({"active_order": active_order}), 200
            else:
                return jsonify({"message": "No active order found"}), 404 # Not Found
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_recent_orders(self, customer_id):
        from flask import request # Import request here
        try:
            limit = request.args.get('limit', default=5, type=int)
            if limit <= 0:
                return jsonify({"error": "Limit must be positive"}), 400

            recent_orders = self.service.get_recent_orders(customer_id, limit)
            return jsonify({"recent_orders": recent_orders}), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_total_spent(self, customer_id):
        try:
            total_spent = self.service.get_total_spent(customer_id)
            return jsonify({"total_spent": total_spent}), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_wishlist_items(self, customer_id):
        try:
            wishlist_items = self.service.get_wishlist_items(customer_id)
            return jsonify({"wishlist_items": wishlist_items}), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400 # Bad request for invalid ID
        except Exception as e:
            return jsonify({"error": str(e)}), 500
