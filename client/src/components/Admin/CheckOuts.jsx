import { useEffect, useState } from "react";
import axios from "axios";
export default function CheckOuts() {
  const [assigned, setAssigned] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [Data, setData] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:4000/student/assigned-students")
      .then((res) => {
        setAssigned(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const renderTable = (data) => (
    <table className="table table-bordered table-dark table-striped payments-table w-75">
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Student Name</th>
          <th>Room No</th>
          <th>Floor No</th>
          <th>CheckOut Time</th>
          <th>CheckIn Time</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.student_id}>
            <td>{item.student_id}</td>
            <td>{item.name}</td>
            <td>{item.room_no}</td>
            <td>{item.floor_no}</td>
            <td>{item.checkin_time?.replace("T", " ").slice(0, 19)}</td>
            <td>{item.checkout_time?.replace("T", " ").slice(0, 19)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="change-room-body me-4">
      <h2 className="change-room-heading">
        CheckIn and CheckOut records of Student
      </h2>

      <select
        className="form-select mb-3 bg-dark text-white w-100"
        value={selectedId}
        onChange={(e) => {
          setData([]);
          setSelectedId(e.target.value);
          console.log(e.target.value);
          axios
            .get(
              `http://localhost:4000/checkinout?student_id=${e.target.value}`
            )
            .then((res) => {
              setData(res.data);
            })
            .catch((err) => console.log("Some error occured", err));
        }}
        required
      >
        <option value="" className="bg-dark text-white">
          Select a student
        </option>
        {assigned.map((user) => (
          <option key={user.user_id} value={user.user_id}>
            {user.name} ({user.username})
          </option>
        ))}
      </select>

      {selectedId && renderTable(Data)}
    </div>
  );
}
