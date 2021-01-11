const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const path = require("path");
const multer = require("multer");
const socket = require("./util/socket");
const dbConnector = require("./util/db");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    let fileName = new Date().getTime() + "-" + file.originalname;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    return cb(null, true);
  }
  return cb(null, false);
};

app.use(bodyParser.json());

app.use(
  multer({
    storage: fileStorage,
    fileFilter,
  }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode, message, data } = error;
  const responseJSON = data
    ? {
        message,
        data,
      }
    : {
        message,
      };
  res.status(statusCode).json(responseJSON);
});

app.use((req, res) => {
  res.json({
    status: "Error",
    message: "Route does not exist",
  });
});

dbConnector(() => {
  const server = app.listen(8080, () => {
    console.log("Server Started");
  });
  socket.connect(server);
});
