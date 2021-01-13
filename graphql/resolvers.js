const User = require("./../models/user");
const Post = require("./../models/post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator").default;
const trim = validator.trim;
const normalizeEmail = validator.normalizeEmail;
const helper = require("./../util/helper");

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

exports.updatePost = async ({ postId, postInput }, req) => {
  const { imageUrl, title, content } = postInput;
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  let errors = [];
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

  const post = await Post.findById(postId).populate("creator");
  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }
  if (post.creator._id.toString() !== req.userId) {
    const error = new Error("Inauthorized User");
    error.status = 403;
    throw error;
  }
  post.title = title;
  post.content = content;
  if (imageUrl) {
    post.imageUrl = imageUrl;
  }
  const savedPost = await post.save();
  console.log(savedPost);
  return {
    ...savedPost._doc,
    _id: savedPost.id.toString(),
    createdAt: savedPost.createdAt.toISOString(),
    updatedAt: savedPost.updatedAt.toISOString(),
  };
};

exports.getPosts = async ({ page }, req) => {
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  if (!page) {
    page = 1;
  }
  const pageLimit = 2;
  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .skip((page - 1) * pageLimit)
    .limit(pageLimit)
    .sort({ createdAt: -1 })
    .populate("creator");
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

exports.getPost = async ({ postId }, req) => {
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  const foundPost = await Post.findById(postId).populate("creator");
  if (!foundPost) {
    const error = new Error("Post Not Found");
    error.status = 404;
    throw error;
  }
  return {
    ...foundPost._doc,
    _id: foundPost.id.toString(),
    createdAt: foundPost.createdAt.toISOString(),
    updatedAt: foundPost.updatedAt.toISOString(),
  };
};

exports.deletePost = async ({ postId }, req) => {
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }
  if (post.creator.toString() !== req.userId) {
    const error = new Error("Inauthorized User");
    error.status = 403;
    throw error;
  }
  helper.deleteFile(post.imageUrl);
  await Post.findByIdAndDelete(postId);
  const user = await User.findById(req.userId);
  user.posts.pull(postId);
  await user.save();

  return deletedPost._id.toString();
};

exports.getStatus = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user.status;
};

exports.updateStatus = async ({ status }, req) => {
  if (!req.isAuth) {
    const error = new Error("Inauthenticated User");
    error.status = 401;
    throw error;
  }
  let errors = [];
  if (!validator.isLength(trim(status), { min: 5 })) {
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
  user.status = status;
  await user.save();
  return user.status;
};
