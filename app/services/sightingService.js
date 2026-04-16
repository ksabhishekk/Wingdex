import axios from "axios";

const API_URL = "http://192.168.1.17:5000";

export const uploadSighting = async (uri, userId) => {
  const formData = new FormData();

  formData.append("image", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  });

  formData.append("userId", userId);

  const res = await axios.post(
    `${API_URL}/sightings`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};