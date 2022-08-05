const express = require("express");
const UserController = require("../controllers/user");

const api = express.Router();

api.post("/sign-up", UserController.signUp); //when this route happens is going to execute the usercontroller signup
api.post("/sign-in", UserController.signIn); // to execute the signIn from the controllers

module.exports = api;
