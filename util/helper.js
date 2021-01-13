const path = require("path");
const fs = require("fs");

exports.deleteFile = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("File Deleted");
  });
};
