import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { HiOutlineCurrencyRupee } from "react-icons/hi"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI"

import { setCourse, setStep } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import ChipInput from "./ChipInput"
import RequirementsField from "./RequirementField"

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { course, editCourse } = useSelector((state) => state.course)

  const [loading, setLoading] = useState(false)
  const [courseCategories, setCourseCategories] = useState([])

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      const categories = await fetchCourseCategories()
      if (categories.length > 0) setCourseCategories(categories)
      setLoading(false)
    }

    getCategories()

    if (editCourse) {
      setValue("courseTitle", course.courseName)
      setValue("courseShortDesc", course.courseDescription)
      setValue("coursePrice", course.price)
      setValue("courseTags", course.tag || [])
      setValue("courseBenefits", course.whatYouWillLearn)
      setValue("courseCategory", course.category?._id || course.category)
      setValue("courseRequirements", course.instructions || [])
    }
  }, [])

  const isFormUpdated = () => {
    const currentValues = getValues()
    return (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      JSON.stringify(currentValues.courseTags) !== JSON.stringify(course.tag) ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory !== (course.category?._id || course.category) ||
      JSON.stringify(currentValues.courseRequirements) !== JSON.stringify(course.instructions)
    )
  }

  const onSubmit = async (data) => {
    setLoading(true)

    const formData = new FormData()
    formData.append("courseName", data.courseTitle)
    formData.append("courseDescription", data.courseShortDesc)
    formData.append("price", data.coursePrice)
    formData.append("category", data.courseCategory)
    formData.append("tag", JSON.stringify(data.courseTags))
    formData.append("instructions", JSON.stringify(data.courseRequirements))
    formData.append("whatYouWillLearn", data.courseBenefits)
    formData.append("thumbnail", data.courseImage)

    let result = null

    if (editCourse) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
        setLoading(false)
        return
      }

      formData.append("courseId", course._id)
      result = await editCourseDetails(formData, token)
    } else {
      result = await addCourseDetails(formData, token)
    }

    setLoading(false)

    if (result) {
      dispatch(setCourse(result))
      dispatch(setStep(2))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 border p-6 rounded-md bg-richblack-800 border-richblack-700"
    >
      {/* Title */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="courseTitle" className="text-sm text-richblack-5">Course Title</label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full"
        />
        {errors.courseTitle && (
          <span className="text-xs text-pink-200">Course title is required</span>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="courseShortDesc" className="text-sm text-richblack-5">Course Short Description</label>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Description"
          {...register("courseShortDesc", { required: true })}
          className="form-style min-h-[130px] resize-none"
        />
        {errors.courseShortDesc && (
          <span className="text-xs text-pink-200">Course description is required</span>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="coursePrice" className="text-sm text-richblack-5">Course Price</label>
        <div className="relative">
          <input
            id="coursePrice"
            type="number"
            placeholder="Enter Price"
            {...register("coursePrice", { required: true, valueAsNumber: true })}
            className="form-style pl-10 w-full"
          />
          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-richblack-400" />
        </div>
        {errors.coursePrice && (
          <span className="text-xs text-pink-200">Course price is required</span>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="courseCategory" className="text-sm text-richblack-5">Course Category</label>
        <select
          {...register("courseCategory", { required: true })}
          id="courseCategory"
          className="form-style w-full cursor-pointer"
        >
          <option value="">Choose a Category</option>
          {courseCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.courseCategory && (
          <span className="text-xs text-pink-200">Course category is required</span>
        )}
      </div>

      {/* Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter tags and press Enter or Comma"
        register={register}
        setValue={setValue}
      />

      {/* Thumbnail (File Upload) */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="courseImage" className="text-sm text-richblack-5">
          Course Thumbnail <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseImage"
          type="file"
          accept="image/*"
          onChange={(e) => setValue("courseImage", e.target.files[0])}
          className="form-style w-full cursor-pointer"
        />
        {getValues("courseImage") && (
          <img
            src={URL.createObjectURL(getValues("courseImage"))}
            alt="Course Thumbnail Preview"
            className="mt-2 h-40 w-full object-cover rounded-md"
          />
        )}
        {errors.courseImage && (
          <span className="text-xs text-pink-200">Course image is required</span>
        )}
      </div>

      {/* Benefits */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="courseBenefits" className="text-sm text-richblack-5">Benefits of the course</label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits"
          {...register("courseBenefits", { required: true })}
          className="form-style min-h-[130px] resize-none"
        />
        {errors.courseBenefits && (
          <span className="text-xs text-pink-200">Course benefits are required</span>
        )}
      </div>

      {/* Requirements */}
      <RequirementsField
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        setValue={setValue}
      />

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        {editCourse && (
          <button
            type="button"
            onClick={() => dispatch(setStep(2))}
            className="rounded-md bg-richblack-300 px-4 py-2 font-semibold text-richblack-900 hover:bg-richblack-900 hover:text-richblack-300"
          >
            Continue Without Saving
          </button>
        )}
        <IconBtn disabled={loading} text={editCourse ? "Save Changes" : "Next"}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}
