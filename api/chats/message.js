const express = require('express');
const router = express.Router();

const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);


const Message = require('../../models/message')


router.post('/api/messages', async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        const chatMessage = new Message({ senderId, receiverId, message });
        await chatMessage.save();

        io.emit('newMessage', req.body); // Phát tin nhắn mới đến tất cả các kết nối Socket.IO

        res.status(200).json({ success: true, message: 'Message sent' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender_id: userId }, { receiver_id: userId }]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gt: ["$sender_id", "$receiver_id"] },
                            { sender_id: "$receiver_id", receiver_id: "$sender_id" },
                            { sender_id: "$sender_id", receiver_id: "$receiver_id" }
                        ]
                    },
                    lastMessage: { $last: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" }
            },
            {
                $sort: { timestamp: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Danh sách dữ liệu cuộc trò chuyện",
            data: conversations
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});



module.exports = router;
