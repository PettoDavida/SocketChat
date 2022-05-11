require("dotenv").config();

const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const express = require('express');
const socketio= require('socket.io');
const formatMessage = require('./utils/messages')
const { createNewUser, userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
const { userJoinRoom, userLeaveRoom, getRoomByUser } = require("./utils/rooms");

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const roomsRouter = require("./routes/rooms")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', (err) => {
    console.log("Mongoose Error");
    console.log(err);
});

db.once('open', () => console.log("Connected to database"));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

app.use("/api/rooms", roomsRouter);

const admin = 'SocketChat Bot'

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if(!username) {
        // TODO: Check username
        next(new Error("invalid username"));
        return;
    }

    socket.user = createNewUser(socket.id, username);
    next();
});

// Run when client connects
io.on('connection', (socket) => {
    socket.emit("successLogin", socket.user);
    socket.on("joinRoom", (roomId) => {
        let oldRoom = getRoomByUser(socket.user.id);
        if(oldRoom) {
            io.to(oldRoom.name).emit('message', formatMessage(admin, `${socket.user.username} has left the chat`))
            userLeaveRoom(oldRoom.id, socket.user.id);
        }

        roomId = parseInt(roomId);
        let room = userJoinRoom(roomId, socket.user.id);
        if(!room) {
            socket.emit("noRoom");
            return;
        }

        console.log(room);
        socket.join(room.name)

        // Welcome message to current user
        socket.emit('message', formatMessage(admin, 'Welcome to SocketChat'))

        socket.emit('message', formatMessage(admin, `Joined ${room.name}`));

        // Broadcast when user joins chat
        socket.broadcast.to(room.name).emit('message', formatMessage(admin, `${socket.user.username} has joined the chat`))

        // Send info about users in room to frontend
        /*
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        */
    });

    socket.on('chatMessage', (msg) => {
        // const user = getCurrentUser(socket.id)
        let room = getRoomByUser(socket.user.id);

        io.to(room.name).emit('message', formatMessage(socket.user.username, msg))
    })

    socket.on('disconnect', () => {
        let oldRoom = getRoomByUser(socket.user.id);
        if(oldRoom) {
            io.to(oldRoom.name).emit('message', formatMessage(admin, `${socket.user.username} has left the chat`))
            userLeaveRoom(oldRoom.id, socket.user.id);
        }
    });

    /*
    socket.on('joinRoom', ({ roomId }) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        // Welcome message to current user
        socket.emit('message', formatMessage(admin, 'Welcome to SocketChat'))

        // Broadcast when user joins chat
        socket.broadcast.to(user.room).emit('message', formatMessage(admin, `${user.username} has joined the chat`))

        // Send info about users in room to frontend
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })


    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // Broadcast when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(admin, `${user.username} has left the chat`))
            
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })
    */
})

const port = 3000

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})