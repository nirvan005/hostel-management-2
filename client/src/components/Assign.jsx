import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

export default function Assign() {
  const [unassigned, setUnassigned] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    room_no: "",
    start_date: "",
    end_date: null,
  });
  let [added, setAdded] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://localhost:4000/unassigned-students")
      .then((res) => setUnassigned(res.data))
      .catch((err) => console.error(err));
    setAdded(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...formData, student_id: selectedId };
      await axios.post("http://localhost:4000/assign-room", body);
      console.log(body);
      setAdded(1);
      setTimeout(() => {
        setAdded(0);
        navigate("/home-student/student");
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
    <div className="assign-room-body me-4">
      <h2 className="assign-room-heading">Assign Room to Student</h2>

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
        <form onSubmit={handleSubmit} className="">
          {added == 1 && (
            <h3 className="added">✅Student Added Successfully!!</h3>
          )}
          {added == 2 && (
            <h3 className="not-added">❌Couldn't Add Student!!</h3>
          )}
          <div className="mb-3">
            <label className="form-label assign-fields">Address</label>
            <input
              className="form-control bg-dark text-white"
              name="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label assign-fields">Father's Name:</label>
            <input
              className="form-control bg-dark text-white"
              name="fathers_name"
              value={formData.fathers_name}
              onChange={(e) =>
                setFormData({ ...formData, fathers_name: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label assign-fields">Mother's Name:</label>
            <input
              className="form-control bg-dark text-white"
              name="mothers_name"
              value={formData.mothers_name}
              onChange={(e) =>
                setFormData({ ...formData, mothers_name: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label assign-fields">
              Parent's Contact:
            </label>
            <input
              className="form-control bg-dark text-white"
              name="parent_phone"
              value={formData.parent_phone}
              onChange={(e) =>
                setFormData({ ...formData, parent_phone: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label assign-fields">Room No:</label>
            <input
              className="form-control bg-dark text-white"
              name="room_no"
              value={formData.room_no}
              onChange={(e) =>
                setFormData({ ...formData, room_no: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label assign-fields">Start Date:</label>
            <input
              className="form-control bg-dark text-white"
              name="start_date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
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
