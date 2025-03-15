import React, { useState, useEffect } from "react";
import contactService from "../services/contactService";

function Contacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await contactService.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts", error);
      }
    }
    fetchContacts();
  }, []);

  return (
    <div>
      <h2>Your Contacts</h2>
      {contacts.length === 0 ? (
        <p>No contacts available.</p>
      ) : (
        <ul>
          {contacts.map((contact) => (
            <li key={contact.id}>
              {contact.name} - {contact.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Contacts;
