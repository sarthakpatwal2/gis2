import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate, // <-- Add this line to import Navigate
} from "react-router-dom";
import MapPage from "./components/Mappage";
import Signup from "./components/Signup";
import Signin from "./components/Signin";

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if the user is authenticated on component mount (on page refresh)
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true"); // Store authentication status
    navigate("/"); // Redirect to the map page
  };

  return (
    
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <MapPage /> : <Navigate to="/signin" replace />
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/signin"
          element={<Signin onLogin={handleLogin} />}
        />
      </Routes>
   
  );
}

export default MainApp;
