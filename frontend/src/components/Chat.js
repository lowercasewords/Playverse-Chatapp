// File: frontend/src/components/Chat.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import contactService from "../services/contactService";
import messageService from "../services/messageService";

const socket = io("http://localhost:5173");

function Chat() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Retrieve current user ID from localStorage (set during login)
  const currentUserId = localStorage.getItem("userId");

  // [15] Emit userConnected event on component mount
  useEffect(() => {
    if (!currentUserId) {
      console.error("No userId found in localStorage.");
      return;
    }
    socket.emit("userConnected", currentUserId);
    console.log(`Emitted userConnected for user: ${currentUserId}`);
  }, [currentUserId]);

  // [23] Fetch contacts from the backend
  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await contactService.getContacts();
        console.log("Fetched contacts:", data);
        setContacts(data.contacts || data);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    }
    fetchContacts();
  }, []);

  // [33] Listen for incoming real-time messages
  useEffect(() => {
    socket.on("receiveMessage", (messageData) => {
      console.log("Received message:", messageData);
      setMessages((prevMessages) => {
        if (prevMessages.find((m) => m.id === messageData.id)) {
          return prevMessages;
        }
        // Only add the message if it is related to the currently selected contact
        if (
          messageData.sender.id === selectedContact?._id ||
          messageData.receiver.id === selectedContact?._id
        ) {
          return [...prevMessages, messageData];
        }
        return prevMessages;
      });
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedContact]);

  // [47] When a user selects a contact, fetch past messages
  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const { messages: oldMessages } = await messageService.getMessagesBetweenUsers(contact._id);
      // Transform messages into the expected structure
      const transformed = oldMessages.map((msg) => ({
        id: msg._id,
        sender: { id: msg.sender },
        receiver: { id: msg.receiver },
        content: msg.content,
        timestamp: msg.createdAt,
      }));
      setMessages(transformed);
      console.log("Loaded past messages:", transformed);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setMessages([]);
    }
  };

  // [63] Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    if (!currentUserId) {
      console.error("Cannot send message: current user ID is missing.");
      return;
    }
    const sender = currentUserId;
    const receiver = selectedContact._id;
    console.log("Sending message:", { sender, receiver, content: newMessage });
    socket.emit("sendMessage", { sender, receiver, content: newMessage });
    setNewMessage("");
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Contacts List */}
      <div style={{ width: "200px", marginRight: "20px" }}>
        <h3>Contacts</h3>
        {contacts.map((contact) => (
          <div
            key={contact._id}
            style={{
              cursor: "pointer",
              margin: "5px 0",
              fontWeight: selectedContact?._id === contact._id ? "bold" : "normal",
            }}
            onClick={() => handleSelectContact(contact)}
          >
            {contact.email}
          </div>
        ))}
      </div>
      {/* Chat Area */}
      <div style={{ flex: 1 }}>
        <h2>Direct Messages</h2>
        {selectedContact ? (
          <>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                height: "300px",
                overflowY: "scroll",
              }}
            >
              {messages.map((msg, index) => {
                // [80] Determine sender's display name: "Me" if the current user sent it; otherwise use the sender's email from contacts.
                let senderName = "Me";
                if (msg.sender.id === currentUserId) {
                  senderName = "Me";
                } else {
                  const userContact = contacts.find((c) => c._id === msg.sender.id);
                  senderName = userContact ? userContact.email : msg.sender.id;
                }
                return (
                  <div key={index}>
                    <strong>{senderName}:</strong> {msg.content}
                  </div>
                );
              })}
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
