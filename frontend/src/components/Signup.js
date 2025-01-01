import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      localStorage.setItem("isAuthenticated", "true"); // Save auth status
      navigate("/");
      
    } else {
      alert("Signup failed!");
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
        animation: "fadeIn 0.5s ease-in-out",
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
        Signup
      </h2>
      <input
        name="name"
        placeholder="Name"
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
        name="email"
        placeholder="Email"
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
        Signup
      </button>
    </form>
  );
  
  
}

export default Signup;
