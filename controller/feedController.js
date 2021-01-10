const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("./../models/post");

exports.getFeeds = (req, res, next) => {
  const page = req.query.page || 1;
  const pageLimit = 2;
  let totalItems;
  Post.find()
    .countDocuments((count) => {
      totalItems = count;
      return Post.find()
        .skip((page - 1) * pageLimit)
        .limit(pageLimit);
    })
    .then((posts) => {
      res.json({
        message: "Success",
        posts,
        totalItems,
      });
    })
    .catch((err) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(err);
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
    creator: {
      name: "Dro",
    },
  });
  post
    .save()
    .then((post) => {
      res.status(201).json({
        message: "Post uploaded successfully",
        post,
      });
    })
    .catch((err) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(err);
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
    .catch((err) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(err);
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
      post.content = content;
      post.title = title;
      if (imageUrl !== post.imageUrl) {
        deleteFileHelper(post.imageUrl);
      }
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((newPost) => {
      res.status(200).json({ message: "Post Updated", post: newPost });
    });
};

exports.deletePost = (req, res) => {
  const { postId } = req.body;
  Post.findByIdAndDelete(postId)
    .then((resp) => {
      if (!resp) {
        let error = new Error("No Post Found");
        error.statusCode = 404;
        throw error;
      }
      deleteFileHelper(resp.imageUrl);
      res.json({
        message: "Post Successfully Deleted",
        post: resp,
      });
    })
    .catch((err) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(err);
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
