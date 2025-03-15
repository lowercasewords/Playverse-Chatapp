import axios from "axios";

const API_URL = "/api/auth/";

const signup = async (data) => {
  const res = await axios.post(API_URL + "signup", data);
  return res.data;
};

const login = async (data) => {
  const res = await axios.post(API_URL + "login", data);
  return res.data.token;
};

const getUserInfo = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL + "userinfo", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

const updateProfile = async (data) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(API_URL + "update-profile", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default { signup, login, getUserInfo, updateProfile };
