const path = require('path');
const http = require('http');
const express = require('express');
const socketio= require('socket.io');

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => {
    console.log('hello')
})

const port = 3000

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})