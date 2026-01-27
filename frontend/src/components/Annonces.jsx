import React, { useEffect, useState } from 'react';
import { 
  getAllAnnonces, 
  getSingleAnnonce, 
  updateExistingAnnonce, 
  deleteExistingAnnonce 
} from '../services/annonceService';

export default function TestAnnonce() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pour tester les autres routes
  const [testId, setTestId] = useState('');
  const [updateTitre, setUpdateTitre] = useState('');
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllAnnonces();
        const data = response.data;
        setAnnonces(data.annonces || data || []);
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
      const res = await getSingleAnnonce(testId);
      setRawResponse(res.data);
    } catch (e) {
      setRawResponse({ error: e.message });
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await updateExistingAnnonce(testId, { titre: updateTitre });
      setRawResponse(res.data);
    } catch (e) {
      setRawResponse({ error: e.message });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteExistingAnnonce(testId);
      setRawResponse(res.data);
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
          {annonces.map((a, index) => (
            <li key={a.id || index}>
              <strong>{a.titre || "Sans titre"}</strong>
              {a.prix && ` - ${a.prix}€`}
            </li>
          ))}
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
    </div>
  );
}