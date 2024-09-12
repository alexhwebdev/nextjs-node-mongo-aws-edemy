import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const completedSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    course: {
      type: ObjectId,
      ref: "Course",
    },
    courseName: {
      type: String,
      trim: true,
    },
    lessons: [],
  },
  { timestamps: true }
);

export default mongoose.model("Completed", completedSchema);
