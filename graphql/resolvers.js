const User = require("./../models/user");
const bcrypt = require("bcryptjs");

exports.hello = () => "Hello There";

exports.createUser = async ({ userInput }, req) => {
  const { email, password, name } = userInput;
  const existingUser = User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 422;
    throw Error;
  }
  const hashedPassword = bcrypt.hash(password, 12);
  const user = new User({
    email,
    name,
    password: hashedPassword,
  });
  const createdUser = await user.save();
  return { ...createdUser._doc, _id: createdUser._id.toString() };
};
