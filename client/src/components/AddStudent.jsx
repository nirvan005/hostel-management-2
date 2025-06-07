import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
function AddStudent() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    phone: "",
    email: "",
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
      await axios.post("http://localhost:4000/add-student", formData);
      setAdded(1);
      setFormData({
        name: "",
        username: "",
        password: "",
        phone: "",
        email: "",
      });
      setTimeout(() => {
        setAdded(0);
        navigate("/student");
      }, 2000);
    } catch (error) {
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
        Add Student
      </h2>
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow w-75 add-student-form"
      >
        {[
          { label: "Full Name", name: "name" },
          { label: "Username", name: "username" },
          { label: "Password", name: "password" },
          { label: "Phone Number", name: "phone" },
          { label: "Email Address", name: "email" },
        ].map(({ label, name }) => (
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
        ))}

        <button type="submit" className="btn btn-primary">
          Add Student
        </button>
      </form>
      {added == 1 && <h3 className="added">✅Student Added Successfully!!</h3>}
      {added == 2 && <h3 className="not-added">❌Couldn't Add Student!!</h3>}
    </div>
  );
}

export default AddStudent;
