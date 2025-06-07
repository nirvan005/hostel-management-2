import React from "react";
import { useNavigate } from "react-router";

const Rooms = ({ rooms }) => {
  const navigate = useNavigate();
  const goToRoom = (room_no) => {
    navigate(`/student/${room_no}`);
  };
  const handleClick = (e) => {
    const room_no = e.target.textContent;
    goToRoom(room_no);
  };
  return (
    <div className="d-flex flex-wrap gap-2 rooms-content">
      {rooms.map((room, idx) => (
        <span
          key={idx}
          className={`p-3 mx-4 room-each rounded w-16 ${
            room.status.toLowerCase() === "occupied"
              ? "bg-danger text-white"
              : "bg-success text-white"
          }`}
          onClick={handleClick}
        >
          {room.room_no}
        </span>
      ))}
    </div>
  );
};

export default Rooms;
