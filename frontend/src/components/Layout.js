// src/components/Layout.js
import React from "react";
import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar / Nav */}
      <nav style={{ width: "200px", background: "#f0f0f0", padding: "20px" }}>
        <h3>Menu</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/contacts">Contacts</Link>
          </li>
          <li>
            <Link to="/chat">Chat</Link>
          </li>
          <li>
            <Link to="/login">Logout</Link> 
            {/* Or call a logout function, then navigate */}
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
