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

function getRoomById(roomId) {
    for (let index = 0; index < rooms.length; index++) {
        let room = rooms[index];
        if(room.id === roomId) {
            return room;
        }
    }

    return null;
}

function userJoinRoom(roomId, userId) {
    for (let index = 0; index < rooms.length; index++) {
        if(rooms[index].id === roomId) {
            let room = rooms[index];
            for (let userIndex = 0; userIndex < room.users.length; userIndex++) {
                if(room.users[userIndex] === userId) {
                    return room;
                }
            }
            rooms[index].users.push(userId);
            return room;
        }
    }
}

function userLeaveRoom(roomId, userId) {
    let removeRoom = false;
    let removeRoomIndex = 0;

    for (let index = 0; index < rooms.length; index++) {
        let room = rooms[index];
        if(room.id === roomId) {
            for (let userIndex = 0; userIndex < room.users.length; userIndex++) {
                if(room.users[userIndex] === userId) {
                    room.users.splice(userIndex, 1);
                    if(room.users.length <= 0) {
                        removeRoom = true;
                        removeRoomIndex = index;
                    }
                    break;
                }
            }
        }
    }

    if(removeRoom) {
        rooms.splice(removeRoomIndex, 1);
        return true;
    }

    return false;
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
    getRoomById,
    userJoinRoom,
    userLeaveRoom,
    getRoomByUser,
}