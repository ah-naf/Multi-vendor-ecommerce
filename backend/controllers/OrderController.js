// backend/controllers/OrderController.js
const OrderDetail = require('../models/OrderDetail');
const Transaction = require('../models/Transaction');
// const User = require('../models/User'); // If needed for user validation
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res) => {
    const {
        userId,
        items,
        shippingAddress,
        payment, // Expects { method, last4, billingAddress, clientTransactionId (this is the ID of the transaction document) }
        summary
    } = req.body;

    if (!userId || !items || !shippingAddress || !payment || !summary || !payment.clientTransactionId) {
        return res.status(400).json({ message: 'Missing required order details or transaction ID.' });
    }

    try {
        // 1. Validate Transaction
        const paidTransaction = await Transaction.findOne({ id: payment.clientTransactionId, userId: userId, status: 'Paid' });

        if (!paidTransaction) {
            return res.status(400).json({ message: 'Invalid or unpaid transaction ID. Order cannot be created.' });
        }

        // Check if this transaction has already been used for an order
        if (paidTransaction.orderId) {
            return res.status(400).json({ message: 'This transaction has already been linked to an order.' });
        }

        // 2. Generate Order ID
        const orderIdString = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

        // 3. Create OrderDetail object
        const newOrder = new OrderDetail({
            id: orderIdString,
            userId,
            date: new Date(),
            status: 'Processing',
            items,
            shippingAddress,
            payment: { // Construct payment object for OrderDetail
                method: payment.method,
                last4: payment.last4,
                billingAddress: payment.billingAddress,
                transactionId: paidTransaction._id // Link to the Transaction document's ObjectId
            },
            summary,
        });

        // 4. Save the Order
        await newOrder.save();

        // 5. Update Transaction with OrderId
        paidTransaction.orderId = newOrder._id; // Link transaction to the new OrderDetail's ObjectId
        await paidTransaction.save();

        res.status(201).json(newOrder);

    } catch (error) {
        console.error('Order creation error:', error);
        // Check for duplicate key error for order id (though uuid should make it rare)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.id) {
            return res.status(409).json({ message: 'Order ID generation conflict. Please try again.' });
        }
        res.status(500).json({ message: 'Server error during order creation.' });
    }
};

const getCustomerOrders = async (req, res) => {
    const userId = req.user.id; // Assuming authMiddleware sets req.user.id

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        const orders = await OrderDetail.find({ userId })
            .sort({ date: -1 }) // Sort by the 'date' field in descending order
            .populate('payment.transactionId'); // Populate transaction details

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders.' });
    }
};

const getOrderDetails = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id; // Assuming authMiddleware sets req.user.id

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required.'});
    }

    try {
        const order = await OrderDetail.findOne({ id: orderId, userId })
            .populate('payment.transactionId'); // Populate transaction details

        if (!order) {
            return res.status(404).json({ message: 'Order not found or access denied.' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Server error while fetching order details.' });
    }
};

module.exports = {
    createOrder,
    getCustomerOrders,
    getOrderDetails
};
