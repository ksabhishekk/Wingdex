import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.17:5000";

export const uploadSighting = async (uri, userId) => {
  const formData = new FormData();

  formData.append("image", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  });

  // UserID is now inferred via token backend-side, but appending it just in case
  formData.append("userId", userId);

  const token = await AsyncStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/sightings`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
    }
  );

  return res.data;
};