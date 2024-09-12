"use client";
import React, { useState, useEffect, createElement } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import StudentRoute from "../../../../components/routes/StudentRoute";
import { Button, Menu, Avatar } from "antd";
import ReactPlayer from "react-player";
import ReactMarkdown from "react-markdown";
import {
  PlayCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckCircleFilled,
  MinusCircleFilled,
} from "@ant-design/icons";

const { Item } = Menu;

const SingleCourse = ({ params }) => {
  const [clicked, setClicked] = useState(-1);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({ lessons: [] });
  const [completedLessons, setCompletedLessons] = useState([]);
  // force state update
  const [updateState, setUpdateState] = useState(false);

  console.log('SingleCourse clicked ', clicked)

  // router
  const router = useRouter();
  // const { slug } = router.query;

  useEffect(() => {
    if (params.slug) loadCourse();
  }, [params.slug]);

  useEffect(() => {
    if (course) loadCompletedLessons();
  }, [course]);

  const loadCourse = async () => {
    const { data } = await axios.get(
      // `/api/user/course/${params.slug}`
      `${process.env.NEXT_PUBLIC_API}/user/course/${params.slug}`, 
    );
    console.log('loadCourse data ', data)
    setCourse(data);
  };

  const loadCompletedLessons = async () => {
    const { data } = await axios.post(
      // `/api/list-completed`, 
      `${process.env.NEXT_PUBLIC_API}/list-completed`, 
    {
      courseId: course._id,
    });
    console.log("COMPLETED LESSONS => ", data);
    setCompletedLessons(data);
  };

  const markCompleted = async () => {
    const { data } = await axios.post(
      // `/api/mark-completed`, 
      `${process.env.NEXT_PUBLIC_API}/mark-completed`, 
    {
      courseId: course._id,
      courseName: course.name,
      lessonId: course.lessons[clicked]._id, // get lessons index and then id
    });
    console.log(data);
    setCompletedLessons([...completedLessons, course.lessons[clicked]._id]);
  };

  const markIncompleted = async () => {
    try {
      const { data } = await axios.post(
        // `/api/mark-incomplete`, 
        `${process.env.NEXT_PUBLIC_API}/mark-incomplete`, 
      {
        courseId: course._id,
        lessonId: course.lessons[clicked]._id,
      });
      console.log(data);
      const all = completedLessons;
      console.log("ALL => ", all);

      const index = all.indexOf(course.lessons[clicked]._id); // if not found, returns -1
      if (index > -1) { // if found
        all.splice(index, 1); // changes the contents of an array by removing or replacing existing elements
        console.log("ALL WITHOUT REMOVED => ", all);

        setCompletedLessons(all); // after splice-ing, setCompletedLessons
        setUpdateState(!updateState);
      }
    } catch (err) {
      console.log(err);
    }
  };

  console.log('SingleCourse course ', course)
  console.log('SingleCourse completedLessons ', completedLessons)

  return (
    <StudentRoute>
      <div className="row">
        <div style={{ maxWidth: 320 }}>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="text-primary mt-1 btn-block mb-2"
          >
            {createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}{" "}
            {!collapsed && "Lessons"}
          </Button>
          <Menu
            defaultSelectedKeys={[clicked]}
            inlineCollapsed={collapsed}
            style={{ height: "80vh", overflow: "scroll" }}
          >
            {course.lessons.map((lesson, index) => (
              <Item
                onClick={() => setClicked(index)}
                key={index}
                icon={<Avatar>{index + 1}</Avatar>}
              >
                {/* LESSON TITLE */}
                {lesson.title.substring(0, 30)}{" "}

                {/* LESSON COMPLETE / INCOMPLETE */}
                {completedLessons.includes(lesson._id) ? (
                  <CheckCircleFilled
                    className="float-right text-primary ml-2"
                    style={{ marginTop: "13px" }}
                  />
                ) : (
                  <MinusCircleFilled
                    className="float-right text-danger ml-2"
                    style={{ marginTop: "13px" }}
                  />
                )}
              </Item>
            ))}
          </Menu>
        </div>

        <div className="col">
          {clicked !== -1 ? (
            <>
              <div className="col alert alert-primary square">
                <b>{course.lessons[clicked].title.substring(0, 30)}</b>

                {completedLessons.includes(course.lessons[clicked]._id) ? (
                  <span
                    className="float-right pointer"
                    onClick={markIncompleted}
                  >
                    Mark as incomplete
                  </span>
                ) : (
                  <span className="float-right pointer" onClick={markCompleted}>
                    Mark as completed
                  </span>
                )}
              </div>

              {course.lessons[clicked].video &&
                course.lessons[clicked].video.Location && (
                  <>
                    <div className="wrapper">
                      <ReactPlayer
                        className="player"
                        url={course.lessons[clicked].video.Location}
                        width="100%"
                        height="100%"
                        controls
                        onEnded={() => markCompleted()}
                      />
                    </div>
                  </>
                )
              }
              {/* <ReactMarkdown>
                source={course.lessons[clicked].content}
                className="single-post"
              /> */}
              <ReactMarkdown className="single-post">
                {course.lessons[clicked].content}
              </ReactMarkdown>
            </>
          ) : (
            <div className="d-flex justify-content-center p-5">
              <div className="text-center p-5">
                <PlayCircleOutlined className="text-primary display-1 p-5" />
                <p className="lead">Clcik on the lessons to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentRoute>
  );
};

export default SingleCourse;
