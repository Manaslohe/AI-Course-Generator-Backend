const mongoose = require("mongoose");

const subTopicSchema = new mongoose.Schema({
  name: String,
  content: String,
});

const chapterSchema = new mongoose.Schema({
  name: String,
  subTopics: [subTopicSchema],
  quiz: {
    name: String,
    questions: [
      {
        question: String,
        options: [
          {
            option: String,
            isCorrect: Boolean,
          },
        ],
      },
    ],
  },
});

const courseSchema = new mongoose.Schema({
  courseTitle: String,
  courseImage: String,
  courseDescription: String,
  courseSubtitle: String,
  courseDuration: String,
  courseOutcome: [String],
  courseBenefits: [String],
  courseRequirements: [String],
  courseLanguages: {
    type: [String],
    validate: {
      validator: function (array) {
        return array.every((item) => typeof item === "string");
      },
      message: "Course languages must be an array of strings",
    },
  },
  salaryRange: {
    min: Number,
    max: Number,
  },
  coursePrice: Number,
  courseContent: [
    {
      chapter: chapterSchema,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a pre-save middleware to clean up language data
courseSchema.pre("save", function (next) {
  if (this.courseLanguages) {
    // Handle case where language might be an object with type property
    this.courseLanguages = this.courseLanguages.map((lang) => {
      if (typeof lang === "object" && lang.type) {
        return lang.type;
      }
      return lang;
    });
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
