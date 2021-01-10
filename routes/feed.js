const express = require("express");

const router = express.Router();

const feedController = require("./../controller/feedController");

router.get("/posts", feedController.getFeeds);

module.exports = router;
