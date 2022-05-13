let express = require('express');
let router = express.Router();

const { getRoomById } = require("../utils/rooms")

router.get("/:roomId", (req, res) => {
    let roomId = parseInt(req.params.roomId);
    let room = getRoomById(roomId);
    if(room) {
        let users = [];
        for(let i = 0; i < room.users.length; i++) {
            users.push(req.app.locals.io.sockets.sockets.get(room.users[i]).user);
        }
        res.status(200).json(users);
    } else {
        res.status(404).json({ message: "No room" });
    }
});

module.exports = router;