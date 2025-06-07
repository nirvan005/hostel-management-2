import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
function ChangeRoomStudent() {
  const { user_id } = useAuth();
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    user_id: user_id,
    preferred_room: "",
  });
  useEffect(() => {
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
      const api = axios.create({
        baseURL: "http://localhost:4000",
      });
      await api.post("/change-room-request", formData);
      setAdded(1);
      setFormData({
        user_id: user_id,
        preferred_room: "",
      });
      setTimeout(() => {
        setAdded(0);
      }, 2000);
    } catch (error) {
      setMessage(error.response.data);
      console.error(
        "Error adding student:",
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
        Apply for Changing Room
      </h2>
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow w-75 add-student-form"
      >
        {[{ label: "Preferred Room ", name: "preferred_room" }].map(
          ({ label, name }) => (
            <div className="mb-3" key={name}>
              <label htmlFor={name} className="form-label fw-semibold">
                {label}
              </label>
              <input
                type={name === "password" ? "password" : "text"}
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                className="form-control bg-dark text-white"
                required
                placeholder={`Enter ${label}`}
              />
            </div>
          )
        )}

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      {added == 1 && <h3 className="added">✅Request Submitted!!</h3>}
      {added == 2 && <h3 className="not-added">❌{message}!</h3>}
    </div>
  );
}

export default ChangeRoomStudent;
// import
