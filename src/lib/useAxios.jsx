import axiosInstance from "./axiosInstance";

const useAxios = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
  return axiosInstance;
};

export default useAxios;
