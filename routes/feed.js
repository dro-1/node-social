const express = require("express");

const router = express.Router();

const { body } = require("express-validator");

const feedController = require("./../controller/feedController");

router.get("/posts", feedController.getFeeds);

router.post(
  "/post",
  [
    body("title", "Title must be not less than 5 alpanumeric characters")
      .trim()
      .isLength({ min: 5 }),
    body("content", "Content must have minimum of 5 characters")
      .trim()
      .isLength({
        min: 5,
      }),
  ],
  feedController.postFeed
);

router.get("/posts/:postId", feedController.getPost);

router.put(
  "/posts/:postId",
  [
    body("title", "Title must be not less than 5 alpanumeric characters")
      .trim()
      .isLength({ min: 5 }),
    body("content", "Content must have minimum of 5 characters")
      .trim()
      .isLength({
        min: 5,
      }),
  ],
  feedController.putPost
);

router.delete("/post", feedController.deletePost);

module.exports = router;
