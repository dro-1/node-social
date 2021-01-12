const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let verifiedToken;
  try {
    verifiedToken = jwt.verify(token, "mysupersecretkey");
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!verifiedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = verifiedToken.userId;
  req.isAuth = true;
  next();
};
