// src/components/Chat.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import contactService from "../services/contactService"; // Where you fetch contacts

// Adjust the URL/port to match your backend
const socket = io("http://localhost:5173");

function Chat() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // 1. Fetch your list of contacts (or all users if you prefer)
    async function fetchContacts() {
      try {
        const data = await contactService.getContacts();
        // Adjust this if your backend returns data differently
        setContacts(data.contacts || data);
      } catch (err) {
        console.error("Error fetching contacts", err);
      }
    }
    fetchContacts();
  }, []);

  useEffect(() => {
    // 2. Listen for incoming messages
    socket.on("receiveMessage", (messageData) => {
      // If the message is for the currently selected contact (or from them), add it to the conversation
      if (
        (messageData.sender.id === selectedContact?._id ||
          messageData.recipient.id === selectedContact?._id)
      ) {
        setMessages((prev) => [...prev, messageData]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedContact]);

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setMessages([]);
    // Optionally fetch existing messages between currentUser and this contact
    // e.g., using an HTTP endpoint: GET /api/messages/:contactId
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    // Example: replace "currentUserId" with your real user ID from auth
    const sender = "currentUserId";
    const recipient = selectedContact._id;

    socket.emit("sendMessage", { sender, recipient, content: newMessage });
    setNewMessage("");
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Left side: contact list */}
      <div style={{ width: "200px", marginRight: "20px" }}>
        <h3>Contacts</h3>
        {contacts.map((contact) => (
          <div
            key={contact._id}
            style={{
              cursor: "pointer",
              margin: "5px 0",
              fontWeight: selectedContact?._id === contact._id ? "bold" : "normal"
            }}
            onClick={() => handleSelectContact(contact)}
          >
            {contact.email}
          </div>
        ))}
      </div>

      {/* Right side: direct messages */}
      <div style={{ flex: 1 }}>
        <h2>Direct Messages</h2>
        {selectedContact ? (
          <>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                height: "300px",
                overflowY: "scroll"
              }}
            >
              {messages.map((msg, index) => (
                <div key={index}>
                  <strong>{msg.sender?.id}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ width: "70%" }}
              />
              <button type="submit" style={{ marginLeft: "5px" }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <p>Select a contact to start messaging</p>
        )}
      </div>
    </div>
  );
}

export default Chat;
