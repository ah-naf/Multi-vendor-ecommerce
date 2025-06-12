// backend/controllers/PaymentController.js
const Transaction = require('../models/Transaction');
const User = require('../models/User'); // Assuming User model might be needed later
const { v4: uuidv4 } = require('uuid');

const processPayment = async (req, res) => {
    const { userId, amount, paymentMethodData } = req.body;

    if (!userId || !amount || !paymentMethodData) {
        return res.status(400).json({ message: 'Missing required payment details.' });
    }

    // Simulate payment processing
    // For testing: if amount is 999, simulate failure.
    const isPaymentSuccessful = amount !== 999;
    const transactionId = uuidv4();
    const gatewayTransactionId = `gw_${uuidv4()}`; // Mock payment gateway transaction ID

    try {
        // We should validate userId exists if we have User model imported
        // const user = await User.findById(userId);
        // if (!user) {
        //     return res.status(404).json({ message: 'User not found.' });
        // }

        const newTransaction = new Transaction({
            id: transactionId,
            userId,
            // orderId will be updated later by the Order controller after order creation
            amount,
            paymentGatewayTransactionId: gatewayTransactionId,
            status: isPaymentSuccessful ? 'Paid' : 'Failed',
            date: new Date(),
        });

        await newTransaction.save();

        if (isPaymentSuccessful) {
            res.status(200).json({
                message: 'Payment processed successfully.',
                transaction: newTransaction
            });
        } else {
            res.status(400).json({
                message: 'Payment processing failed.',
                transaction: newTransaction
            });
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ message: 'Server error during payment processing.' });
    }
};

module.exports = { processPayment };
