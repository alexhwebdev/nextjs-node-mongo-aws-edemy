"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import InstructorRoute from "../../components/routes/InstructorRoute";
import { Avatar } from "antd";
import Link from "next/link";
// import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { MdOutlineCheckCircle } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";


const InstructorIndex = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      loadCourses();
    }, 500)
  }, []);

  const loadCourses = async () => {
    const { data } = await axios.get(
      // "/api/instructor-courses"
      `${process.env.NEXT_PUBLIC_API}/instructor-courses`, 
    );
    setCourses(data);
  };

  const myStyle = { marginTop: "-15px", fontSize: "10px" };

  console.log('InstructorIndex courses ', courses)

  return (
    <InstructorRoute>
      <h1 className="jumbotron text-center square">
        Instructor Dashboard
      </h1>
      {/* <pre>{JSON.stringify(courses, null, 4)}</pre> */}

      {courses &&
        courses.map((course, i) => (
          <>
            <div key={i} className="media pt-2">
              <Avatar
                size={80}
                src={
                  course.image 
                    ? course.image.Location 
                    : "/course.png"
                }
              />

              <div className="media-body pl-2">
                <div className="row">
                  <div className="col">
                    <Link
                      // href={`/instructor/course/view/${course.slug}`}
                      href={`/instructor/course/view/${course.slug}`}
                      className="pointer"
                    >
                      <h5 className="mt-2 text-primary">
                        <p className="pt-2">{course.name}</p>
                      </h5>
                    </Link>
                    <p style={{ marginTop: "-10px" }}>
                      {course.lessons.length} Lessons
                    </p>

                    {course.lessons.length < 5 ? (
                      <p style={myStyle} className="text-warning">
                        At least 5 lessons are required to publish a course
                      </p>
                    ) : course.published ? (
                      <p style={myStyle} className="text-success">
                        Your course is live in the marketplace
                      </p>
                    ) : (
                      <p style={myStyle} className="text-success">
                        Your course is ready to be published
                      </p>
                    )}
                  </div>

                  <div className="col-md-3 mt-3 text-center">
                    {course.published ? (
                      <div>
                        <MdOutlineCheckCircle className="h5 pointer text-success" />
                        <br />
                        <small className="text-muted">Published</small>
                      </div>
                    ) : (
                      <div>
                        <IoCloseCircleOutline className="h5 pointer text-warning" />
                        <br />
                        <small className="text-muted">Unpublished</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
    </InstructorRoute>
  );
};

export default InstructorIndex;