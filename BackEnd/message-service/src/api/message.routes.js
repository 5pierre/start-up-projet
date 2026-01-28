const express = require('express');
const router = express.Router();
const { getAllMessages, createNewMessage, getUserConversations } = require('../core/message.services');


router.get('/conversations', getUserConversations);router.post('/messages', createNewMessage);
router.post('/messages', createNewMessage);
router.get('/messages/:user2Id', getAllMessages);


module.exports = router;
