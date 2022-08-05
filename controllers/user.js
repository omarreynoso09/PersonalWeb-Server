const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user");
const jwt = require("../services/jwt");

function signUp(req, res) {
  const user = new User();

  const { email, password, repeatPassword } = req.body;
  user.email = email.toLowerCase();
  user.role = "admin";
  user.active = false;

  if (!password || !repeatPassword) {
    res.status(404).send({ message: "The Passwords Are Mandatory." });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "The Passwords Do Not Match." });
    } else {
      bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          res
            .status(500)
            .send({ message: "Error While Encrypting The Password." });
        } else {
          user.password = hash;

          user.save((err, userStored) => {
            if (err) {
              res.status(500).send({ message: "The User Exist." });
            } else {
              if (!userStored) {
                res.status(404).send({ message: "Error Creating The User." });
              } else {
                res.status(200).send({ user: userStored });
              }
            }
          });
        }
      });
    }
  }
}

function signIn(req, res) {
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;

  User.findOne({ email }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Server Error." });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "User Not Found." });
      } else {
        bcrypt.compare(password, userStored.password, (err, check) => {
          if (err) {
            res.status(500).send({ message: "Server Error." });
          } else if (!check) {
            res.status(404).send({ message: "Incorrect Password." });
          } else {
            if (!userStored.active) {
              res
                .status(200)
                .send({ code: 200, message: "The User Is Not Active." });
            } else {
              res.status(200).send({
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
}
module.exports = {
  signUp,
  signIn,
};
