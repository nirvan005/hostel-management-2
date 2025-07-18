import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

export default function ChangeRoom() {
  const [unassigned, setUnassigned] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    room_no: "",
  });
  let [added, setAdded] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://localhost:4000/assigned-students")
      .then((res) => setUnassigned(res.data))
      .catch((err) => console.error(err));
    setAdded(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...formData, student_id: selectedId };
      await axios.post("http://localhost:4000/change-room", body);
      console.log(body);
      setAdded(1);
      setTimeout(() => {
        setAdded(0);
        navigate("/student");
      }, 1000);
    } catch (err) {
      console.error(err);
      setAdded(2);
      setTimeout(() => {
        setAdded(0);
      }, 5000);
    }
  };

  return (
    <div className="change-room-body me-4">
      <h2 className="change-room-heading">Change Room of Student</h2>

      <select
        className="form-select mb-3 bg-dark text-white w-100"
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

      {selectedId && (
        <form onSubmit={handleSubmit}>
          {added == 1 && (
            <h3 className="added">✅Room Changed Successfully!!</h3>
          )}
          {added == 2 && (
            <h3 className="not-added">❌Couldn't Change Room!!</h3>
          )}
          <div className="mb-3">
            <label className="form-label assign-fields">New Room:</label>
            <input
              className="form-control bg-dark text-white"
              name="address"
              value={formData.room_no}
              onChange={(e) =>
                setFormData({ ...formData, room_no: e.target.value })
              }
              required
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Assign Room
          </button>
        </form>
      )}
    </div>
  );
}
