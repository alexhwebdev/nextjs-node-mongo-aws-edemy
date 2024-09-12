import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;
// const { Schema } = mongoose;

const userSchema = new mongoose.Schema( // can do this
// const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    picture: {
      type: String,
      default: "/avatar.png",
    },
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "Instructor", "Admin"],
    },
    stripe_account_id: String,
    stripe_seller: {},
    stripeSession: {},
    // passwordResetCode: {
    //   data: {
    //     type: String,
    //     default: "", // Correctly specify the default value
    //   },
    // },
    passwordResetCode: {
      data: String,
      default: String,
    },
    courses: [{ 
      type: ObjectId, 
      // type: Schema.Types.ObjectId,
      ref: "Course" 
    }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
