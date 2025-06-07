import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
function RemoveStudent() {
  const [formData, setFormData] = useState({
    end_date: "",
  });
  const [unassigned, setUnassigned] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    axios
      .get("http://localhost:4000/assigned-students")
      .then((res) => setUnassigned(res.data))
      .catch((err) => console.error(err));
    setAdded(0);
  }, []);
  let [added, setAdded] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/student/remove-student", {
        student_id: selectedId,
        end_date: formData.end_date,
      });
      setAdded(1);
      setFormData({
        end_date: "",
      });
      setTimeout(() => {
        setAdded(0);
        navigate("/student");
      }, 2000);
    } catch (error) {
      console.error(
        "Error deleting student:",
        error.response?.data || error.message
      );
      setAdded(2);
      setTimeout(() => {
        setAdded(0);
      }, 5000);
    }
  };

  return (
    <div className="p-4 ms-5 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4  add-student-header">
        Remove Student
      </h2>
      <select
        className="form-select mb-3 bg-dark text-white w-75 remove-student-dropdown"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        required
      >
        <option value="" className="bg-dark text-white">
          Select a student
        </option>
        {unassigned.map((user) => (
          <option key={user.user_id} value={user.user_id}>
            {user.name} ({user.username})
          </option>
        ))}
      </select>

      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow w-75 add-student-form"
      >
        <div className="mb-3">
          <label htmlFor="end_date" className="form-label fw-semibold">
            End Date
          </label>
          <input
            type="text"
            name="end_date"
            id="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="form-control bg-dark text-white"
            required
            placeholder="Enter End Date"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Remove Student
        </button>
      </form>

      {added == 1 && (
        <h3 className="added">✅Student Deleted Successfully!!</h3>
      )}
      {added == 2 && <h3 className="not-added">❌Couldn't Delete Student!!</h3>}
    </div>
  );
}

export default RemoveStudent;
