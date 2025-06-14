# backend/src/routes/customer_dashboard_routes.py
from flask import Blueprint, jsonify
from ..controllers.customer_dashboard_controller import CustomerDashboardController

customer_dashboard_bp = Blueprint('customer_dashboard_bp', __name__, url_prefix='/customer/<int:customer_id>/dashboard')
customer_dashboard_controller = CustomerDashboardController()

@customer_dashboard_bp.route('/total-orders', methods=['GET'])
def get_total_orders(customer_id):
    return customer_dashboard_controller.get_total_orders(customer_id)

@customer_dashboard_bp.route('/wishlist-items', methods=['GET'])
def get_wishlist_items(customer_id):
    return customer_dashboard_controller.get_wishlist_items(customer_id)

@customer_dashboard_bp.route('/total-spent', methods=['GET'])
def get_total_spent(customer_id):
    return customer_dashboard_controller.get_total_spent(customer_id)

@customer_dashboard_bp.route('/recent-orders', methods=['GET'])
def get_recent_orders(customer_id):
    # TODO: Add query param for number of orders, e.g., /recent-orders?limit=5
    return customer_dashboard_controller.get_recent_orders(customer_id)

@customer_dashboard_bp.route('/active-order', methods=['GET'])
def get_active_order(customer_id):
    return customer_dashboard_controller.get_active_order(customer_id)
