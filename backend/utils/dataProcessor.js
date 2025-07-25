const processCourseData = (course) => {
  const courseObj = course.toObject();

  // Fix thumbnail image path if it's not an external URL
  if (
    courseObj.thumbnail &&
    typeof courseObj.thumbnail === 'string' &&
    !courseObj.thumbnail.startsWith('http')
  ) {
    if (!courseObj.thumbnail.startsWith('/uploads/')) {
      courseObj.thumbnail = `/uploads/${courseObj.thumbnail}`;
    }
  }

  // Fix instructor image path if it's local (in your case it's already an external URL)
  if (
    courseObj.instructor?.image &&
    typeof courseObj.instructor.image === 'string' &&
    !courseObj.instructor.image.startsWith('http')
  ) {
    if (!courseObj.instructor.image.startsWith('/uploads/')) {
      courseObj.instructor.image = `/uploads/${courseObj.instructor.image}`;
    }
  }

  return courseObj;
};
