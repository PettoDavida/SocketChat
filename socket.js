const socketio = require('socket.io');

let io = null; 
const admin = 'SocketChat Bot'

function getIO() {
    return io;
}

function initializeSocket(server) {
    io = socketio(server)

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

        socket.on("startTyping", () => {
            let room = getRoomByUser(socket.user.id);
            if(room) {
                io.to(room.name).emit("userTyping", socket.user);
            }
        });

        socket.on("endTyping", () => {
            let room = getRoomByUser(socket.user.id);
            if(room) {
                io.to(room.name).emit("userStoppedTyping", socket.user);
            }
        });

        socket.on("joinRoom", (roomId) => {
            let oldRoom = getRoomByUser(socket.user.id);
            if(oldRoom) {
                socket.leave(oldRoom.name);
                if(userLeaveRoom(oldRoom.id, socket.user.id)) {
                    socket.emit("updateRoomList");
                }
            }

            roomId = parseInt(roomId);
            let room = userJoinRoom(roomId, socket.user.id);
            if(!room) {
                socket.emit("noRoom");
                return;
            }

            console.log(room);
            socket.join(room.name)

            socket.emit("joinedRoom", room);

            if(oldRoom) {
                io.to(oldRoom.name).emit('message', formatMessage(admin, `${socket.user.username} has left the chat`))
            }

            // Welcome message to current user
            socket.emit('message', formatMessage(admin, 'Welcome to SocketChat'))

            socket.emit('message', formatMessage(admin, `Joined ${room.name}`));

            // Broadcast when user joins chat
            socket.broadcast.to(room.name).emit('message', formatMessage(admin, `${socket.user.username} has joined the chat`))

        });

        socket.on('chatMessage', (msg) => {
            // const user = getCurrentUser(socket.id)
            let room = getRoomByUser(socket.user.id);

            io.to(room.name).emit('message', formatMessage(socket.user.username, msg))
        })

        socket.on('disconnect', () => {
            let oldRoom = getRoomByUser(socket.user.id);
            if(oldRoom) {
                userLeaveRoom(oldRoom.id, socket.user.id);
                io.to(oldRoom.name).emit('message', formatMessage(admin, `${socket.user.username} has left the chat`))
            }
        });
    })
}


module.exports = {
    initializeSocket,
    getIO,
}