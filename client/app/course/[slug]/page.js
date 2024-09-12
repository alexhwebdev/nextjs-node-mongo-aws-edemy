"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import SingleCourse from "./component/SingleCourse"

// const { data } = await axios.get(
//   `${process.env.API}/course/${query.slug}`
// );

const SingleCourseWrapper = ({ 
  params, 
  // course 
}) => {
  const [course, setCourse] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const fetchCourse = async () => {
        const { data } = await axios.get(
          // "/api/courses"
          `${process.env.NEXT_PUBLIC_API}/course/${params.slug}`
        );
        setCourse(data);
      };
      fetchCourse();      
    }, 500)

  }, []);
  // console.log('SingleCourseWrapper course ', course)

  return (
    <>
      {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
      <SingleCourse course={course} />
    </>
  );
};

export default SingleCourseWrapper;
