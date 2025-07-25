import axios from "axios"

export const axiosInstance = axios.create({})

export const apiConnector = (method, url, bodyData, headers = {}, params = {}) => {
  const config = {
    method,
    url,
    data: bodyData,
    headers: {
      ...headers,
      ...(bodyData instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    params,
  }

  return axiosInstance(config)
}
