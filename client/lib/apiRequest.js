import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true, // Bc we are using cookies
});

export default apiRequest;