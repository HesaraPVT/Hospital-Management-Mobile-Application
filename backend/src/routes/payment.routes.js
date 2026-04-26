const express = require('express');
const { createPayment, getPayments, getPaymentById, updatePayment, deletePayment } = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getPayments);
router.post('/', createPayment);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
