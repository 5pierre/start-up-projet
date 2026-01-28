const { getMessages, createMessage } = require('../data/message');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
    if (!token) throw new Error("No token provided");
    return jwt.verify(token, Key);
};

// GET ALL MESSAGES
async function getAllMessages(req, res) {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ error: "user1 and user2 are required" });
    }

    const messages = await getMessages(user1, user2);
    
    if (!messages || messages.length === 0) {
      return res.status(200).json({ message: "No messages found", messages: [] });
    }
    res.status(200).json({ messages });
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Messages fetched successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching messages: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching messages" });
  }
}

// CREATE MESSAGE
async function createNewMessage(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(403).send("Access denied");
  const { content, id_user_2 } = req.body;
  const decodedToken = verifyToken(token);
  try {
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: "Messages content is required and must be a non-empty string" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ error: "Message is too long (max 5000 characters)" });
      }

      if (content.length < 5) {
        return res.status(400).json({ error: "Message is too short (min 5 characters)" });
      }
      const id_user_1 = decodedToken.id;
      const newMessage = await createMessage(id_user_1, id_user_2, content)


      res.status(201).json({
        message: "Message created successfully",
        newMessage: newMessage
      });
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Message created successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error creating message: " + err + "\n");
    res.status(500).json({ error: "Internal error while creating message" });
  }
}

module.exports = { getAllMessages, createNewMessage };