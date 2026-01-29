import React, { useEffect } from 'react';
import HomePage from './components/HomePage';
import StoryRead from './components/StoryRead';
import RegisterPage from './components/RegisterPage';
import AdminPage from './components/AdminPage';
import MentionsLegales from './components/MentionsLegales';
import MessagingPage from './components/MessagingPage';
import Annonces from './components/Annonces';
import CreateAnnonce from './components/CreateAnnonce';
import UserComments from './components/UserComments';
import Messages from './components/Messages';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getMe } from './services/authService';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'admin') {
    return <Navigate to="/register" replace />;
  }
  return children;
};

const App = () => {

  useEffect(() => {
      const syncSession = async () => {
          if (!localStorage.getItem('userId')) return;
          try {
              const res = await getMe();
              const user = res.data?.user;
              if (user?.id) {
                  localStorage.setItem('userId', user.id);
                  localStorage.setItem('userName', user.name || '');
                  localStorage.setItem('userRole', user.role || 'user');
              }
          } catch (error) {
              localStorage.removeItem('userId');
              localStorage.removeItem('userName');
              localStorage.removeItem('userRole');
          }
      };
      syncSession();
    }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mentionsLegales" element={<MentionsLegales />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/annonces" element={<Annonces />} />
        <Route path="/story" element={<StoryRead />} />
        <Route path="/create" element={<CreateAnnonce />} />
        <Route path="/users/:id/comments" element={<UserComments />} />
        <Route path="/messages" element={<MessagingPage />} />
        <Route path="/messages/:id" element={<Messages />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
