import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/RegisterStyle.css';
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
    const BASE_URL_AUTH = process.env.REACT_APP_API_AUTH_URL || 'http://localhost:4000'; // L'URL clean

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
    }, []);

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


    const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    navigate('/register');
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      navigate('/register');
    }
  };

useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);

    fetchUsers();
}, []);


    return (
        <>
            <Navbar onProfileClick={() => setShowProfile(true)} />
            {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
            <div className="container-login100">
            <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <h1 className="login100-form-title">Page Admin</h1>
                <p style={{ color: '#171710', marginBottom: '20px' }}>Bienvenue sur la page d&apos;administration.</p>
                {message && (
                    <div style={{ 
                        backgroundColor: message.startsWith('Erreur') ? '#fdeaea' : '#e6f6ec',
                        color: message.startsWith('Erreur') ? '#b91c1c' : '#256b3f',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: message.startsWith('Erreur') ? '1px solid #f5a1a1' : '1px solid #8fd0aa'
                    }}>
                        {message}
                    </div>
                )}

                {loading && <p style={{ color: '#171710' }}>Chargement des utilisateurs...</p>}
                {error && (
                    <div style={{ 
                        backgroundColor: '#fdeaea',
                        color: '#b91c1c',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #f5a1a1'
                    }}>
                        Erreur: {error}
                    </div>
                )}
                {!loading && !error && (
                    <div style={{ marginTop: '20px', width: '100%' }}>
                        <h2 style={{ 
                            fontFamily: 'Montserrat-Bold, Poppins-Bold, sans-serif',
                            color: '#171710',
                            marginBottom: '20px'
                        }}>
                            Liste des utilisateurs ({users.length})
                        </h2>
                        <div style={{ 
                            overflowX: 'auto',
                            backgroundColor: '#ffffff',
                            borderRadius: '10px',
                            border: '1px solid #E2E2E2',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F0EEE8' }}>
                                        <th style={{ 
                                            padding: '12px', 
                                            borderBottom: '2px solid #E2E2E2',
                                            textAlign: 'left',
                                            fontFamily: 'Montserrat-Bold, sans-serif',
                                            color: '#171710'
                                        }}>
                                            ID
                                        </th>
                                        <th style={{ 
                                            padding: '12px', 
                                            borderBottom: '2px solid #E2E2E2',
                                            textAlign: 'left',
                                            fontFamily: 'Montserrat-Bold, sans-serif',
                                            color: '#171710'
                                        }}>
                                            Nom
                                        </th>
                                        <th style={{ 
                                            padding: '12px', 
                                            borderBottom: '2px solid #E2E2E2',
                                            textAlign: 'left',
                                            fontFamily: 'Montserrat-Bold, sans-serif',
                                            color: '#171710'
                                        }}>
                                            Email
                                        </th>
                                        <th style={{ 
                                            padding: '12px', 
                                            borderBottom: '2px solid #E2E2E2',
                                            textAlign: 'left',
                                            fontFamily: 'Montserrat-Bold, sans-serif',
                                            color: '#171710'
                                        }}>
                                            Rôle
                                        </th>
                                        <th style={{ 
                                            padding: '12px', 
                                            borderBottom: '2px solid #E2E2E2',
                                            textAlign: 'center',
                                            fontFamily: 'Montserrat-Bold, sans-serif',
                                            color: '#171710'
                                        }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id_user} style={{ borderBottom: '1px solid #E2E2E2' }}>
                                            <td style={{ 
                                                padding: '12px',
                                                color: '#171710',
                                                fontFamily: 'Poppins-Regular, sans-serif'
                                            }}>
                                                {user.id_user}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                color: '#171710',
                                                fontFamily: 'Poppins-Regular, sans-serif'
                                            }}>
                                                {user.name}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                color: '#171710',
                                                fontFamily: 'Poppins-Regular, sans-serif'
                                            }}>
                                                {user.email}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                color: '#171710',
                                                fontFamily: 'Poppins-Regular, sans-serif'
                                            }}>
                                                {user.role}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                textAlign: 'center'
                                            }}>
                                                {user.role === 'admin' ? (
                                                    <span style={{ 
                                                        color: '#666',
                                                        fontFamily: 'Poppins-Regular, sans-serif'
                                                    }}>
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDelete(user.id_user, user.name)}
                                                        className="delete-btn"
                                                        style={{ 
                                                            backgroundColor: '#d60000', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            padding: '6px 14px', 
                                                            borderRadius: '20px', 
                                                            cursor: 'pointer',
                                                            fontFamily: 'Poppins-Medium, sans-serif',
                                                            fontSize: '14px',
                                                            transition: 'background-color 0.3s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#cc0000';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#d60000';
                                                        }}
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
                    <p style={{ color: '#666', marginTop: '20px' }}>Aucun utilisateur trouvé.</p>
                )}
            </div>
            <Footer />
        </div>
        </>
    );
}