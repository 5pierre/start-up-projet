import React, { useEffect } from 'react';
import StoryRead from "./components/StoryRead";
import RegisterPage from "./components/RegisterPage";
import AdminPage from "./components/AdminPage";
import MentionsLegales from "./components/MentionsLegales";
import Messages from "./components/Messages";
import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { logout } from './services/authService';
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole'); //
  if (userRole !== 'admin') {
    return <Navigate to="/register" replace />;
  }
  return children;
};

const App = () => {

  useEffect(() => {
      const autoLogout = async () => {
          try {
              await logout();
          } catch (error) {
              console.error("Erreur lors du logout forcé au démarrage:", error);
          }
      };
      if (localStorage.getItem('userId')) {
          autoLogout();
      }
    }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoryRead />} />
        <Route path="/mentionsLegales" element={<MentionsLegales />}/>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/messages/:id" element={<Messages />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
};

export default App;
