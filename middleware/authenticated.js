const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "gR7cH9Svfj8JLe4c186Ghs48hheb3902nh5DsA";

exports.ensureAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ message: "The Request Doesn't Have an Authetication Header." });
  }

  const token = req.headers.authorization.replace(/['"]+/g, ""); // thats just the cause and replace expression to replace for blank space

  try {
    var payload = jwt.decode(token, SECRET_KEY);

    if (payload.exp <= moment().unix()) {
      return res.status(404).send({ message: "The Token Expired!" });
    }
  } catch (ex) {
    console.log(ex);
    return res.status(404).send({ message: "Invalid Token!" });
  }
  req.user = payload;
  next();
};
