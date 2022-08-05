const express = require("express");
const UserController = require("../controllers/user");
const md_auth = require("../middleware/authenticated");

const api = express.Router();

api.post("/sign-up", UserController.signUp); //when this route happens is going to execute the usercontroller signup
api.post("/sign-in", UserController.signIn); // to execute the signIn from the controllers
api.get("/users", [md_auth.ensureAuth], UserController.getUsers);
api.get("/users-active", [md_auth.ensureAuth], UserController.getUsersActive);

module.exports = api;
