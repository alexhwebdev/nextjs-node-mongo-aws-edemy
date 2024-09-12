"use client";
import { useContext, useEffect } from "react";
import { Context } from "../../../context";
// import { SyncOutlined } from "@ant-design/icons";
import axios from "axios";
import { IoSyncOutline } from "react-icons/io5";

const StripeCallback = () => {
  const {
    state: { user },
    dispatch,
  } = useContext(Context);
  console.log('StripeCallback user ', user)

  useEffect(() => {
    setTimeout(() => {
      if (user) {
        axios
          // .post("/api/get-account-status")
          .post(`${process.env.NEXT_PUBLIC_API}/get-account-status`)
          .then((res) => {
            dispatch({
              type: "LOGIN",
              payload: res.data,
            });
            window.localStorage.setItem("user", JSON.stringify(res.data));
            window.location.href = "/instructor";
          });
      }      
    }, 1000)

  }, [user]);

  return (
    <>
      <IoSyncOutline
        spin
        className="d-flex justify-content-center display-1 text-danger p-5"
      />
      StripeCallback
    </>

  );
};

export default StripeCallback;
