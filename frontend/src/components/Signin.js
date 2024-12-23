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
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          fontSize: "24px",
          color: "#333",
          textAlign: "center",
        }}
      >
        Signin
      </h2>
      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          fontSize: "16px",
          boxSizing: "border-box",
        }}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          fontSize: "16px",
          boxSizing: "border-box",
        }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px 15px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
      >
        Signin
      </button>
    </form>
  );
  
}

export default Signin;

  