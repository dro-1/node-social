const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const socket = require("./../util/socket");
const Post = require("./../models/post");
const User = require("./../models/user");

exports.getFeeds = (req, res, next) => {
  const page = req.query.page || 1;
  const pageLimit = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageLimit)
        .limit(pageLimit)
        .populate("creator", "name");
    })
    .then((posts) => {
      res.json({
        message: "Success",
        posts,
        totalItems,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.putStatus = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Entered data is incorrect");
    error.message = errors.array();
    error.statusCode = 422;
    throw error;
  }
  User.findById(req.userId)
    .then((user) => {
      user.status = req.body.status;
      return user.save();
    })
    .then((user) => {
      res.status(202).json({
        message: "Success",
        status: user.status,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      res.status(200).json({
        message: "Success",
        status: user.status,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.postFeed = (req, res, next) => {
  const { content, title } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Entered data is incorrect");
    error.message = errors.array();
    error.statusCode = 422;
    throw error;
  }
  const image = req.file;
  if (!image) {
    let error = new Error("No Image Provided");
    error.statusCode = 422;
    throw err;
  }
  const post = new Post({
    content,
    title,
    imageUrl: image.path,
    creator: req.userId,
  });
  post
    .save()
    .then((post) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.push(post);
      return user.save();
    })
    .then((user) => {
      const io = socket.getIO();
      io.emit("posts", {
        action: "create",
        post,
      });
      res.status(201).json({
        message: "Post uploaded successfully",
        post,
        creator: {
          _id: user._id,
          name: user.name,
        },
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Post Fetched",
        post,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.putPost = (req, res, next) => {
  let { content, title } = req.body;
  let imageUrl = req.body.image;
  const { postId } = req.params;
  console.log(req.body);
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Entered data is incorrect");
    error.message = errors.array();
    error.statusCode = 422;
    throw error;
  }
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    let error = new Error("No Image was sent");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        let error = new Error("No Post Found");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId.toString()) {
        let error = new Error("User Not Authorized To Perform This Action");
        error.statusCode = 403;
        throw error;
      }
      post.content = content;
      post.title = title;
      if (imageUrl !== post.imageUrl) {
        deleteFileHelper(post.imageUrl);
      }
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((newPost) => {
      const io = socket.getIO();
      io.emit("posts", {
        action: "update",
        post: newPost,
      });
      res.status(200).json({ message: "Post Updated", post: newPost });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.body;
  let deletedPost;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        let error = new Error("No Post Found");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId.toString()) {
        let error = new Error("User Not Authorized To Perform This Action");
        error.statusCode = 403;
        throw error;
      }
      return Post.findByIdAndDelete(postId);
    })
    .then((post) => {
      deletedPost = post;
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((user) => {
      deleteFileHelper(deletedPost.imageUrl);
      const io = socket.getIO();
      io.emit("posts", {
        action: "delete",
        post: postId,
      });
      res.json({
        message: "Post Successfully Deleted",
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const deleteFileHelper = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("File Deleted");
  });
};
