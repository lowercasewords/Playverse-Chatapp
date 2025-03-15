import axios from "axios";

const API_URL = "/api/messages/";

const getMessages = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

const sendMessage = async (messageData) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(API_URL, messageData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default { getMessages, sendMessage };
