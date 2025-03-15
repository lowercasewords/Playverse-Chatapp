import React, { useState, useEffect } from "react";
import authService from "../services/authService";

function Profile() {
  const [profile, setProfile] = useState({
    email: "",
    firstName: "",
    lastName: "",
    color: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await authService.getUserInfo();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await authService.updateProfile(profile);
      setProfile(updated);
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
        <div>
          <label>Favorite Color:</label>
          <input
            type="text"
            name="color"
            value={profile.color || ""}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;
