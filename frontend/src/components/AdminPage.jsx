import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BackButton from './BackButton';
import '../styles/RegisterStyle.css';
import './AdminPage.css';
import { useNavigate } from 'react-router-dom';
import UserProfile from "./UserProfile";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const [message, setMessage] = useState(null); 
    const BASE_URL_AUTH = process.env.REACT_APP_API_AUTH_URL || 'http://localhost:4000';

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL_AUTH}/admin/allusers`, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur : ${errorText}`);
            }

            const data = await response.json();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    }, [BASE_URL_AUTH]);

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur: ${userName} (ID: ${userId})?`)) {
            return;
        }

        setMessage(null); 
        try {
            const response = await fetch(`${BASE_URL_AUTH}/admin/deleteuser/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Échec de la suppression: ${errorText}`);
            }
            
            setMessage(`Utilisateur ${userName} (ID: ${userId}) supprimé avec succès.`);
            fetchUsers(); 
        } catch (err) {
            setMessage(`Erreur lors de la suppression: ${err.message}`);
            console.error('Erreur de suppression:', err);
        }
    };


  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);
    fetchUsers();
  }, [fetchUsers]);


    return (
        <>
            <Navbar onProfileClick={() => setShowProfile(true)} />
            {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
            <div className="container-login100">
            <div className="wrap-login100 admin-wrap">
                <BackButton to="/" />
                <h1 className="login100-form-title">Page Admin</h1>
                <p className="admin-desc">Bienvenue sur la page d&apos;administration.</p>
                {message && (
                    <div className={`admin-message ${message.startsWith('Erreur') ? 'admin-message-error' : 'admin-message-success'}`}>
                        {message}
                    </div>
                )}

                {loading && <p className="admin-loading">Chargement des utilisateurs…</p>}
                {error && (
                    <div className="admin-error">
                        Erreur : {error}
                    </div>
                )}
                {!loading && !error && (
                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            Liste des utilisateurs ({users.length})
                        </h2>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Rôle</th>
                                        <th className="admin-th-actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id_user}>
                                            <td>{user.id_user}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td className="admin-td-actions">
                                                {user.role === 'admin' ? (
                                                    <span className="admin-badge">Admin</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(user.id_user, user.name)}
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {!loading && !error && users.length === 0 && (
                    <p className="admin-empty">Aucun utilisateur trouvé.</p>
                )}
            </div>
            <Footer />
        </div>
        </>
    );
}