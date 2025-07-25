const express = require('express');
const router = express.Router();

// Import required controllers

// course controllers 
const {
    createCourse,
    getCourseDetails,
    getAllCourses,
    getFullCourseDetails,
    editCourse,
    deleteCourse,
    getInstructorCourses,

} = require('../controllers/course')

const { updateCourseProgress } = require('../controllers/courseProgress')

// categories Controllers
const {
    createCategory,
    showAllCategories,
    getCategoryPageDetails,
} = require('../controllers/category');


// sections controllers
const {
    createSection,
    updateSection,
    deleteSection,
} = require('../controllers/section');


// subSections controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/subSection');


// rating controllers
const {
    createRating,
    getAverageRating,
    getAllRatingReview
} = require('../controllers/ratingAndReview');


// Middlewares
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth')


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
// Courses can Only be Created by Instructors

router.post('/createCourse', auth, isInstructor, createCourse);

//Add a Section to a Course
router.post('/addSection', auth, isInstructor, createSection);
// Update a Section
router.post('/updateSection', auth, isInstructor, updateSection);
// Delete a Section
router.post('/deleteSection', auth, isInstructor, deleteSection);

// Add a Sub Section to a Section
router.post('/addSubSection', auth, isInstructor, createSubSection);
// Edit Sub Section
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);


// Get Details for a Specific Courses
router.post('/getCourseDetails', getCourseDetails);
// Get all Courses
router.get('/getAllCourses', getAllCourses);
// get full course details
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)


// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)

// Delete a Course
router.delete("/deleteCourse", auth, isInstructor, deleteCourse)

// update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)



// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin

router.post('/createCategory', createCategory);
router.get('/showAllCategories', showAllCategories);
router.post("/getCategoryPageDetails", getCategoryPageDetails)




// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRatingReview);

// POST /api/v1/course/enroll
exports.enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id
    const { coursesId } = req.body

    const course = await Course.findById(coursesId[0])
    if (!course) return res.status(404).json({ success: false, message: "Course not found" })

    if (course.studentsEnrolled.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already enrolled" })
    }

    course.studentsEnrolled.push(userId)
    await course.save()

    // Add to user's enrolled list too
    await User.findByIdAndUpdate(userId, { $push: { courses: course._id } })

    return res.status(200).json({
      success: true,
      message: "Enrolled successfully"
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

module.exports = router;