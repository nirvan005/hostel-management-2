import { useEffect, useState } from "react";
import axios from "axios";
import StudentCard from "./StudentCard";
import { useParams } from "react-router";

const Room = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { room_no } = useParams();
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/student/${room_no}`
        );
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [room_no]);

  return (
    <div className="p-4 search-room">
      <h2 className="text-xl font-bold mb-3">Students in Room {room_no}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : students.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {students.map((student) => (
            <StudentCard key={student.student_id} student={student} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No students found in this room.</p>
      )}
    </div>
  );
};

export default Room;
