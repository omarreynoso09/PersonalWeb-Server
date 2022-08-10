const Course = require("../models/courses");

function addCourse(req, res) {
  const body = req.body;
  const course = new Course(body);
  course.order = 1000;

  course.save((err, courseStored) => {
    if (err) {
      res.status(400).send({ code: 400, message: "Course Already Exist!" });
    } else {
      if (!courseStored) {
        res
          .status(400)
          .send({ code: 400, message: "Couldn't Create The Course Yet!" });
      } else {
        res.status(200).send({ code: 200, message: "Course Created!" });
      }
    }
  });
}

function getCourses(req, res) {
  Course.find()
    .sort({ order: "asc" })
    .exec((err, coursesStored) => {
      if (err) {
        res
          .status(500)
          .send({ code: 500, message: "Server Error, Try Again Later" });
      } else {
        if (!coursesStored) {
          res
            .status(404)
            .send({ code: 404, message: "Couldn't Find Any Course" });
        } else {
          res.status(200).send({ code: 200, courses: coursesStored });
        }
      }
    });
}

function deleteCourse(req, res) {
  const { id } = req.params;

  Course.findByIdAndRemove(id, (err, courseDeleted) => {
    if (err) {
      res
        .status(500)
        .send({ code: 500, message: "Server Error, Try Again Later!" });
    } else {
      if (!courseDeleted) {
        res.status(404).send({ code: 404, message: "Course Not Found" });
      } else {
        res.status(200).send({
          code: 200,
          message: "Course Deleted!",
        });
      }
    }
  });
}

function updateCourse(req, res) {
  const courseData = req.body;
  const id = req.params.id;

  Course.findByIdAndUpdate(id, courseData, (err, courseUpdate) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: "Server Error, Try Again Later",
      });
    } else {
      if (!courseUpdate) {
        res.status(404).send({ code: 404, message: "Course Not Found!" });
      } else {
        res.status(200).send({ code: 200, message: "Course Updated!" });
      }
    }
  });
}

module.exports = {
  addCourse,
  getCourses,
  deleteCourse,
  updateCourse,
};
