"use client";
import { useEffect, useState, useContext } from "react";
import { Context } from "../../context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SyncOutlined } from "@ant-design/icons";
import apiRequest from "../../lib/apiRequest";
import UserNav from "../nav/UserNav";
// import { IoSyncOutline } from "react-icons/io5";

const UserRoute = ({ children, showNav = true }) => {
  const [ok, setOk] = useState(false);
  // console.log('UserIndex ok', ok);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // const { data } = await axios.get("/api/current-user");
      // const { data } = await axios.get(
      const { data } = await apiRequest.get(
        `${process.env.NEXT_PUBLIC_API}/current-user`
        // `${process.env.NEXT_PUBLIC_API}/current-user/${user.id}`
      );
      // console.log('fetchUser data', data);

      // if (data) setOk(true);
      data ? setOk(true) : setOk(false)
    } catch (err) {
      console.log(err);
      setOk(false);
      router.push("/login");
    }
  };
  // console.log('UserIndex ok', ok);

  return (
    <>
      {!ok ? (
        <SyncOutlined
          spin
          className="d-flex justify-content-center display-1 text-primary p-5"
        />
      ) : (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              {showNav && <UserNav />}
            </div>
            <div className="col-md-10">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserRoute;
