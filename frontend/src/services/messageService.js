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

export default { getMessagesBetweenUsers };
