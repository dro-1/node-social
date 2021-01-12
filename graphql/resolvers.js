const User = require("./../models/user");
const Post = require("./../models/post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator").default;
const trim = validator.trim;
const normalizeEmail = validator.normalizeEmail;

exports.hello = () => "Hello There";

exports.createUser = async ({ userInput }, req) => {
  const { email, password, name } = userInput;
  let errors = [];
  if (!validator.isEmail(normalizeEmail(email))) {
    errors.push({
      value: "email",
      message: "Invalid email",
    });
  }
  if (!validator.isLength(trim(password), { min: 6 })) {
    errors.push({
      value: "password",
      message: "Password must be 6 or more characters",
    });
  }
  if (!validator.isLength(trim(name), { min: 3 })) {
    errors.push({
      value: "name",
      message: "Name must be 3 or more characters",
    });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid Input");
    error.status = 422;
    error.data = errors;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  console.log(existingUser);
  if (existingUser) {
    const error = new Error("User already exists");
    error.status = 422;
    throw error;
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      name,
      password: hashedPassword,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  } catch (e) {
    console.log(e);
  }
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  const passwordEqual = await bcrypt.compare(password, user.password);
  if (!passwordEqual) {
    const error = new Error("Incorrect Password");
    error.status = 404;
    throw error;
  }
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    "mysupersecretkey",
    { expiresIn: "1h" }
  );
  return { token, userId: user._id.toString() };
};

exports.createPost = async ({ postInput }, req) => {
  const { imageUrl, title, content } = postInput;
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  let errors = [];
  //   if (!validator.isURL(trim(imageUrl))) {
  //     errors.push({
  //       value: "imageUrl",
  //       message: "Invalid URL",
  //     });
  //   }
  if (!validator.isLength(trim(content), { min: 5 })) {
    errors.push({
      value: "content",
      message: "Content must be 5 or more characters",
    });
  }
  if (!validator.isLength(trim(title), { min: 5 })) {
    errors.push({
      value: "title",
      message: "Title must be 5 or more characters",
    });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid Input");
    error.status = 422;
    error.data = errors;
    throw error;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  const post = new Post({
    title,
    imageUrl,
    content,
    creator: user,
  });
  const savedPost = await post.save();
  user.posts.push(savedPost);
  await user.save();

  return {
    ...savedPost._doc,
    _id: savedPost.id.toString(),
    createdAt: savedPost.createdAt.toISOString(),
    updatedAt: savedPost.updatedAt.toISOString(),
  };
};

exports.getPosts = async ({ noOfPost }, req) => {
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  const page = noOfPost;
  const pageLimit = 2;
  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .skip((page - 1) * pageLimit)
    .limit(pageLimit)
    .sort({ createdAt: -1 })
    .populate("creator");
  console.log(posts);
  return {
    posts: posts.map((p) => ({
      ...p._doc,
      _id: p._id.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    totalPosts,
  };
};
