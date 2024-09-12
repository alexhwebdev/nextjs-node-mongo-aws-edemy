// https://medium.com/@yelinliu/how-to-build-login-signup-app-and-authenticate-with-cookies-using-mern-stack-jwt-csrf-token-adb1f22e445b
// import expressJwt from "express-jwt";
import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Course from "../models/course.js";
import dotenv from "dotenv";
dotenv.config();
// console.log('requireSignin process.env.JWT_SECRET', process.env.JWT_SECRET)

export const requireSignin = expressjwt({
  getToken: (req, res) => {
    // console.log('requireSignin req', req)
    // console.log('requireSignin res', res)
    // console.log('req.cookies', req.cookies)
    // console.log('requireSignin req.cookies.token', req.cookies.token)
    return req.cookies.token
  },
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  // requestProperty: "user",
});

export const isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id).exec();
    if (!user.role.includes("Instructor")) {
      return res.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

export const isEnrolled = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id).exec();
    const course = await Course.findOne({ slug: req.params.slug }).exec();

    // check if course id is found in user courses array
    let ids = [];
    for (let i = 0; i < user.courses.length; i++) {
      ids.push(user.courses[i].toString());
    }

    if (!ids.includes(course._id.toString())) {
      res.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};