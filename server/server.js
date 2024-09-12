// server.js in Tutorial
import cors from "cors";
import dotenv from "dotenv"; // require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan"; // const morgan = require("morgan");
import authRoutes from "./routes/auth.js";
import instructorRoutes from "./routes/instructor.js";
import courseRoutes from "./routes/course.js";
import cookieParser from "cookie-parser";
import csrf from "csurf";

// const csrfProtection = csrf({ cookie: true });

dotenv.config();
const app = express();



const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      throw err;
    });
};

// app.use(cors());
app.use(cors({ 
  origin: process.env.CLIENT_URL, // pass client side URL
  credentials: true // true bc we are sending cookies to client side
}));

// app.use(express.json());
app.use(express.json({ limit: "5mb" })); // limit set for image upload

// we need this bc 'cookie' is true in csrfProtection above
app.use(cookieParser());
app.use(morgan("dev"));

// route
app.use("/api", authRoutes);
app.use("/api", instructorRoutes);
app.use("/api", courseRoutes);
// readdirSync("./routes").map((r) => app.use(
//   "/api", import(`./routes/${r}`))
// );



const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
// send csrf token to client
app.get("/api/csrf-token", (req, res) => {
  console.log('req.csrfToken()', req.csrfToken())
  res.json({ csrfToken: req.csrfToken() });
  // res.send({ csrfToken: req.csrfToken() });
});

app.get("/", (req, res) => {
  res.send("you hit server endpoint");
});


// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  connect();
  console.log(`Server is running on port ${port}`)
});