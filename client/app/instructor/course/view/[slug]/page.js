"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InstructorRoute from "../../../../../components/routes/InstructorRoute";
import axios from "axios";
import { Avatar, Tooltip, Button, Modal, List } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  UploadOutlined,
  QuestionOutlined,
  CloseOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import AddLessonForm from "../../../../../components/forms/AddLessonForm";
import { toast } from "react-toastify";
import Item from "antd/lib/list/Item";

const CourseView = ({ params }) => {
  const [course, setCourse] = useState({});
  const [visible, setVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadButtonText, setUploadButtonText] = useState("Upload Video");
  const [progress, setProgress] = useState(0);
  const [values, setValues] = useState({
    title: "",
    content: "",
    video: "",
  });
  const [students, setStudents] = useState(0);

  const router = useRouter();
  // console.log('router ', router)
  // const { slug } = router.query;

  useEffect(() => {
    setTimeout(() => {
      loadCourse();
    }, 500)
  }, [params.slug]);

  useEffect(() => {
    course && studentCount();
  }, [course]);

  const loadCourse = async () => {
    const { data } = await axios.get(
      // `/api/course/${slug}`
      `${process.env.NEXT_PUBLIC_API}/course/${params.slug}`, 
    );
    setCourse(data);
  };

  const studentCount = async () => {
    const { data } = await axios.post(
      // `/api/instructor/student-count`, 
      `${process.env.NEXT_PUBLIC_API}/instructor/student-count`, 
    {
      courseId: course._id,
    });
    console.log("STUDENT COUNT => ", data);
    setStudents(data.length);
  };

  const handleAddLesson = async (e) => {
    console.log('handleAddLesson values', values);
    e.preventDefault();
    // console.log(values);
    try {
      const { data } = await axios.post(
        // `/api/course/lesson/${slug}/${course.instructor._id}`,
        `${process.env.NEXT_PUBLIC_API}/course/lesson/${params.slug}/${course.instructor._id}`, 
        values
      );
      // console.log(data)
      setValues({ ...values, title: "", content: "", video: {} });
      setVisible(false);
      setUploadButtonText("Upload video");
      setCourse(data);
      toast("Lesson added");
    } catch (err) {
      console.log(err);
      toast("Lesson add failed");
    }
  };

  const handleVideo = async (e) => {
    try {
      const file = e.target.files[0];
      setUploadButtonText(file.name);
      setUploading(true);

      const videoData = new FormData();
      videoData.append("video", file);
      // save progress bar and send video as form data to backend
      const { data } = await axios.post(
        // "/api/course/video-upload", 
        `${process.env.NEXT_PUBLIC_API}/course/video-upload/${course.instructor._id}`,
        videoData, 
      {
        onUploadProgress: (e) => {
          setProgress(Math.round((100 * e.loaded) / e.total));
        },
      });
      // once response is received
      console.log(data);
      setValues({ ...values, video: data });
      setUploading(false);
    } catch (err) {
      console.log(err);
      setUploading(false);
      toast("Video upload failed");
    }
  };

  const handleVideoRemove = async () => {
    try {
      setUploading(true);
      const { data } = await axios.post(
        // "/api/course/remove-video",
        `${process.env.NEXT_PUBLIC_API}/course/video-remove/${course.instructor._id}`,
        values.video
      );
      console.log(data);
      setValues({ ...values, video: {} });
      setUploading(false);
      setUploadButtonText("Upload another video");
    } catch (err) {
      console.log(err);
      setUploading(false);
      toast("Video remove failed");
    }
  };

  const handlePublish = async () => {
    // console.log(course.instructor._id);
    try {
      let answer = window.confirm(
        "Once you publish your course, it will be live in the marketplace for students to enroll."
      );
      if (!answer) return;
      const { data } = await axios.put(
        // `/api/course/publish/${course._id}`
        `${process.env.NEXT_PUBLIC_API}/course/publish/${course._id}`,
      );
      console.log("handlePublish data ", data);
      toast("Congrats. Your course is now live in marketplace!");
      setCourse(data);
    } catch (err) {
      toast("Course publish failed. Try again");
    }
  };

  const handleUnpublish = async () => {
    // console.log(slug);
    try {
      let answer = window.confirm(
        "Once you unpublish your course, it will not appear in the marketplace for students to enroll."
      );
      if (!answer) return;
      const { data } = await axios.put(
        // `/api/course/unpublish/${course._id}`
        `${process.env.NEXT_PUBLIC_API}/course/unpublish/${course._id}`,
      );
      toast("Your course is now removed from the marketplace!");
      setCourse(data);
    } catch (err) {
      toast("Course unpublish failed. Try again");
    }
  };

  console.log('course ', course)

  return (
    <InstructorRoute>
      <div className="contianer-fluid pt-3">
        {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
        {course && (
          <div className="container-fluid pt-1">
            <div className="media pt-2">
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
                    <h5 className="mt-2 text-primary">
                      {course.name}
                    </h5>
                    <p style={{ marginTop: "-10px" }}>
                      {course.lessons && course.lessons.length} Lessons
                    </p>
                    <p style={{ marginTop: "-15px", fontSize: "10px" }}>
                      {course.category}
                    </p>
                  </div>

                  <div className="d-flex pt-4">
                    {/* total students enrolled */}
                    <Tooltip title={`${students} Enrolled`}>
                      <UserSwitchOutlined className="h5 pointer text-success mr-4" />
                    </Tooltip>
                    
                    {/* edit icon */}
                    <Tooltip title="Edit">
                      <EditOutlined
                        onClick={() =>
                          router.push(`/instructor/course/edit/${params.slug}`)
                        }
                        className="h5 pointer text-warning mr-4"
                      />
                    </Tooltip>

                    {/* course published ? unpublished */}
                    {course.lessons && course.lessons.length < 5 
                      ? (
                        <Tooltip title="Min 5 lessons required to publish">
                          <QuestionOutlined className="h5 pointer text-danger" />
                        </Tooltip>
                      ) 
                      : course.published 
                        ? (
                          <Tooltip title="Unpublish">
                            <CloseOutlined
                              onClick={handleUnpublish}
                              className="h5 pointer text-danger"
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Publish">
                            <CheckOutlined
                              onClick={handlePublish}
                              className="h5 pointer text-success"
                            />
                          </Tooltip>
                        )
                    }
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col">
                {/* <ReactMarkdown source={course.description} /> */}
                <ReactMarkdown>
                  {course.description}
                </ReactMarkdown>
              </div>
            </div>
            <div className="row">
              <Button
                onClick={() => setVisible(true)}
                className="col-md-6 offset-md-3 text-center"
                type="primary"
                shape="round"
                icon={<UploadOutlined />}
                size="large"
              >
                Add Lesson
              </Button>
            </div>

            <br />

            <Modal
              title="+ Add Lesson"
              centered
              visible={visible}
              onCancel={() => setVisible(false)}
              footer={null}
            >
              <AddLessonForm
                values={values}
                setValues={setValues}
                handleAddLesson={handleAddLesson}
                uploading={uploading}
                uploadButtonText={uploadButtonText}
                handleVideo={handleVideo}
                progress={progress}
                handleVideoRemove={handleVideoRemove}
              />
            </Modal>

            <div className="row pb-5">
              <div className="col lesson-list">
                <h4>
                  {course && course.lessons && course.lessons.length} Lessons
                </h4>
                <List
                  itemLayout="horizontal"
                  dataSource={course && course.lessons}
                  renderItem={(item, index) => (
                    <Item>
                      <Item.Meta
                        avatar={<Avatar>{index + 1}</Avatar>}
                        title={item.title}
                      ></Item.Meta>
                    </Item>
                  )}
                ></List>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorRoute>
  );
};

export default CourseView;
