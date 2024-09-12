"use client";
import { useEffect } from "react";
import { SyncOutlined } from "@ant-design/icons";
import UserRoute from "../../../../components/routes/UserRoute";
import { useRouter } from "next/navigation";
import axios from "axios";

const StripeSuccess = ({ params }) => {
  console.log("StripeSuccess params", params);

  const router = useRouter();
  // const { id } = router.query;
  const { id } = params;

  useEffect(() => {
    // setTimeout(() => {
      if (id) successRequest();
    // }, 500)
  }, [id]);

  const successRequest = async () => {
    if (id) {
      const { data } = await axios.get(
        // `/api/stripe-success/${id}`
        `${process.env.NEXT_PUBLIC_API}/stripe-success/${id}`
      );
      // console.log("SUCCESS REQ DATA", data);
      router.push(`/user/course/${data.course.slug}`);      
    }
  };

  return (
    <UserRoute showNav={false}>
      <div className="row text-center">
        <div className="col-md-9 pb-5">
          <div className="d-flex justify-content-center p-5">
            <SyncOutlined spin className="display-1 text-danger p-5" />
          </div>
        </div>
        <div className="col-md-3"></div>
      </div>
    </UserRoute>
  );
};

export default StripeSuccess;
