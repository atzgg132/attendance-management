import React, { useState, useEffect } from "react";
import "./StudentList.css";
import Axios from "axios";
import { storage } from "./firebase";
import { listAll, getDownloadURL } from "firebase/storage";
import { ref } from "firebase/storage";
import SearchComponent from "./SearchComponent";

const URL = "https://mern-attendance-app-api.onrender.com"; // Changed to local backend URL

function StudentList({ studentList, attendanceData, handleAttendanceChange }) {
  const [searchResults, setSearchResults] = useState([]);
  const [defaultAttendanceData, setDefaultAttendanceData] = useState({});
  const [fileUrls, setFileUrls] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const imageListRef = ref(storage, "images/");
  const urls = {};

  useEffect(() => {
    console.log("Current student list:", studentList);
    setSearchResults(studentList);
    setIsLoading(false);

    const defaultData = {};
    studentList.forEach((student) => {
      defaultData[student._id] = "absent";
    });
    setDefaultAttendanceData(defaultData);

    const fetchFileUrls = async () => {
      try {
        const response = await listAll(imageListRef);

        await Promise.all(
          response.items.map(async (item) => {
            try {
              const url = await getDownloadURL(item);
              console.log(item.name, url);
              urls[item.name] = url;
            } catch (error) {
              console.error("Error getting download URL:", error);
            }
          })
        );

        setFileUrls((prevUrls) => ({ ...prevUrls, ...urls }));
        console.log("File URLs:", urls);
      } catch (error) {
        console.error("Error listing items:", error);
      }
    };

    fetchFileUrls();
  }, [studentList]);

  useEffect(() => {
    setDefaultAttendanceData((prevDefaultData) => ({
      ...prevDefaultData,
      ...attendanceData,
    }));
  }, [attendanceData]);

  const handleUpdateAttendance = () => {
    const defaultAttendanceArray = Object.keys(defaultAttendanceData).map(
      (studentId) => ({
        studentId,
        attendance: "absent",
      })
    );

    const combinedAttendanceArray = [
      ...defaultAttendanceArray,
      ...Object.entries(attendanceData).map(([studentId, attendance]) => ({
        studentId,
        attendance,
      })),
    ];
    const resultMap = new Map();

    for (let i = combinedAttendanceArray.length - 1; i >= 0; i--) {
      const item = combinedAttendanceArray[i];
      if (!resultMap.has(item.studentId)) {
        resultMap.set(item.studentId, item);
      }
    }
    const uniqueLastOccurrenceList = Array.from(resultMap.values());

    Axios.post(`${URL}/attendance`, {
      attendanceData: uniqueLastOccurrenceList,
    })
      .then(() => {
        console.log("Attendance recorded successfully");
      })
      .catch((error) => {
        console.error("Error recording attendance:", error);
      });
  };

  const [downloadDate, setDownloadDate] = useState("");
  const handleInputChange = (event) => {
    setDownloadDate(event.target.value);
  };

  const handleDownloadToday = () => {
    console.log("Download date:", downloadDate);
    Axios.get(`${URL}/attendanceToday/${downloadDate}`, {
      responseType: "arraybuffer",
    })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${downloadDate}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error("Error downloading attendance:", error);
      });
  };

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  if (isLoading) return <div>Loading students...</div>;

  return (
    <div className="StudentList">
      <div>Total students: {studentList.length}</div>
      <SearchComponent
        data={studentList}
        searchKey="Name"
        setSearchResults={handleSearch}
      />

      {searchResults.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Photo</th>
              <th style={{ textAlign: "center" }}>Register Number</th>
              <th style={{ textAlign: "center" }}>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((student) => (
              <tr key={student._id}>
                <td>{student.Name}</td>
                <td>
                  <div>
                    {fileUrls[student.Register_number] && (
                      <img
                        src={fileUrls[student.Register_number]}
                        alt={`Photo of ${student.Register_number}`}
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                      />
                    )}
                  </div>
                </td>
                <td>{student.Register_number}</td>
                <td>
                  <div className="attendance-container">
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        value="present"
                        checked={
                          defaultAttendanceData[student._id] === "present"
                        }
                        onChange={() =>
                          handleAttendanceChange(student._id, "present")
                        }
                      />
                      Present
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        value="absent"
                        checked={
                          defaultAttendanceData[student._id] === "absent"
                        }
                        onChange={() =>
                          handleAttendanceChange(student._id, "absent")
                        }
                      />
                      Absent
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="UpdateButton" onClick={handleUpdateAttendance}>
        Update
      </button>
      <input
        type="text"
        value={downloadDate}
        onChange={handleInputChange}
        placeholder="YYYY-MM-DD"
      />
      <button className="downloadTodayAttendance" onClick={handleDownloadToday}>
        Download
      </button>
    </div>
  );
}

export default StudentList;
