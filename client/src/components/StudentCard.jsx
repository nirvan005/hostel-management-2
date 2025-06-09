import { useState } from "react";

function StudentCard({ student }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <div
        typeof="button"
        className="bg-gray-800 text-white p-4 rounded-lg cursor-pointer student-data"
      >
        {/* Basic Info */}
        <div
          typeof="button"
          className="flex justify-between items-center student-card w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <h3 className="text-lg font-bold text-center flex-1">
            {student.name}
          </h3>
          <span className="text-sm r-no">Room No:{student.room_no}</span>
          <span className="text-sm f-no">Floor:{student.floor_no}</span>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div
            className={`mt-1 text-gray-300 student-card text-start more-info-box ${
              expanded ? "expanded" : ""
            }`}
          >
            <p>Name: {student.name}</p>
            <p>Student ID: {student.student_id}</p>
            <p>Email: {student.email}</p>
            <p>Phone: {student.phone}</p>
            <p>Room No: {student.room_no}</p>
            <p>Floor No: {student.floor_no}</p>
            <p>Father's Name: {student.fathers_name}</p>
            <p>Mother's Name: {student.mothers_name}</p>
            <p>Parent's Contact: {student.parent_phone}</p>
            <p>Address: {student.address}</p>
          </div>
        )}
      </div>
    </>
  );
}
export default StudentCard;
