

const path = require('path');
const http = require('http');
const express = require('express');
const socketio= require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

const admin = 'SocketChat Bot'

// Run when client connects
io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // Welcome message to current user
    socket.emit('message', formatMessage(admin, 'Welcome to SocketChat'))

    // Broadcast when user joins chat
    socket.broadcast.to(user.room).emit('message', formatMessage(admin, `${user.username} has joined the chat`))

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
})

const port = 3000

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})