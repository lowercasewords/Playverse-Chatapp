import axios from "axios";

const API_URL = "/api/contacts/";

// Fetch all contacts
const getContacts = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Add a new contact by email
const addContact = async (contactData) => {
  // contactData should be an object like { email: "contact@example.com" }
  const token = localStorage.getItem("token");
  const res = await axios.post(API_URL, contactData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default { getContacts, addContact };
