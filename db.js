const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://dro:pword1234@cluster0.ytwpa.mongodb.net/social?retryWrites=true&w=majority`;

const dbConnector = (cb) => {
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((client) => {
      console.log("DB Connected");
      cb();
    })
    .catch(console.log);
};

module.exports = dbConnector;
