// Payments.jsx
import { useState, useEffect } from "react";
import axios from "axios";

function Payments() {
  const [activeTab, setActiveTab] = useState("records");
  const [pendingList, setPendingList] = useState([]);
  const [recordsList, setRecordsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  let [added, setAdded] = useState(0);
  useEffect(() => {
    fetchData();
    setAdded(0);
  }, []);

  const fetchData = async () => {
    const paidRes = await axios.get("http://localhost:4000/payment");
    setRecordsList(paidRes.data);
    const pendingRes = await axios.get("http://localhost:4000/payment/pending");
    setPendingList(pendingRes.data);
  };

  const handleUpdate = async () => {
    try {
      await axios.post("http://localhost:4000/payment/mark-paid", {
        student_id: selectedStudent,
      });
      setAdded(1);
      await fetchData();
      setTimeout(() => {
        setAdded(0);
      }, 3000);
      setSelectedStudent("");
    } catch (error) {
      setAdded(2);
      setTimeout(() => {
        setAdded(0);
      }, 3000);
    }
  };

  const renderTable = (data) => (
    <table className="table table-bordered table-dark table-striped payments-table w-75">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Room No</th>
          <th>Floor No</th>
          <th>
            Amount {activeTab == "pending" ? "Due" : null}{" "}
            {activeTab == "records" ? "Paid" : null}
          </th>
          <th>Semester</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.student_id}>
            <td>{item.name}</td>
            <td>{item.room_no}</td>
            <td>{item.floor_no}</td>
            <td>₹{item.amount}</td>
            <td>{item.sem}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container text-white payments-page">
      <ul className="nav nav-tabs mb-4 payments-heading w-75">
        <li className="nav-item">
          <button
            className={`nav-link text-secondary fw-bold ${
              activeTab === "records" ? "active" : ""
            }`}
            onClick={() => setActiveTab("records")}
          >
            Records
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link text-secondary fw-bold ${
              activeTab === "update" ? "active" : ""
            }`}
            onClick={() => setActiveTab("update")}
          >
            Update
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link text-secondary fw-bold ${
              activeTab === "pending" ? "active" : ""
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
        </li>
      </ul>

      {activeTab === "records" && renderTable(recordsList)}

      {activeTab === "update" && (
        <div>
          <select
            className="form-select mb-3 payments-update bg-dark text-white w-75"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select Student</option>
            {pendingList.map((item) => (
              <option key={item.student_id} value={item.student_id}>
                {item.name} - Room {item.room_no}
              </option>
            ))}
          </select>
          <button
            className="btn btn-success payments-update"
            onClick={handleUpdate}
          >
            Mark as Paid
          </button>
        </div>
      )}
      {activeTab === "pending" && renderTable(pendingList)}
      {added == 1 && (
        <h3 className="added">✅Records Updated Successfully!!</h3>
      )}
      {added == 2 && <h3 className="not-added">❌Couldn't Update Records!!</h3>}
    </div>
  );
}

export default Payments;
