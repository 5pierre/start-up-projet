const express = require('express');
const router = express.Router();
const { registerUser, loginUser} = require('../core/auth.services');
const { findUserById, findUserByEmail, getAllUsers, deleteUserById } = require('../data/users');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Key = process.env.JWT_SECRET;

// Création du dossier uploads/avatars s'il n'existe pas
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de Multer pour l'upload de la photo de profil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

const upload = multer({ storage });

// BRUT FORCE PROTECTION (attention blocaqge IP)
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limite: 10 tentative
    message: { error: "Trop de tentatives. Veuillez réessayer dans 10 minutes." },
    standardHeaders: true, 
    legacyHeaders: false, 
});

const verifyToken = (token) => {
    if (!token) throw new Error("Access denied");
    return jwt.verify(token, Key);
};

// Construit une URL complète pour la photo de profil
function buildPhotoUrl(req, photoPath) {
    if (!photoPath) return null;
    // Si c'est déjà une URL absolue, on la renvoie telle quelle
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }
    return `${req.protocol}://${req.get('host')}${photoPath}`;
}

router.post('/register', upload.single('photo'), registerUser);
router.post('/login', loginLimiter, loginUser);

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Strict',
        secure: false // true en prod
    });
    res.status(200).json({ message: "Déconnecté" });
});

// Vérifie la session (cookie JWT) sans déconnecter
router.get('/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
        const decoded = verifyToken(token);
        const user = await findUserByEmail(decoded.email);
        if (!user) return res.status(401).json({ error: "Not authenticated" });
        return res.status(200).json({
            user: {
                id: user.id_user,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(401).json({ error: "Not authenticated" });
    }
});


// Admin Command (Protected)

router.get('/admin/allusers', async (req, res) => {
    const token= req.cookies.token;
    if (!token) return res.status(403).send("Access denied");
    try {
        const decoded = verifyToken(token);
        const userrole = await findUserByEmail(decoded.email)

    if (decoded.role === 'admin' && userrole.role === 'admin') {
        const users = await getAllUsers();
        res.status(200).json(users);
    } else {
        res.status(403).send("invalid credentials"); 
    }
    }catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});

//admin delet user byid 
router.delete('/admin/deleteuser/:id', async (req, res) => {
    const token= req.cookies.token;
    if (!token) return res.status(403).send("Access denied");

    try {
        const decoded = verifyToken(token);
        const reqInfo = await findUserByEmail(decoded.email);
        if (decoded.role !== 'admin' && reqInfo.role !== 'admin') {
            return res.status(403).send("invalid credentials"); 
        }
        const idToDelete = Number.parseInt(req.params.id);
        if (!idToDelete) {
            return res.status(400).send("Invalid ID");
        }
        const userToDelete = await findUserById(idToDelete);
        if (!userToDelete) {
            return res.status(404).send("User not found");
        }
        if (userToDelete.role === 'admin') {
            return res.status(403).send("Cannot delete another admin");  
        }
        await deleteUserById(idToDelete);
        res.status(200).json("User deleted successfully");
        
    } catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});


// Get User Profile (Protected)
router.get('/users/:id', async (req, res) => {
    const token= req.cookies.token;
    if (!token) return res.status(403).send("Access denied");

    try {
        if (!Number.isInteger(Number.parseInt(req.params.id))) {
            return res.status(400).send("Invalid  ID");
        }
        const decoded = verifyToken(token);
        const user = await findUserById(Number.parseInt(req.params.id));
        if (user && user.email === decoded.email) {
            const photoUrl = buildPhotoUrl(req, user.photo);
            res.status(200).json({ name: user.name, email: user.email, role: user.role, ville: user.ville, photo: photoUrl });
        } else {
            res.status(404).send("invalid credentials"); 
        }
    } catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});

module.exports = router;
