const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Authorization header not included");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let verifiedToken;
  try {
    verifiedToken = jwt.verify(token, "mysupersecretkey");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!verifiedToken) {
    const error = new Error("Invalid Token");
    error.statusCode = 401;
    throw error;
  }
  req.userId = verifiedToken.userId;
  next();
};
