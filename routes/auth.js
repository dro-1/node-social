const express = require("express");
const authController = require("./../controller/authController");
const { body } = require("express-validator");
const User = require("../models/user");
const router = express.Router();

router.post(
  "login",
  [
    body("email", "You entered an invalid email")
      .isEmail()
      .normalizeEmail()
      .custom((req, { value }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already exists");
          }
        });
      }),
    body("password").trim().isLength({ min: 6 }),
  ],
  authController.login
);

router.put(
  "/signup",
  [
    body("email", "You entered an invalid email")
      .isEmail()
      .normalizeEmail()
      .custom((req, { value }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already exists");
          }
        });
      }),
    body("password").trim().isLength({ min: 6 }),
    body("name").trim().isLength({ min: 1 }),
  ],
  authController.putUser
);

module.exports = router;
