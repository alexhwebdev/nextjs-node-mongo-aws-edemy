"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import InstructorRoute from "../../../components/routes/InstructorRoute";
import CourseCreateForm from "../../../components/forms/CourseCreateForm";
import Resizer from "react-image-file-resizer";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CourseCreate = () => {
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "",
    uploading: false,
    paid: true,
    category: "",
    loading: false,
    // imagePreview: "",
  });
  // console.log('values ', values);
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [uploadButtonText, setUploadButtonText] = useState("Upload Image");

  const router = useRouter();

  const handleChange = (e) => {
    // console.log('e.target.value ', e.target.value);
    // Spread out ...values, whatever has changed, update it
    setValues({ 
      ...values, 
      [e.target.name]: e.target.value 
    });
  };

  const handleImage = (e) => {
    let file = e.target.files[0];
    setPreview(window.URL.createObjectURL(file)); // createObjectURL : comes with browsers by default
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
        console.log("IMAGE UPLOADED data ", data);
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
      console.log('handleImageRemove values ', values);

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

    console.log('handleSubmit values ', values);
    try {
      const { data } = await axios.post(
        // "/api/course"
        `${process.env.NEXT_PUBLIC_API}/course`, 
        {
          ...values,
          image: image,
        }
      );
      toast("Great! Now you can start adding lessons");
      router.push("/instructor");
    } catch (err) {
      // toast(err.response.data);
      toast("Create course failed!");
    }
  };

  return (
    <InstructorRoute>
      <h1 className="jumbotron text-center square">
        Create Course
      </h1>
      <div className="pt-3 pb-3">
        <CourseCreateForm
          handleSubmit={handleSubmit}
          handleImage={handleImage}
          handleChange={handleChange}
          values={values}
          setValues={setValues}
          preview={preview}
          uploadButtonText={uploadButtonText}
          handleImageRemove={handleImageRemove}
        />
      </div>
      <pre>{JSON.stringify(values, null, 2)}</pre>
      <br/>
      <pre>{JSON.stringify(image, null, 2)}</pre>
    </InstructorRoute>
  );
};

export default CourseCreate;
