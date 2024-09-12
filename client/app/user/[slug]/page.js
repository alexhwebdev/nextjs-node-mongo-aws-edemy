"use client";
import { useContext, useState } from "react";
import { Context } from "../../../context";
import { Button } from "antd";
import axios from "axios";
// import {
//   SettingOutlined,
//   UserSwitchOutlined,
//   LoadingOutlined,
// } from "@ant-design/icons";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { toast } from "react-toastify";
import apiRequest from "../../../lib/apiRequest";
// import UserRoute from "../../components/routes/UserRoute";

const BecomeInstructor = () => {
  // state
  const [loading, setLoading] = useState(false);
  const {
    state: { user },
  } = useContext(Context);

  const becomeInstructor = async () => {
    // console.log("become instructor");
    setLoading(true);
    axios
    // apiRequest
      // .post("/api/make-instructor")
      .post(`${process.env.NEXT_PUBLIC_API}/make-instructor`)
      .then((res) => {
        console.log('becomeInstructor res', res);
        window.location.href = res.data; 
        // Immediately open new window based on res. 
        // Stripe will give us this link
      })
      .catch((err) => {
        console.log(err.response.status);
        toast("Stripe onboarding failed. Try again.");
        setLoading(false);
      });
  };

  return (
    <>
      <h1 className="jumbotron text-center square">
        Become Instructor
      </h1>

      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 text-center">
            <div className="pt-4">
              <AiOutlineUserSwitch className="display-1 pb-3" />
              <br />
              <h2>Setup payout to publish courses on Edemy</h2>
              <p className="lead text-warning">
                Edemy partners with stripe to transfer earnings to your bank
                account
              </p>

              <Button
                className="mb-3"
                type="primary"
                block
                shape="round"
                icon={loading 
                  ? <AiOutlineLoading3Quarters />
                  : <CiSettings />
                }
                size="large"
                onClick={becomeInstructor}
                disabled={
                  (user && user.role && user.role.includes("Instructor")) ||
                  loading
                }
              >
                {loading 
                  ? "Processing..." 
                  : "Payout Setup"
                }
              </Button>

              <p className="lead">
                You will be redirected to stripe to complete onboarding process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeInstructor;
