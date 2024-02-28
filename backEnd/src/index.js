const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('database.db');

db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender TEXT,
  receiver TEXT,
  content TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

io.on('connection', socket => {
    console.log('A user connected');

    socket.on('join', userId => {
        console.log(`User ${userId} is joining the room.`);
        socket.join(userId);
        console.log(`User ${userId} joined the room.`);
    });

    socket.on('sendMessage', message => {
        console.log('Received a new message:', message);
        const { sender, receiver, content } = message;
        db.run('INSERT INTO messages (sender, receiver, content) VALUES (?, ?, ?)', [sender, receiver, content], err => {
            if (err) {
                console.error('Error inserting message:', err);
            } else {
                io.to(receiver).emit('newMessage', message);
            }
        });
    });
    socket.on('getOldMessages', receiverId => {
        db.all('SELECT * FROM messages WHERE receiver = ?', [receiverId], (err, rows) => {
            if (err) {
                console.error('Error fetching old messages:', err);
            } else {
                socket.emit('oldMessages', rows);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
