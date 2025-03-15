import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Chat from "./components/Chat";
import Profile from "./components/Profile";
import Contacts from "./components/Contacts";
import PrivateRoute from "./utils/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
