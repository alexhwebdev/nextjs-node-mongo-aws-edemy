// index.js file in Page Router
// Home Page


// import Image from "next/image";
import styles from "./page.module.css";
import './page.css'
import CourseContainer from "../components/cards/CourseContainer";

export default async function Home() {
  return (
    <>
      <h1 className="jumbotron text-center bg-primary square">
        Online Education Marketplace
      </h1>
      <div className="container-fluid">
        <div className="row">
          {/* {courses.map((course) => (
            <div key={course._id} className="col-md-4">
              <CourseCard course={course} />
            </div>
          ))} */}

          <CourseContainer />
        </div>
      </div>
    </>
  );
}
