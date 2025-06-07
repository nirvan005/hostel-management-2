import axios from "axios";
import { useEffect, useState } from "react";
import StudentCard from "./StudentCard";
import { FaSearch } from "react-icons/fa";
import { NavLink, useLocation } from "react-router";

export default function StudentList() {
  const location = useLocation();
  const collapse = location.state?.collapse;
  let [students, setStudents] = useState([]);
  let [initial, setInitial] = useState([]);
  useEffect(() => {
    fetchStudentData();
  }, []);
  const fetchStudentData = async () => {
    const api = axios.create({
      baseURL: "http://localhost:4000",
    });
    try {
      const response = await api.get("/student");
      setStudents(response.data);
      setInitial(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleChange = (e) => {
    const searchValue = e.target.value.trim().toLowerCase();
    if (searchValue === "") setStudents(initial);
    // else {
    //   let searchRes = initial.filter((stud) =>
    //     stud.student_id.toString().includes(searchValue)
    //   );
    const searchRes = initial.filter(
      (stud) =>
        stud.student_id.toString().includes(searchValue) ||
        stud.name.toLowerCase().includes(searchValue) // Name search (case-insensitive)
    );
    setStudents(searchRes);
    // }
  };
  return (
    <div
      style={{ padding: "20px", width: "100%" }}
      className={`${collapse ? "collapse-margin" : "normal-margin"}`}
    >
      <div className={`add-delete`}>
        <NavLink to={"/home/student/add-student"} className={"add-student"}>
          <button className="btn btn-success add-student-btn">
            Add New Student
          </button>
        </NavLink>
        <NavLink
          to={"/home/student/remove-student"}
          className={"remove-student"}
        >
          <button className="btn btn-danger remove-student-btn">
            Remove Student
          </button>
        </NavLink>
      </div>
      <div className="input-group search-bar align-items-stretch w-75">
        <input
          onChange={handleChange}
          type="text"
          className="find-student form-control form-control-lg"
          placeholder="Enter Student Name.."
        />
        <span className="input-group-text form-control-lg btn btn-success search-btn d-flex align-items-center">
          <FaSearch />
        </span>
      </div>
      <div className="w-100 mt-5">
        {students.map((student) => (
          <StudentCard key={student.student_id} student={student} />
        ))}
      </div>
    </div>
  );
}
