import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const { COURSE_VERIFY_API } = studentEndpoints; // Your backend should handle enrollment here

export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Enrolling in course...");

  try {
    dispatch(setPaymentLoading(true));

    // Directly enroll user in the course
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      { coursesId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Successfully enrolled in course!");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart());
  } catch (error) {
    console.log("ENROLLMENT ERROR:", error);
    toast.error(error.response?.data?.message || "Could not enroll in course");
  }

  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}
