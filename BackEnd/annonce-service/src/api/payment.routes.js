const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../core/payment.services');

router.post('/pay', createPaymentIntent);

module.exports = router;