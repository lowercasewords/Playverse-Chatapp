import axios from "axios";

const API_URL = "/api/contacts/";

const getContacts = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default { getContacts };
