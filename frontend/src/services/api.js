import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const rankCandidates = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/rank", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};