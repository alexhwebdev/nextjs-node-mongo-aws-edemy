"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import CourseCard from "./CourseCard";

const CourseContainer = () => {
  // console.log('CourseContainer params', params)
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await axios.get(
        // "/api/courses"
        `${process.env.NEXT_PUBLIC_API}/courses`
      );
      setCourses(data);
    };
    fetchCourses();
  }, []);
  console.log('CourseContainer courses ', courses)

  return (
    <>
      {courses.map((course) => (
        <div key={course._id} className="col-md-4">
          <CourseCard course={course} />
        </div>
      ))}
    </>
  );
};

export default CourseContainer;
