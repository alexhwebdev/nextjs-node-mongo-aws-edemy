"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import InstructorRoute from "../../../../../components/routes/InstructorRoute";
import CourseCreateForm from "../../../../../components/forms/CourseCreateForm";
import Resizer from "react-image-file-resizer";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { List, Avatar, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import UpdateLessonForm from "../../../../../components/forms/UpdateLessonForm";


const { Item } = List;

const CourseEdit = ({ params }) => {
  // state
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "0",
    uploading: false,
    paid: true,
    category: "",
    loading: false,
    lessons: [],
  });
  // console.log("CourseEdit values ", values);
  const [image, setImage] = useState({});
  const [preview, setPreview] = useState("");
  const [uploadButtonText, setUploadButtonText] = useState("Upload Image");

  // state for lessons update
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({});
  const [uploadVideoButtonText, setUploadVideoButtonText] = useState(
    "Upload Video"
  );
  // console.log("CourseEdit current ", current);

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // router
  const router = useRouter();
  // const { slug } = router.query;

  useEffect(() => {
    setTimeout(() => {
      loadCourse();
    }, 500)
  }, [params.slug]);

  const loadCourse = async () => {
    const { data } = await axios.get(
      // `/api/course/${slug}`
      `${process.env.NEXT_PUBLIC_API}/course/${params.slug}`, 
    );
    // console.log('loadCourse data ', data);
    if (data) setValues(data);
    if (data && data.image) setImage(data.image);
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    let file = e.target.files[0];
    setPreview(window.URL.createObjectURL(file));
    setUploadButtonText(file.name);
    setValues({ ...values, loading: true });
    // resize
    Resizer.imageFileResizer(file, 720, 500, "JPEG", 100, 0, async (uri) => {
      try {
        let { data } = await axios.post(
          // "/api/course/upload-image", 
          `${process.env.NEXT_PUBLIC_API}/course/upload-image`, 
        {
          image: uri,
        });
        // console.log("IMAGE UPLOADED", data);
        // set image in the state
        setImage(data);
        setValues({ ...values, loading: false });
      } catch (err) {
        console.log(err);
        setValues({ ...values, loading: false });
        toast("Image upload failed. Try later.");
      }
    });
  };

  const handleImageRemove = async () => {
    try {
      // console.log(values);
      setValues({ ...values, loading: true });
      const res = await axios.post(
        // "/api/course/remove-image", 
        `${process.env.NEXT_PUBLIC_API}/course/remove-image`, 
        { image }
      );
      setImage({});
      setPreview("");
      setUploadButtonText("Upload Image");
      setValues({ ...values, loading: false });
    } catch (err) {
      console.log(err);
      setValues({ ...values, loading: false });
      toast("Image upload failed. Try later.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // console.log(values);
      const { data } = await axios.put(
        // "/api/course", 
        `${process.env.NEXT_PUBLIC_API}/course/${params.slug}`, 
      {
        ...values,
        image,
      });
      toast("Great! Now you can start adding lessons");
      router.push("/instructor");
    } catch (err) {
      toast(err.response.data);
    }
  };

  const handleDrag = (e, index) => {
    // console.log("ON DRAG => e ", e);
    // console.log("ON DRAG => index ", index);
    e.dataTransfer.setData("itemIndex", index);
  };

  const handleDrop = async (e, index) => {
    // console.log("ON DROP => e ", e);
    // console.log("ON DROP => ", index);

    const movingItemIndex = e.dataTransfer.getData("itemIndex");
    const targetItemIndex = index;
    // console.log("ON DROP => movingItemIndex", movingItemIndex);
    // console.log("ON DROP => targetItemIndex", targetItemIndex);
    let allLessons = values.lessons;

    let movingItem = allLessons[movingItemIndex]; // clicked/dragged item to re-order
    // console.log("ON DROP => movingItem", movingItem);

    // splice(start, deleteCount, item1, item2)
    allLessons.splice(movingItemIndex, 1); // remove 1 item from the given index
    allLessons.splice(targetItemIndex, 0, movingItem); // push item after target item index

    setValues({ ...values, lessons: [...allLessons] });
    // save the new lessons order in db
    const { data } = await axios.put(
      // `/api/course/${slug}`, 
      `${process.env.NEXT_PUBLIC_API}/course/${params.slug}`, 
      {
        ...values,
        image,
      }
    );
    // console.log("LESSONS REARRANGED RES => ", data);
    toast("Lessons rearranged successfully");
  };

  const handleDelete = async (index) => {
    const answer = window.confirm("Are you sure you want to delete?");
    if (!answer) return;
    let allLessons = values.lessons;
    const removed = allLessons.splice(index, 1);
    // console.log("removed", removed[0]._id);
    setValues({ ...values, lessons: allLessons });
    // send request to server
    const { data } = await axios.put(
      // `/api/course/${removed[0]._id}`
      `${process.env.NEXT_PUBLIC_API}/course/${params.slug}/${removed[0]._id}`, 
    );
    // console.log("LESSON DELETED =>", data);
  };

  // lesson update functions
  const handleVideo = async (e) => {
    // remove previous
    if (current.video && current.video.Location) {
      const res = await axios.post(
        // `/api/course/remove-video/${values._id}`,
        `${process.env.NEXT_PUBLIC_API}/course/video-remove/${values.instructor._id}`, 
        current.video // video to remove
      );
      // console.log("handleVideo REMOVED ===> res ", res);
    }
    // upload
    const file = e.target.files[0];
    // console.log('handleVideo file', file);
    setUploadButtonText(file.name);
    setUploading(true);
    // send video as form data
    const videoData = new FormData();
    videoData.append("video", file);
    videoData.append("courseId", values._id);
    // save progress bar and send video as form data to backend
    const { data } = await axios.post(
      // `/api/course/upload-video/${values._id}`,
      `${process.env.NEXT_PUBLIC_API}/course/video-upload/${values.instructor._id}`, 
      videoData, // video to add
      {
        onUploadProgress: (e) =>
          setProgress(Math.round((100 * e.loaded) / e.total)),
      }
    );
    // once response is received
    // console.log('handleVideo data', data);
    setCurrent({ ...current, video: data });
    setUploading(false);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    // console.log("CURRENT", current);
    // console.log("**SEND TO BACKEND**");
    // console.table({ values });
    let { data } = await axios.put(
      // `/api/course/lesson/${values._id}/${current._id}`,
      `${process.env.NEXT_PUBLIC_API}/course/lesson/${params.slug}/${current._id}`, 
      current
    );
    setUploadVideoButtonText("Upload video");
    setProgress(0);
    setVisible(false);

    // update lessons
    if (data.ok) {
      let arr = values.lessons;
      console.log("handleUpdateLesson values ", values);

      const index = arr.findIndex((el) => el._id === current._id);
      console.log("handleUpdateLesson index ", index);

      arr[index] = current;
      console.log("handleUpdateLesson arr[index] ", arr[index]);

      setValues({ ...values, lessons: arr });
      toast("Lesson updated");
    }
  };

  return (
    <InstructorRoute>
      <h1 className="jumbotron text-center square">
        Update Course
      </h1>
      {/* {JSON.stringify(values)} */}
      <div className="pt-3 pb-3">
        <CourseCreateForm
          handleSubmit={handleSubmit}
          handleImageRemove={handleImageRemove}
          handleImage={handleImage}
          handleChange={handleChange}
          values={values}
          setValues={setValues}
          preview={preview}
          uploadButtonText={uploadButtonText}
          editPage={true}
        />
      </div>
      {/* <pre>{JSON.stringify(values, null, 4)}</pre>
      <hr />
      <pre>{JSON.stringify(image, null, 4)}</pre> */}

      <hr />

      <div className="row pb-5">
        <div className="col lesson-list">
          <h4>{
            values
              && values.lessons 
              && values.lessons.length} Lessons
          </h4>
          <List
            onDragOver={(e) => e.preventDefault()} // to allow drag, need to prevent default
            itemLayout="horizontal"
            dataSource={values && values.lessons}
            renderItem={(item, index) => (
              <Item
                draggable
                onDragStart={(e) => handleDrag(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <Item.Meta
                  onClick={() => {
                    setVisible(true);
                    setCurrent(item);
                  }}
                  avatar={<Avatar>{index + 1}</Avatar>}
                  title={item.title}
                ></Item.Meta>

                <DeleteOutlined
                  onClick={() => handleDelete(index)}
                  className="text-danger float-right"
                />
              </Item>
            )}
          ></List>
        </div>
      </div>

      <Modal
        title="Update lesson"
        centered
        // visible={visible}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <UpdateLessonForm
          current={current}
          setCurrent={setCurrent}
          handleVideo={handleVideo}
          handleUpdateLesson={handleUpdateLesson}
          uploadVideoButtonText={uploadVideoButtonText}
          progress={progress}
          uploading={uploading}
        />
        {/* <pre>{JSON.stringify(current, null, 4)}</pre> */}
      </Modal>
    </InstructorRoute>
  );
};

export default CourseEdit;
