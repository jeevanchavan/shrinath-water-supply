import axios from "axios";

const instance = axios.create({ baseURL: "/api", timeout: 15000 });

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("swd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status;
    const message = err.response?.data?.message || "Something went wrong";
    if (status === 401) {
      localStorage.removeItem("swd_token");
      localStorage.removeItem("swd_user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject({ message, status });
  }
);

export default instance;
