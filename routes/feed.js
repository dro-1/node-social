const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const feedController = require("./../controller/feedController");
const isAuth = require("./../middleware/isAuth");

router.get("/posts", isAuth, feedController.getFeeds);

router.post(
  "/post",
  isAuth,
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

router.get("/posts/:postId", isAuth, feedController.getPost);

router.put(
  "/posts/:postId",
  isAuth,
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

router.delete("/post", isAuth, feedController.deletePost);

module.exports = router;
