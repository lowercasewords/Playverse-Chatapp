// frontend/src/components/Chat.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// Connect to your Socket.io server.
const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("message");
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    const messageData = {
      text: newMessage,
      // Optionally include user info here.
    };
    socket.emit("chatMessage", messageData);
    setNewMessage("");
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Chat Room</h3>
      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll", padding: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user?.firstName || "User"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          required
          style={{ width: "80%", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px", marginLeft: "5px" }}>Send</button>
      </form>
    </div>
  );
}

export default Chat;

