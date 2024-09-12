"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SyncOutlined } from "@ant-design/icons";
import InstructorNav from "../nav/InstructorNav";
import { IoSyncOutline } from "react-icons/io5";

const InstructorRoute = ({ children }) => {
  const [ok, setOk] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      fetchInstructor();
    }, 1000)
  }, []);

  const fetchInstructor = async () => {
    try {
      const { data } = await axios.get(
        // "/api/current-instructor"
        `${process.env.NEXT_PUBLIC_API}/current-instructor`
      );
      // console.log("fetchInstructor data ", data);
      if (data.ok) setOk(true);
    } catch (err) {
      console.log(err);
      setOk(false);
      router.push("/");
    }
  };

  return (
    <>
      {!ok ? (
        <IoSyncOutline
          // spin
          className="d-flex justify-content-center display-1 text-primary p-5"
        />
      ) : (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              <InstructorNav />
            </div>
            <div className="col-md-10">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorRoute;
