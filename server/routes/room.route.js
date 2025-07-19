const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/room.controller");

router.get("/rooms", RoomController.getRooms);
router.post("/room-request", RoomController.roomRequest);
router.post("/change-room-request", RoomController.changeRoomRequest);
router.post("/change-room", RoomController.changeRoom);
router.post("/assign-room", RoomController.assignRoom);
router.get("/floors", RoomController.getFloors);
module.exports = router;
