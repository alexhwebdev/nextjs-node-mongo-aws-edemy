import User from "../models/user.js";
import Course from "../models/course.js";
import stripe from "stripe";
import queryString from "query-string";
import dotenv from "dotenv"; // require("dotenv").config();
dotenv.config();

// const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Stripe = new stripe(process.env.STRIPE_SECRET);

export const makeInstructor = async (req, res) => {
  // console.log('makeInstructor req.auth ', req.auth)
  try {
    // 1. find user from db
    const user = await User.findById(req.auth._id).exec();
    
    // 2. if user dont have stripe_account_id yet, then create new
    if (!user.stripe_account_id) {
      const account = await Stripe.accounts.create({ type: "express" });
      // console.log('account.id ', account.id)
      user.stripe_account_id = account.id;
      user.save(); // save newly created Stripe account to User
    }
    
    // 3. create account link based on account id (for frontend to complete onboarding)
    let accountLink = await Stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL, // http://localhost:3000/stripe/callback
      return_url: process.env.STRIPE_REDIRECT_URL,  // http://localhost:3000/stripe/callback
      type: "account_onboarding",
    });
    // console.log('accountLink ', accountLink)
    
    // 4. pre-fill any info such as email (optional), then send url resposne to frontend
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });
    // console.log('accountLink ', accountLink)
    
    // 5. then send the account link as response to fronend
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
    // This opens new window bc of > Client > BecomeInstructor > window.location.href = res.data; 
  } catch (err) {
    console.log("MAKE INSTRUCTOR ERR ", err);
  }
};

export const getAccountStatus = async (req, res) => {
  // console.log('getAccountStatus req.auth ', req.auth)
  try {
    const user = await User.findById(req.auth._id).exec();
    // console.log("getAccountStatus user ", user);
    const account = await Stripe.accounts.retrieve(
      user.stripe_account_id
    );
    // console.log("getAccountStatus account ", account);
    if (!account.charges_enabled) {
      return res.staus(401).send("Unauthorized");
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          $addToSet: { role: "Instructor" }, // $addToSet operator is used to add a value to an array only if it doesn't already exist in that array. Used in conjunction with the findByIdAndUpdate method to update a document
        },
        { new: true }
      )
        .select("-password")
        .exec();
      res.json(statusUpdated);
    }
  } catch (err) {
    console.log(err);
  }
};

export const currentInstructor = async (req, res) => {
  try {
    let user = await User
      .findById(req.auth._id)
      .select("-password")
      .exec();

    if (!user.role.includes("Instructor")) {
      return res.status(403);
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};

export const instructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.auth._id })
      .sort({ createdAt: -1 })
      .exec();

    // console.log('instructorCourses courses ', courses);
    res.json(courses);
  } catch (err) {
    console.log(err);
  }
};

export const studentCount = async (req, res) => {
  try {
    const users = await User.find({ courses: req.body.courseId })
      .select("_id")
      .exec();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

export const instructorBalance = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).exec();
    const balance = await Stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    // console.log('instructorBalance balance ', balance)
    res.json(balance);
  } catch (err) {
    console.log(err);
  }
};

export const instructorPayoutSettings = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).exec();
    const loginLink = await Stripe.accounts.createLoginLink(
      user.stripe_seller.id,
      { redirect_url: process.env.STRIPE_SETTINGS_REDIRECT }
    );
    res.json(loginLink.url);
  } catch (err) {
    console.log("stripe payout settings login link err => , err");
  }
};