let rooms = [];
let nextRoomId = 0;

function generateNewRoomId() {
    let result = nextRoomId;
    nextRoomId++;

    return result;
}

function createNewRoom(name) {
    let room = {
        id: generateNewRoomId(),
        name,
        users: [],
    };

    rooms.push(room);

    return room;
}

function getAllRooms() {
    return rooms;
}

function userJoinRoom(roomId, userId) {
    for (let index = 0; index < rooms.length; index++) {
        if(rooms[index].id === roomId) {
            // TODO: Check if user is already there
            rooms[index].users.push(userId);
            return rooms[index];
        }
    }
}

function userLeaveRoom(roomId, userId) {
    for (let index = 0; index < rooms.length; index++) {
        let room = rooms[index];
        if(room.id === roomId) {
            for (let userIndex = 0; userIndex < room.users.length; userIndex++) {
                if(room.users[userIndex] === userId) {
                    room.users.splice(userIndex, 1);
                    break;
                }
            }
        }
    }
}

function getRoomByUser(userId) {
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
        let room = rooms[roomIndex];
        for (let userIndex = 0; userIndex < room.users.length; userIndex++) {
            if(room.users[userIndex] === userId) {
                return room;
            }
        }
    }
}

module.exports = {
    createNewRoom,
    getAllRooms,
    userJoinRoom,
    userLeaveRoom,
    getRoomByUser,
}