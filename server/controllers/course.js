import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import Course from "../models/course.js";
import Completed from "../models/completed.js";
import User from "../models/user.js";
import slugify from "slugify";
import { readFileSync } from "fs";
// const stripe = require("stripe")(process.env.STRIPE_SECRET);
import Stripe from 'stripe';
import dotenv from "dotenv"; // require("dotenv").config();
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET);

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
  // console.log('uploadImage req.body ', req.body);
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image");

    // prepare the image
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];
    // "data:image/jpeg;base64,/9j/4AAQSkZJRg...."
    // 
    // EX :
    // const str = 'data:image/jpeg;base64,/9j....';
    // const first = str.split(';')[0];
    // console.log(first); RESULT : "data:image/jpeg"
    
    // const str2 = 'data:image/jpeg;base64,/9j....';
    // const second = str2.split("/")[1];
    // console.log(second); RESULT : "jpeg;base64,"
    
    // const str3 = 'data:image/jpeg;base64,/9j....';
    // const third = str3.split(';')[0].split("/")[1];
    // console.log(third);
    // console.log(words); RESULT : "jpeg"
    // console.log('uploadImage type ', type); // RESULT : "jpeg"

    // image params
    const params = {
      Bucket: "alexhong-edemy-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    // console.log('removeImage image', image)
    // image params
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    // send remove request to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      // res.send({ ok: true });
      // res.status(200).json("Image removed!")
      res.send({message : "message : Image removed!"});
    });
  } catch (err) {
    console.log(err);
  }
};

export const create = async (req, res) => {
  // console.log("controllers > course.js req.auth ", req.auth);
  // console.log("controllers > course.js req.body ", req.body);

  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    // console.log("controllers > course.js alreadyExist ", alreadyExist);
    if (alreadyExist) return res.status(400).send("Title is taken");

    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.auth._id,
      ...req.body,
    }).save();

    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Course create failed. Try again.");
  }
};

export const read = async (req, res) => {
  // console.log('controllers > course.js req ', req);
  // console.log('controllers > course.js req.params ', req.params);
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "_id name")
      .exec();
    res.json(course);
  } catch (err) {
    console.log(err);
  }
};

