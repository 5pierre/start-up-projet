import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllAnnonces, 
  getSingleAnnonce, 
  updateExistingAnnonce, 
  deleteExistingAnnonce
} from '../services/annonceService';

export default function TestAnnonce() {
  const navigate = useNavigate();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);

  // Pour tester les autres routes
  const [testId, setTestId] = useState('');
  const [updateTitre, setUpdateTitre] = useState('');
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ getAllAnnonces() retourne déjà response.data
        const data = await getAllAnnonces();
        console.log('Data reçue:', data); // Pour déboguer
        setAnnonces(data.annonces || []);
      } catch (e) {
        console.error('Erreur lors du chargement des annonces :', e);
        setError("Impossible de charger les annonces.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Liste des annonces</h1>
        <p>Chargement des annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Liste des annonces</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const handleGetById = async () => {
    try {
      // ✅ getSingleAnnonce retourne déjà response.data
      const res = await getSingleAnnonce(testId);
      setRawResponse(res);
    } catch (e) {
      setRawResponse({ error: e.message });
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await updateExistingAnnonce(testId, { titre: updateTitre });
      setRawResponse(res);
    } catch (e) {
      setRawResponse({ error: e.message });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteExistingAnnonce(testId);
      setRawResponse(res);
    } catch (e) {
      setRawResponse({ error: e.message });
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Test service annonce</h1>

      <h2>GET /annonces</h2>
      {annonces.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <ul>
          {annonces.map((a, index) => {
              // 1. On ouvre les accolades pour calculer la variable
              const isMyAnnonce = currentUserId === a.id_user;

              // 2. IL FAUT AJOUTER "return" ICI
              return (
                <li key={a.id || index}>
                  <strong>{a.titre || "Sans titre"}</strong>
                  {a.prix && ` - ${a.prix}€`}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    
                    {!isMyAnnonce && currentUserId ? (
                      <button
                        onClick={() => navigate(`/messages/${a.id_user}`)}
                        className="login100-form-btn"
                        style={{ 
                          width: 'auto', 
                          minWidth: '120px', 
                          backgroundColor: '#28a745', 
                          height: '40px', 
                          cursor: 'pointer',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '0 15px'
                        }}
                      >
                        Contacter le vendeur
                      </button>
                  ) : (null)}
                </div>
              </li>
            ); // Fin du return
          })}
        </ul>
      )}

      <hr />

      <h2>Tests ciblés sur une annonce (GET / PUT / DELETE)</h2>
      <div style={{ marginBottom: "10px" }}>
        <label>ID de l'annonce : </label>
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          style={{ marginRight: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleGetById} style={{ marginRight: "10px" }}>
          Tester GET /annonces/:id
        </button>
        <button onClick={handleDelete} style={{ marginRight: "10px" }}>
          Tester DELETE /annonces/:id
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Nouveau titre (pour PUT) : </label>
        <input
          type="text"
          value={updateTitre}
          onChange={(e) => setUpdateTitre(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleUpdate}>
          Tester PUT /annonces/:id
        </button>
      </div>

      <h3>Réponse brute du dernier appel</h3>
      <pre style={{ background: "#f5f5f5", padding: "10px" }}>
        {rawResponse ? JSON.stringify(rawResponse, null, 2) : "Aucun appel effectué pour l'instant."}
      </pre>

      <button onClick={() => navigate('/create')}>
        Créer une nouvelle annonce
      </button>
    </div>
  );
}