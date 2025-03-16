// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Chat from "./components/Chat";
import Profile from "./components/Profile";
import Contacts from "./components/Contacts";
import PrivateRoute from "./utils/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Routes (wrapped in PrivateRoute) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="profile" element={<Profile />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        {/* Catch-all to redirect to /login or show 404 */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