export const uploadVideo = async (req, res) => {
  // console.log('controllers/course.js req.files ', req.files);

  try {
    if (req.auth._id != req.params.instructorId) {
      return res.status(400).send("Unauthorized");
    }

    const { video } = req.files;
    // console.log('video ', video);
    if (!video) return res.status(400).send("No video");

    // video params
    const params = {
      Bucket: "alexhong-edemy-bucket",
      Key: `${nanoid()}.${video.type.split("/")[1]}`, // randomString.mp4
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeVideo = async (req, res) => {
  // console.log("controller/course.js removeVideo req ", req);
  // console.log("controller/course.js removeVideo req.body ", req.body);

  try {
    if (req.auth._id != req.params.instructorId) {
      return res.status(400).send("Unauthorized");
    }

    const { Bucket, Key } = req.body;
    // console.log("VIDEO REMOVE =====> ", req.body);

    const params = {
      Bucket,
      Key,
    };

    // upload to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params;
    const { title, content, video } = req.body;
    // console.log('addLesson slug ', slug);

    if (req.auth._id != instructorId) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate(
      { slug },
      { 
        $push: { // MongoDB method : $push is an update operator that adds an item to an array field.
          lessons: { 
            title, content, video, slug: slugify(title) 
          } 
        },
      },
      { new: true }
    )
      .populate("instructor", "_id name") // Mongoose will replace the instructor field (which contains only an ObjectId) with the actual Instructor document that has that ObjectId. This allows you to get detailed information about the referenced document without making separate queries.
      .exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Add lesson failed");
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    // console.log(slug);
    const course = await Course.findOne({ slug }).exec();
    // console.log("COURSE FOUND req.auth._id => ", req.auth._id);
    // console.log("COURSE FOUND => course.instructor", course.instructor);
    if (req.auth._id != course.instructor) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate(
      { slug }, 
      req.body, {
        new: true, // return the updated document rather than the original document before the update.
      }
    ).exec();

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};

export const removeLesson = async (req, res) => {
  // console.log('removeLesson req.params ', req.params);

  const { slug, lessonId } = req.params;
  const course = await Course.findOne({ slug }).exec();
  // console.log('removeLesson course ', course);
  if (req.auth._id != course.instructor) {
    return res.status(400).send("Unauthorized");
  }

  const deletedCourse = await Course.findByIdAndUpdate(course._id, {
    $pull: { lessons: { _id: lessonId } },
  }).exec();

  res.json({ ok: true });
};

export const updateLesson = async (req, res) => {
  // console.log("updateLesson req.params", req.params);
  // RESULT : updateLesson req.params {
  //   slug: 'course-3-alexhwebdev',
  //   instructorId: '66dd29343950ee183dc2a695'
  // }
  try {
    // const { courseId, lessonId } = req.params;
    const { slug } = req.params;
    const { _id, title, content, video, free_preview } = req.body;
    
    // find post
    const course = await Course.findOne({slug})
      .select("instructor")
      .exec();
    // console.log("updateLesson course", course);
    // updateLesson course {
    //   _id: new ObjectId('66db9a2e2786a38b2bb91c11'),
    //   instructor: new ObjectId('66d7ce05f85b8ccf25f214c8')
    // }

    // console.log("updateLesson req.auth._id", req.auth._id);
    // updateLesson req.auth._id 66d7ce05f85b8ccf25f214c8

    // console.log("updateLesson course._id", course._id);
    // updateLesson course._id new ObjectId('66db9a2e2786a38b2bb91c11')
    
    // is owner?
    if (req.auth._id != course.instructor) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.updateOne(
      { "lessons._id": _id },
      {
        $set: {
          "lessons.$.title": title,
          "lessons.$.content": content,
          "lessons.$.video": video,
          "lessons.$.free_preview": free_preview,
        },
      },
      { new: true }
    ).exec();
    console.log("updated => ", updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Update lesson failed");
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // console.log("publishCourse req.params", req.params);

    // find post
    const courseFound = await Course.findById(courseId)
      .select("instructor")
      .exec();
      
    // console.log("publishCourse courseFound", courseFound);

    // is owner?
    if (req.auth._id != courseFound.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let updated = await Course.findByIdAndUpdate(
      courseId,
      { published: true },
      { new: true }
    ).exec();
    // console.log("course published", updated);
    // return;
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Publish course failed");
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find post
    const courseFound = await Course.findById(courseId)
      .select("instructor")
      .exec();
    // is owner?
    if (req.auth._id != courseFound.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let course = await Course.findByIdAndUpdate(
      courseId,
      { published: false },
      { new: true }
    ).exec();
    // console.log("course unpublished", course);
    // return;
    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unpublish course failed");
  }
};

export const courses = async (req, res) => {
  // console.log("all courses");
  const all = await Course.find({ published: true })
    .limit(11)
    // .select("-lessons")
    .populate("instructor", "_id name") // populate instructors id and name
    // .populate("categories", "_id name")
    .exec();
  // console.log("============> ", all);
  res.json(all);
};

export const checkEnrollment = async (req, res) => {

  try {
    const { courseId } = req.params;
    console.log('checkEnrollment courseId ', courseId)
  
    // find courses of the currently logged in user
    const user = await User.findById(req.auth._id).exec();
  
    // check if course id is found in user courses array
    let ids = [];
    let length = user.courses && user.courses.length;
  
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        ids.push(user.courses[i].toString());
      }
    }

    res.json({
      status: ids.includes(courseId),
      course: await Course.findById(courseId).exec(),
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("ERROR checkEnrollment");
  }
};

export const freeEnrollment = async (req, res) => {
  try {
    // check if course is free or paid
    const course = await Course
      .findById(req.params.courseId)
      .exec();

    if (course.paid) return;

    const result = await User.findByIdAndUpdate(
      req.auth._id,
      { 
        $addToSet: { courses: course._id } // $addToSet operator is used to add a value to an array only if it doesn't already exist in that array. Used in conjunction with the findByIdAndUpdate method to update a document
      }, 
      { new: true }
    ).exec();
    console.log(result);
    res.json({
      message: "Congratulations! You have successfully enrolled",
      course: course,
    });
  } catch (err) {
    console.log("free enrollment err", err);
    return res.status(400).send("Enrollment create failed");
  }
};


// PAID ENROLLMENT ERR StripeInvalidRequestError: You cannot use 
// `line_items.amount`, `line_items.currency`, `line_items.name`, 
// `line_items.description`, or `line_items.images` 
// in this API version. Please use `line_items.price` or 
// `line_items.price_data`. 
// Please see https://stripe.com/docs/payments/checkout/migrating-prices 
// for more information.


export const paidEnrollment = async (req, res) => {
  // console.log("paidEnrollment req", req);

  try {
    // check if course is free or paid
    const course = await Course.findById(req.params.courseId)
      .populate("instructor") // populate instructor info to make payment
      .exec();

    console.log("paidEnrollment course", course);
    if (!course.paid) return;
    // application fee 30%
    const fee = (course.price * 30) / 100;

    // create stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // purchase details
      line_items: [ // PAID ENROLLMENT ERR StripeInvalidRequestError: You may only specify one of these parameters: name, price.
        {
          // name: course.name,
          // amount: Math.round(course.price.toFixed(2) * 100),
          // currency: "usd",
          // quantity: 1,

          // https://docs.stripe.com/payments/accept-a-payment
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.name,
            },
            unit_amount: Math.round(course.price.toFixed(2) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // You must provide `mode` when using prices.

      // charge buyer and transfer remaining balance to seller (after fee)
      payment_intent_data: {
        application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },
      // redirect url after successful payment
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
    console.log("SESSION ID => ", session);

    await User.findByIdAndUpdate(req.auth._id, {
      stripeSession: session,
    }).exec();
    res.send(session.id);
  } catch (err) {
    console.log("PAID ENROLLMENT ERR", err);
    return res.status(400).send("Enrollment create failed");
  }
};

export const stripeSuccess = async (req, res) => {
  try {
    // find course
    const course = await Course.findById(req.params.courseId).exec();
    // get user from db to get stripe session id
    const user = await User.findById(req.auth._id).exec();
    // if no stripe session return
    if (!user.stripeSession.id) return res.sendStatus(400);
    // retrieve stripe session
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    console.log("STRIPE SUCCESS", session);
    // if session payment status is paid, push course to user's course []
    if (session.payment_status === "paid") {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { courses: course._id }, // $addToSet operator is used to add a value to an array only if it doesn't already exist in that array. Used in conjunction with the findByIdAndUpdate method to update a document
        $set: { stripeSession: {} },
      }).exec();
    }
    res.json({ success: true, course });
  } catch (err) {
    console.log("STRIPE SUCCESS ERR", err);
    res.json({ success: false });
  }
};

export const userCourses = async (req, res) => {
  const user = await User.findById(req.auth._id).exec();
  const courses = await Course.find({ _id: { $in: user.courses } }) // $in : used to match documents where the value of a field is equal to any value in a specified array.
    .populate("instructor", "_id name")
    .exec();
  res.json(courses);
};

export const markCompleted = async (req, res) => {
  const { courseId, courseName, lessonId } = req.body;

  // find if user with that course is already created
  const existing = await Completed.findOne({
    user: req.auth._id,
    course: courseId,
  }).exec();

  if (existing) {
    // update
    const updated = await Completed.findOneAndUpdate(
      {
        user: req.auth._id,
        course: courseId,
      },
      {
        $addToSet: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } else {
    // create
    const created = await new Completed({
      user: req.auth._id,
      course: courseId,
      courseName: courseName,
      lessons: lessonId,
    }).save();
    res.json({ ok: true });
  }
};

export const listCompleted = async (req, res) => {
  try {
    const list = await Completed.findOne({
      user: req.auth._id,
      course: req.body.courseId,
    }).exec();
    list && res.json(list.lessons);
  } catch (err) {
    console.log(err);
  }
};

export const markIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const updated = await Completed.findOneAndUpdate(
      {
        user: req.auth._id,
        course: courseId,
      },
      {
        $pull: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
