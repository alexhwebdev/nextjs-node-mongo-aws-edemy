"use client"
import { useState, useEffect, useContext } from "react";
import { Menu } from "antd";
import Link from "next/link";
import { Context } from "../context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
// import {
//   AppstoreOutlined,
//   LoginOutlined,
//   UserAddOutlined,
// } from "@ant-design/icons";
import { FaAppStore } from "react-icons/fa6";
import { AiOutlineTeam } from "react-icons/ai";
import { IoLogInOutline } from "react-icons/io5";
import { TiUserAddOutline } from "react-icons/ti";
import { AiOutlineCarryOut } from "react-icons/ai";
import { AiOutlineCoffee } from "react-icons/ai";

const { Item, SubMenu, ItemGroup } = Menu;

const TopNav = () => {
  const [current, setCurrent] = useState("");
  const { state, dispatch } = useContext(Context);
  const { user } = state;
  const router = useRouter();

  useEffect(() => {
    // console.log(window.location.pathname); // /login
    process.browser && setCurrent(window.location.pathname);
  }, [process.browser && window.location.pathname]);

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
    window.localStorage.removeItem("user");
    // const { data } = await axios.get("/api/logout");
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/logout`,
    );
    toast(data.message);
    router.push("/login");
  };
  // console.log('TopNav user', user);

  return (
    <Menu //Menu
      mode="horizontal" 
      selectedKeys={[current]}
      className="mb-2"
    >
      <Item
        key="/"
        onClick={(e) => setCurrent(e.key)}
        icon={<FaAppStore />}
      >
        <Link href="/">
          <p>App</p>
        </Link>
      </Item>


      {user && user.role && user.role.includes("Instructor") ? (
        <Item
          // key="/instructor/course/create"
          key="/instructor/course"
          onClick={(e) => setCurrent(e.key)}
          icon={<AiOutlineCarryOut />}
        >
          {/* <Link href="/instructor/course/create"> */}
          <Link href="/instructor/course">
            <p>Create Course</p>
          </Link>
        </Item>
      ) : (
        <Item
          key="/user/become-instructor"
          onClick={(e) => setCurrent(e.key)}
          icon={<AiOutlineTeam />}
        >
          <Link href="/user/become-instructor">
            <p>Become Instructor</p>
          </Link>
        </Item>
      )}

      {user === null && (
        <>
          <Item
            key="/login"
            onClick={(e) => setCurrent(e.key)}
            icon={<IoLogInOutline />}
          >
            <Link href="/login">
              <p>Login</p>
            </Link>
          </Item>

          <Item
            key="/register"
            onClick={(e) => setCurrent(e.key)}
            icon={<TiUserAddOutline />}
          >
            <Link href="/register">
              <p>Register</p>
            </Link>
          </Item>
        </>
      )}

      {user !== null && (
        <SubMenu
          icon={<AiOutlineCoffee />}
          title={user && user.name}
          className="float-right"
        >
          <ItemGroup>
            <Item key="/user">
              <Link href="/user">
                <p>Dashboard</p>
              </Link>
            </Item>
            <Item onClick={logout}>Logout</Item>
          </ItemGroup>
        </SubMenu>
      )}

      {user && user.role && user.role.includes("Instructor") && (
        <Item
          key="/instructor"
          onClick={(e) => setCurrent(e.key)}
          icon={<AiOutlineTeam />}
          className="float-right"
        >
          <Link href="/instructor">
            <p>Instructor</p>
          </Link>
        </Item>
      )}
    </Menu>
  );
};

export default TopNav;


