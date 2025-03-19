import axios from "axios";

const API_URL = "/api/messages/";

// Fetch all messages between current user and contactId
const getMessagesBetweenUsers = async (contactId) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL + contactId, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { messages: [...] }
};

const clearChat = async (contactId) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${API_URL}clear/${contactId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // e.g. { message: "Chat cleared successfully" }
};


export default { getMessagesBetweenUsers, clearChat};
