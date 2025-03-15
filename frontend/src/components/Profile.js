// src/components/Profile.js
import React, { useState, useEffect } from "react";
import authService from "../services/authService";

function Profile() {
  const [profile, setProfile] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await authService.getUserInfo();
        // If the backend returns `color`, ignore it here
        const { email, firstName, lastName } = data;
        setProfile({ email, firstName, lastName });
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If your backend expects color, it won’t be sent here
      const updated = await authService.updateProfile(profile);
      setProfile({
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName
      });
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Failed to update profile");
    }
  };

  return (
    <div>
      <h2>Your Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: {profile.email}</label>
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName || ""}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;
