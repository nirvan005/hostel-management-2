import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext"; // adjust path!

function PaymentStudent() {
  const { isAuthenticated } = useAuth(); // can add user_id if needed
  const [recordsList, setRecordsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentPayments = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/payment/student");
        setRecordsList(res.data);
      } catch (error) {
        console.error(error);
        setRecordsList([]);
      }
      setLoading(false);
    };

    if (isAuthenticated) {
      fetchStudentPayments();
    }
  }, [isAuthenticated]);

  const renderTable = (data) => (
    <table className="table table-bordered table-dark table-striped payments-table w-75">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Room No</th>
          <th>Floor No</th>
          <th>Amount Paid</th>
          <th>Semester</th>
          <th>Payment Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            <td>{item.name}</td>
            <td>{item.room_no}</td>
            <td>{item.floor_no}</td>
            <td>₹{item.amount}</td>
            <td>{item.sem}</td>
            <td>{item.payment_date && item.payment_date.slice(0, 10)}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!isAuthenticated) {
    return (
      <h2 className="text-warning">Please log in to view your payments.</h2>
    );
  }

  return (
    <div className="container text-white payments-page">
      <h2 className="mb-4">Your Payment Records</h2>
      {loading ? (
        <div>Loading...</div>
      ) : recordsList.length === 0 ? (
        <h4>No Payment Records found.</h4>
      ) : (
        renderTable(recordsList)
      )}
    </div>
  );
}

export default PaymentStudent;
