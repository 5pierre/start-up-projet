const express = require('express');
const router = express.Router();
const { getAllMessages, createNewMessage } = require('../core/message.services');


router.get('/messages', getAllMessages);
router.post('/messages', createNewMessage);


module.exports = router;
