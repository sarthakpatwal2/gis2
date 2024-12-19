import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";



function Signin({ onLogin }) {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json(); // Parse response JSON
        const decodedToken = jwtDecode(data.token); // Decode the JWT token
        const userId = decodedToken.userId; // Extract userId from token
  
        if (userId) {
          localStorage.setItem("user_id", userId); // Store user_id
          localStorage.setItem("token", data.token); // Store token
          alert("Signin successful!");
          onLogin(); // Notify parent about login success
        } else {
          alert("User ID missing in token. Please contact support.");
        }
      } else {
        alert("Signin failed! Invalid credentials.");
      }
    } catch (err) {
      console.error("Error during signin:", err);
      alert("An error occurred during signin.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Signin</h2>
      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      <button type="submit">Signin</button>
    </form>
  );
}

export default Signin;

  