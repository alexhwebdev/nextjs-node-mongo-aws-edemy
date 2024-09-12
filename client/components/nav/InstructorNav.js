"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const InstructorNav = () => {
  const [current, setCurrent] = useState("");

  useEffect(() => {
    process.browser && setCurrent(window.location.pathname);
  }, [process.browser && window.location.pathname]);

  return (
    <div className="nav flex-column nav-pills">
      <Link href="/instructor">
        <p className={`nav-link ${current === "/instructor" && "active"}`}>
          Dashboard
        </p>
      </Link>
      {/* <Link href="/instructor/course/create"> */}
      <Link href="/instructor/course">
        <p
          className={`nav-link ${
            // current === "/instructor/course/create" && "active"
            current === "/instructor/course" && "active"
          }`}
        >Course Create
        </p>
      </Link>
      <Link href="/instructor/revenue">
        <p
          className={`nav-link ${
            current === "/instructor/revenue" && "active"
          }`}
        >Revenue
        </p>
      </Link>
    </div>
  );
};

export default InstructorNav;
