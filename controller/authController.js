const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("./../models/user");

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid inputs");
    error.data = errors.array();
    error.statusCode = 422;
    throw error;
  }
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error("Email/Password Mismatch");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((resp) => {
      if (!resp) {
        const error = new Error("Email/Password Mismatch");
        error.statusCode = 401;
        throw error;
      }
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.putUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid inputs");
    error.data = errors.array();
    error.statusCode = 422;
    throw error;
  }
  const { email, name, password } = req.body;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name,
        email,
        password: hashedPassword,
        posts: [],
      });
      return user.save();
    })
    .then((user) => {
      console.log(user);
      if (!user) {
        const error = new Error("User not created");
        next(error);
      }
      res.status(201).json({
        message: "User Created",
        userId: user._id,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
