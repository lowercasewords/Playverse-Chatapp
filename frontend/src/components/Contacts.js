import React, { useState, useEffect } from "react";
import contactService from "../services/contactService";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [newContactEmail, setNewContactEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const data = await contactService.getContacts();
      console.log("Fetched contacts:", data);
     
      setContacts(data.contacts || data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts");
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await contactService.addContact({ email: newContactEmail });
      setNewContactEmail("");
      fetchContacts();
    } catch (err) {
      console.error("Error adding contact:", err);
      setError("Failed to add contact");
    }
  };

  return (
    <div>
      <h2>Your Contacts</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleAddContact} style={{ marginBottom: "20px" }}>
        <div>
          <label>Contact Email:</label>
          <input
            type="email"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Contact</button>
      </form>
      {contacts.length === 0 ? (
        <p>No contacts available.</p>
      ) : (
        <ul>
          {contacts.map((contact) => (
            <li key={contact._id || contact.id}>
              {contact.email}{" "}
              {/* NEW: Display a green dot if the contact is online */}
              {contact.isOnline && <span style={{ color: "green", fontWeight: "bold" }}>●</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Contacts;
