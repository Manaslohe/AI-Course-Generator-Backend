const Course = require("../models/course");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utility/customError");

exports.createCourse = BigPromise(async (req, res, next) => {
  try {
    // Validate required fields
    const { courseTitle, courseDescription } = req.body;

    if (!courseTitle || !courseDescription) {
      return res.status(400).json({
        success: false,
        message: "Course title and description are required",
      });
    }

    // Process courseLanguages to ensure they're strings
    const processedLanguages =
      req.body.courseLanguages?.map((lang) => {
        if (typeof lang === "object" && lang.type) {
          return lang.type;
        }
        return lang;
      }) || [];

    // Create course with validated data
    const course = await Course.create({
      ...req.body,
      courseLanguages: processedLanguages,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    });
  }
});

exports.getAllCourses = BigPromise(async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    next(error);
  }
});

exports.getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error in getCourse:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message,
    });
  }
};

exports.updateCourse = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    course.courseTitle = req.body.courseTitle;
    course.courseImage = req.body.courseImage;
    course.courseDuration = req.body.courseDuration;
    course.courseOutcome = req.body.courseOutcome;
    course.courseBenefits = req.body.courseBenefits;
    course.courseRequirements = req.body.courseRequirements;
    course.salaryRange = req.body.salaryRange;
    course.coursePrice = req.body.coursePrice;
    course.courseContent = req.body.courseContent;

    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.deleteCourse = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    await course.remove();
    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

exports.createChapter = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    course.courseContent.push(req.body);
    const updatedCourse = await course.save();
    res.status(201).json({
      message: "Chapter created successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.getChapter = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }

    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }

    res.status(200).json({
      message: "Chapter fetched successfully",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
});

exports.updateChapter = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    chapter.name = req.body.name;
    chapter.subTopics = req.body.subTopics;
    chapter.quiz = req.body.quiz;
    const updatedCourse = await course.save();
    res.status(200).json({
      message: "Chapter updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.deleteChapter = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    chapter.remove();
    const updatedCourse = await course.save();
    res.status(200).json({
      message: "Chapter deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.createSubTopic = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    chapter.subTopics.push(req.body);
    const updatedCourse = await course.save();
    res.status(201).json({
      message: "Subtopic created successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.getSubTopic = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    const subTopic = chapter.subTopics.id(req.params.subTopicId);
    if (!subTopic) {
      return next(new CustomError("Subtopic not found", 404));
    }

    res.status(200).json({
      message: "Subtopic fetched successfully",
      data: subTopic,
    });
  } catch (error) {
    next(error);
  }
});

exports.updateSubTopic = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    const subTopic = chapter.subTopics.id(req.params.subTopicId);
    if (!subTopic) {
      return next(new CustomError("Subtopic not found", 404));
    }
    subTopic.name = req.body.name;
    subTopic.content = req.body.content;
    subTopic.chapterId = req.body.chapterId;
    const updatedCourse = await course.save();
    res.status(200).json({
      message: "Subtopic updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.deleteSubTopic = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    const subTopic = chapter.subTopics.id(req.params.subTopicId);
    if (!subTopic) {
      return next(new CustomError("Subtopic not found", 404));
    }
    subTopic.remove();
    const updatedCourse = await course.save();
    res.status(200).json({
      message: "Subtopic deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.createQuiz = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    chapter.quiz = req.body;
    const updatedCourse = await course.save();
    res.status(201).json({
      message: "Quiz created successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.getQuiz = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }

    res.status(200).json({
      message: "Quiz fetched successfully",
      data: chapter.quiz,
    });
  } catch (error) {
    next(error);
  }
});

exports.updateQuiz = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    chapter.quiz = req.body;
    const updatedCourse = await course.save();
    res.status(200).json({
      message: "Quiz updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exports.deleteQuiz = BigPromise(async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new CustomError("Course not found", 404));
    }
    const chapter = course.courseContent.id(req.params.chapterId);
    if (!chapter) {
      return next(new CustomError("Chapter not found", 404));
    }
    chapter.quiz = null;
    const updatedCourse = await course.save();
    res.status(200).json({
      message: "Quiz deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});
