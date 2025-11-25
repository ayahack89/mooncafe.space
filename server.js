const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// In-memory data store for users
let users = {};

// Socket.IO connection logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a new user joins
    socket.on('newUser', (userData) => {
        // Store user data
        users[socket.id] = {
            username: userData.username,
            avatar: userData.avatar,
            id: socket.id
        };
        console.log(`${userData.username} has joined the chat.`);

        // Broadcast a system message to all clients that a user has joined
        socket.broadcast.emit('systemMessage', `${userData.username} has joined the chat.`);
        
        // Send the updated user list to all clients
        io.emit('userList', Object.values(users));
    });

    // When a user sends a chat message
    socket.on('chatMessage', (messageData) => {
        const user = users[socket.id];
        if (user) {
            // Create the full message object to be sent to clients
            const fullMessage = {
                username: user.username,
                avatar: user.avatar,
                text: messageData.text,
                style: messageData.style,
                timestamp: new Date()
            };

            // Broadcast the message to all clients, including the sender
            io.emit('message', fullMessage);
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log(`${user.username} has left the chat.`);
            
            // Remove user from the store
            delete users[socket.id];

            // Broadcast a system message to all clients that a user has left
            io.emit('systemMessage', `${user.username} has left the chat.`);
            
            // Send the updated user list to all clients
            io.emit('userList', Object.values(users));
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
