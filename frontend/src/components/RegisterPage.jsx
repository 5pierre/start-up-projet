import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/RegisterStyle.css';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'L\'email est requis';
  if (!emailRegex.test(email)) return 'Format d\'email invalide';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères';

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (typesCount < 3) {
    return 'Le mot de passe doit contenir au moins 3 types parmi : majuscules, minuscules, chiffres, caractères spéciaux';
  }
  return '';
};

const checkPasswordCriteria = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const lengthValid = password.length >= 12;
  
  const typesValid = (
    (hasUpperCase && hasLowerCase && (hasNumber || hasSpecialChar)) ||
    (hasUpperCase && hasNumber && hasSpecialChar) ||
    (hasLowerCase && hasNumber && hasSpecialChar)
  );

  return { lengthValid, typesValid };
};

const handleAuthSuccess = (user, navigate) => {
  localStorage.setItem('userId', user.id);
  localStorage.setItem('userName', user.name);
  localStorage.setItem('userRole', user.role);

  if (user.role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/');
  }
};

const getErrorMessage = (isLoginMode, err) => {
  // Gestion spécifique des erreurs CORS
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.response?.status === 403) {
    return 'Erreur de connexion au serveur. Vérifiez que le backend est démarré et que FRONTEND_ORIGIN dans le .env du backend inclut http://localhost:3001';
  }
  
  if (err.response?.status === 401) {
    return isLoginMode 
      ? 'Identifiants incorrects. Veuillez réessayer.' 
      : 'Erreur lors de l\'inscription. Veuillez réessayer.';
  }
  
  return isLoginMode 
    ? (err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.')
    : (err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
};

export default function RegisterPage(){
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user-non-connecte',
    profileData: '',
    ville: '',
    photo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(null); // 'success' | 'error' | null
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // on réinitialise le formulaire et les messages pour éviter de garder des erreurs de l'autre mode
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'user-non-connecte',
      profileData: '',
      ville: '',
      photo: null
    });
    setErrors({});
    setStatusMessage('');
    setStatusType(null);
    setShowPassword(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setForm((prev) => ({ ...prev, photo: file }));
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(form.password);
    if (passwordError) newErrors.password = passwordError;

    if (!isLoginMode) {
      // pour l'inscription on exige un nom renseigné
      if (!form.name.trim()) {
        newErrors.name = 'Le nom est requis';
      } else if (form.name.trim().length < 3) {
        newErrors.name = 'Le nom doit contenir au moins 3 caractères';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, api: null }));
    setStatusMessage('');
    setStatusType(null);

    const BASE_URL = process.env.REACT_APP_API_AUTH_URL || 'http://localhost:4000';
    const endpoint = isLoginMode ? 'login' : 'register';
    const url = `${BASE_URL}/${endpoint}`;

    try {
      let res;

      if (isLoginMode) {
        // Connexion : envoi JSON classique
        res = await axios.post(
          url,
          {
            email: form.email,
            password: form.password,
          },
          { withCredentials: true }
        );
      } else {
        // Inscription : envoi multipart/form-data pour gérer la photo
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('profileData', form.profileData);
        formData.append('ville', form.ville);
        if (form.photo) {
          formData.append('photo', form.photo);
        }

        res = await axios.post(url, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      if (res.data?.user) {
        setStatusMessage(isLoginMode ? 'Connexion réussie, redirection en cours...' : 'Compte créé avec succès, redirection en cours...');
        setStatusType('success');
        handleAuthSuccess(res.data.user, navigate);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(isLoginMode, err);
      // Log détaillé pour le débogage
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.response?.status === 403) {
        console.error('Erreur CORS/Network détectée:', {
          code: err.code,
          message: err.message,
          status: err.response?.status,
          url: url,
          suggestion: 'Vérifiez que FRONTEND_ORIGIN dans le .env du backend inclut http://localhost:3001'
        });
      } else {
        console.error('Erreur API:', err.response?.data || err.message);
      }

      setErrors((prev) => ({
        ...prev,
        api: errorMessage,
      }));
      setStatusMessage(errorMessage);
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonLabel = () => {
  return isLoginMode ? 'Connexion' : 'Créer un compte';
};

  const passwordCriteria = checkPasswordCriteria(form.password);

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
          <form className="login100-form validate-form" onSubmit={handleSubmit}>
            <span className="login100-form-title">
              {isLoginMode ? 'Connexion' : 'Inscription'}
            </span>

            {!isLoginMode && (
              <>
                <div className="wrap-input100">
                  <input
                    className={`input100 ${errors.name ? 'has-error' : ''}`}
                    type="text"
                    name="name"
                    placeholder="Nom complet"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <span className="focus-input100"></span>
                  {errors.name && (
                    <span className="error-message" style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="wrap-input100">
                  <input
                    className="input100"
                    type="text"
                    name="profileData"
                    placeholder="Profil (bio, entreprise...)"
                    value={form.profileData}
                    onChange={handleChange}
                  />
                  <span className="focus-input100"></span>
                </div>
                <div className="wrap-input100">
                  <input
                    className="input100"
                    type="text"
                    name="ville"
                    placeholder="Ville"
                    value={form.ville}
                    onChange={handleChange}
                  />
                  <span className="focus-input100"></span>
                </div>
                <div className="wrap-input100">
                  <input
                    className="input100"
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <span className="focus-input100"></span>
                </div>
              </>
            )}

            <div className="wrap-input100 validate-input">
              <input
                className={`input100 ${errors.email ? 'has-error' : ''}`}
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <span className="focus-input100"></span>
              <span className="symbol-input100">
                <i className="fa fa-envelope" aria-hidden="true"></i>
              </span>
              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="wrap-input100 validate-input">
              <input
                className={`input100 ${errors.password ? 'has-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span className="focus-input100"></span>
              <span className="symbol-input100">
                <i className="fa fa-lock" aria-hidden="true"></i>
              </span>
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}
            </div>

            {!isLoginMode && (
              <div className="password-criteria">
                <strong>Critères du mot de passe :</strong>
                <ul>
                  <li className={passwordCriteria.lengthValid ? 'valid' : 'invalid'}>
                    Minimum 12 caractères
                  </li>
                  <li className={passwordCriteria.typesValid ? 'valid' : 'invalid'}>
                    Au moins 3 types : majuscules, minuscules, chiffres, spéciaux
                  </li>
                </ul>
              </div>
            )}

            <div className="container-login100-form-btn">
              {statusMessage && (
                <div className={`auth-status ${statusType === 'error' ? 'auth-status-error' : 'auth-status-success'}`}>
                  {statusMessage}
                </div>
              )}
              <button 
                className="login100-form-btn" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (isLoginMode ? 'Connexion en cours...' : 'Création du compte...') : getButtonLabel()}
              </button>
            </div>

            {!isLoginMode && (
              <div className="text-center p-t-12">
                <span className="check">
                  <input 
                      type="checkbox" 
                      name="termsAccepted" 
                      id="termsAccepted"
                      required 
                    />
                    <label htmlFor="termsAccepted" className="txt1" style={{ marginLeft: '8px', cursor: 'pointer' }}>
                        J'accepte que mes données soient utilisées pour la création et la gestion de mon compte, la publication de mes histoires et l'accès aux fonctionnalités de lecture du site.
                    </label>
                </span>
              </div>
            )}

            <div className="text-center p-t-12">
              <span className="txt1">
                {isLoginMode ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
              </span>
              <a className="txt2" href="#toggle" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                {isLoginMode ? 'Créer un compte' : 'Se connecter'}
              </a>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}