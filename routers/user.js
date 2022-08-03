const express = require("express");
const UserController = require("../controllers/user");

const api = express.Router();

api.post("/sign-up", UserController.signUp); //when this route happens is going to execute the usercontroller signup

module.exports = api;
