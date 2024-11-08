const Message = require('../models/message');

const handleSendMessage = (socket, io) => {
    socket.on('sendMessage', async (messageData) => {
        try {
            const { sender_id, receiver_id, message } = messageData;
            // Save message to MongoDB
            const chatMessage = new Message({ sender_id, receiver_id, message });
            await chatMessage.save();

            // Emit new message
            io.emit('newMessage', messageData);
            socket.emit('messageSent', { status: 'success', message: messageData });

            console.log(messageData);
        } catch (err) {
            console.error(err);
        }
    });
};

const handleDeleteMessage = (socket, io) => {
    socket.on('deleteMessage', async (messageId) => {
        try {
            // Delete message from MongoDB
            const result = await Message.findByIdAndDelete(messageId);
            if (!result) {
                return socket.emit('error', 'Message not found');
            }

            // Emit delete message event
            io.emit('deleteMessage', messageId);
        } catch (err) {
            console.error(err);
        }
    });
};

const handleUpdateMessage = (socket, io) => {
    socket.on('updateMessage', async (updatedMessage) => {
        try {
            const { id, message } = updatedMessage;
            // Update message in MongoDB
            const result = await Message.findByIdAndUpdate(id, { message }, { new: true });
            if (!result) {
                return socket.emit('error', 'Message not found');
            }

            // Emit updated message event
            io.emit('updateMessage', result);
        } catch (err) {
            console.error(err);
        }
    });
};

module.exports = {
    handleSendMessage,
    handleDeleteMessage,
    handleUpdateMessage,
};


const messageEvents = require('./socket_events');

const setupSocketEvents = (socket, io) => {
    // Gán các hàm xử lý sự kiện cho socket
    messageEvents.handleSendMessage(socket, io);
    messageEvents.handleDeleteMessage(socket, io);
    messageEvents.handleUpdateMessage(socket, io);

};

module.exports = setupSocketEvents;
