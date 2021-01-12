const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const dbConnector = require("./util/db");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");

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
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn: (err) => {
      if (err.originalError && err.originalError.data) {
        err.data = err.originalError.data;
      }
      if (err.originalError && err.originalError.status) {
        err.status = err.originalError.status;
      }
      return err;
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

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
  app.listen(8080, () => {
    console.log("Server Started");
  });
});
