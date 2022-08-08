const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const User = require("../models/user");
const user = require("../models/user");

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
function getUsers(req, res) {
  User.find().then((users) => {
    if (!users) {
      res.status(404).send({ message: "User Can't Be Found" });
    } else {
      res.status(200).send({ users });
    }
  });
}
function getUsersActive(req, res) {
  // console.log(req);
  const query = req.query;

  User.find({ active: query.active }).then((users) => {
    if (!users) {
      res.status(404).send({ message: "User Can't Be Found" });
    } else {
      res.status(200).send({ users });
    }
  });
}

function uploadAvatar(req, res) {
  const params = req.params;
  // console.log("uploadAvatar");

  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).send({ message: "Server Error!" });
    } else {
      if (!userData) {
        res.status(404).send({ message: "Couldn't Find an User." });
      } else {
        let user = userData;

        // console.log(user);
        // console.log(req.files);

        if (req.files) {
          let filePath = req.files.avatar.path;
          let fileSplit = filePath.split("/");
          let fileName = fileSplit[2];

          let extSplit = fileName.split(".");
          let fileExt = extSplit[1];
          // console.log(extSplit);

          if ((fileExt !== "png", "PNG" && fileExt !== "jpg", "JPG")) {
            res.status(400).send({
              message:
                "File Extension Is Not Valid. (Files Extensions Allow: .png y .jpg)",
            });
          } else {
            user.avatar = fileName;
            User.findByIdAndUpdate(
              { _id: params.id },
              user,
              (err, userResult) => {
                if (err) {
                  res.status(500).send({ message: "Error del servidor." });
                } else {
                  if (!userResult) {
                    res
                      .status(404)
                      .send({ message: "Couldn't Find Any User." });
                  } else {
                    res.status(200).send({ avatarName: fileName });
                  }
                }
              }
            );
          }
        }
      }
    }
  });
}

function getAvatar(req, res) {
  const avatarName = req.params.avatarName;
  const filePath = "./uploads/avatar/" + avatarName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      res
        .status(404)
        .send({ message: "The Avatar You're Looking For Doesn't Exist" });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
}

async function updateUser(req, res) {
  let userData = req.body;
  userData.email = req.body.email.toLowerCase();
  const params = req.params;

  if (userData.password) {
    await bcrypt.hash(userData.password, null, null, (err, hash) => {
      if (err) {
        res.status(500).send({ message: "Error Encrypting The Password." });
      } else {
        userData.password = hash;
      }
    });
  }

  User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
    if (err) {
      res.status(500).send({ message: "Server Error!." });
    } else {
      if (!userUpdate) {
        res.status(404).send({ message: "User Not Found." });
      } else {
        res.status(200).send({ message: "User updated Successfully!!." });
      }
    }
  });
}

function activateUser(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  User.findByIdAndUpdate(id, { active }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Server Error." });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "User Not Found." });
      } else {
        if (active === true) {
          res.status(200).send({ message: "User Activated Successfully!." });
        } else {
          res.status(200).send({ message: "User Deactivated Successfully!." });
        }
      }
    }
  });
}

function deleteUser(req, res) {
  const { id } = req.params;

  User.findByIdAndRemove(id, (err, userDeleted) => {
    if (err) {
      res.status(500).send({ message: "Server Error" });
    } else {
      if (!userDeleted) {
        res.status(404).send({ message: "User not Found." });
      } else {
        res.status(200).send({ message: "User Deleted!." });
      }
    }
  });
}

function signUpAdmin(req, res) {
  const user = new User();

  const { name, lastname, email, role, password } = req.body;
  user.name = name;
  user.lastname = lastname;
  user.email = email.toLowerCase();
  user.role = role;
  user.active = true;

  if (!password) {
    res.status(500).send({ message: "The Password Is Mandatory. " });
  } else {
    bcrypt.hash(password, null, null, (err, hash) => {
      if (err) {
        res.status(500).send({ message: "Error Encrypting The Password." });
      } else {
        user.password = hash;

        user.save((err, userStored) => {
          if (err) {
            res.status(500).send({ message: "The User Exist Already!." });
          } else {
            if (!userStored) {
              res.status(500).send({ message: "Error Creating User!." });
            } else {
              // res.status(200).send({ user: userStored });
              res.status(200).send({ message: "User Created Successfully!." });
            }
          }
        });
      }
    });
  }
}
module.exports = {
  signUp,
  signIn,
  getUsers,
  getUsersActive,
  uploadAvatar,
  getAvatar,
  updateUser,
  activateUser,
  deleteUser,
  signUpAdmin,
};
