import express from "express";
import { 
  register, login, logout, currentUser,
  sendTestEmail,
  forgotPassword, resetPassword,
} from "../controllers/auth.js";
import { requireSignin } from "../middlewares/index.js";

// import { makeInstructor } from "../controllers/instructor.js";



const router = express.Router();

// router.get("/register", (req, res) => {
//   res.send("register user");
// });
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireSignin, currentUser);
router.get("/send-email", sendTestEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);



// router.post("/make-instructor", requireSignin, makeInstructor);



// module.exports = router;
export default router;

