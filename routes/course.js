const express = require("express");
const router = express.Router();
const Course = require("../models/course");

const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,

  createChapter,
  getChapter,
  updateChapter,
  deleteChapter,

  createSubTopic,
  getSubTopic,
  updateSubTopic,
  deleteSubTopic,

  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/courseControllers");

// Update routes to be consistent with frontend
router.route("/create-course").post(createCourse);
router.route("/courses").get(getAllCourses);
router.route("/courses/:courseId")
  .get(async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found"
        });
      }
      
      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching course",
        error: error.message
      });
    }
  })
  .put(updateCourse)
  .delete(deleteCourse);

router.route("/course/:courseId/create-chapter").post(createChapter);
router
  .route("/chapter/:chapterId")
  .get(getChapter)
  .put(updateChapter)
  .delete(deleteChapter);

router.route("/chapter/:chapterId/create-subtopic").post(createSubTopic);
router
  .route("/subtopic/:subTopicId")
  .get(getSubTopic)
  .put(updateSubTopic)
  .delete(deleteSubTopic);

router.route("/chapter/:chapterId/create-quiz").post(createQuiz);
router.route("/quiz/:quizId").get(getQuiz).put(updateQuiz).delete(deleteQuiz);

module.exports = router;
