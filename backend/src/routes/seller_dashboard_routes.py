# backend/src/routes/seller_dashboard_routes.py
from flask import Blueprint, jsonify

from ..controllers.seller_dashboard_controller import SellerDashboardController

seller_dashboard_bp = Blueprint('seller_dashboard_bp', __name__, url_prefix='/seller/<int:seller_id>/dashboard')
seller_dashboard_controller = SellerDashboardController()

@seller_dashboard_bp.route('/sales-data', methods=['GET'])
def get_sales_data(seller_id):
    # Period will be a query param: ?period=today|week|month|year
    return seller_dashboard_controller.get_sales_data(seller_id)

@seller_dashboard_bp.route('/sales-performance', methods=['GET'])
def get_sales_performance(seller_id):
    return seller_dashboard_controller.get_sales_performance(seller_id)

# TODO: Define other routes for seller dashboard
# Placeholder ping route can be removed or kept for testing
@seller_dashboard_bp.route('/ping', methods=['GET'])
def ping(seller_id):
    return jsonify({"message": f"Seller dashboard for seller {seller_id} is active"}), 200
