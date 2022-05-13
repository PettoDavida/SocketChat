let express = require('express');
let router = express.Router();

const { getAllRooms, createNewRoom } = require("../utils/rooms")

router.get("/", (req, res) => {
    let rooms = getAllRooms();
    res.status(200).json(rooms);
});

router.post("/", (req, res) => {
    if(!req.body.name) {
        res.status(400).json({ message: "No name provided" });
        return;
    }

    let room = createNewRoom(req.body.name);
    if(room) {
        req.app.locals.io.emit("updateRoomList");
        res.status(201).json({ message: "Created new room", id: room.id });
    } else {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;