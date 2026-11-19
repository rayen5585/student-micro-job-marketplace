const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');   // modèle Sequelize : remplace db.query() et le SQL écrit à la main
const crypto = require('crypto');                  // outil intégré à Node pour hacher les mots de passe
const jwt = require('jsonwebtoken');               // outil pour créer et vérifier les jetons JWT
const verifyToken = require('../../middleware/verifyToken'); // middleware qui vérifie le jeton JWT
const { JWT_SECRET } = require('../../config/jwt');          // clé secrète qui signe les jetons

// Crée un jeton JWT pour un étudiant : le "payload" contient son id et son email (JAMAIS le mot de passe)
function createToken(student) {
  return jwt.sign({ id: student.id, email: student.email }, JWT_SECRET, { expiresIn: '1h' }); // expire après 1 heure
}

// Transforme un mot de passe en "sel:hash" (on ne stocke JAMAIS le mot de passe en clair)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');            // texte aléatoire unique
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Vérifie un mot de passe saisi contre le "sel:hash" stocké
function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), test);
}

// Transforme un étudiant Sequelize en objet attendu par le frontend (sans le mot de passe)
function format(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    skills: student.skills,
    portfolio: student.portfolio,
    role: student.role,
    createdAt: student.createdAt
  };
}

// GET - Récupère tous les étudiants          (SQL avant : SELECT * FROM students)
router.get('/students', verifyToken, async (req, res) => {
  const students = await Student.findAll();
  res.json(students.map(format));
});

// GET - Récupère un étudiant par ID           (SQL avant : SELECT * FROM students WHERE id = ?)
router.get('/students/:id', verifyToken, async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Étudiant non trouvé' });
  }
  res.json(format(student));
});

// POST - Crée un nouvel étudiant              (SQL avant : INSERT INTO students ...)
router.post('/students', async (req, res) => {
  const { name, email, skills, portfolio, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name et Email sont requis' });
  }

  try {
    const student = await Student.create({
      name,
      email,
      password: password ? hashPassword(password) : null,
      skills: skills || [],
      portfolio: portfolio || ''
    });
    res.status(201).json(format(student));
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {   // email déjà dans la table
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    throw e;
  }
});

// PUT - Modifie un étudiant (on garde l'ancienne valeur si le champ n'est pas envoyé)   (SQL avant : UPDATE ...)
router.put('/students/:id', verifyToken, async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Étudiant non trouvé' });
  }

  // Le rôle doit être 'client' ou 'freelancer' (si le frontend en envoie un)
  if (req.body.role !== undefined && !['client', 'freelancer'].includes(req.body.role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  await student.update({
    name: req.body.name ?? student.name,
    email: req.body.email ?? student.email,
    skills: req.body.skills ?? student.skills,
    portfolio: req.body.portfolio ?? student.portfolio,
    role: req.body.role ?? student.role
  });
  res.json(format(student));
});

// DELETE - Supprime un étudiant               (SQL avant : DELETE FROM students WHERE id = ?)
router.delete('/students/:id', verifyToken, async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Étudiant non trouvé' });
  }
  const data = format(student);   // on garde une copie avant de supprimer
  await student.destroy();
  res.json(data);
});

// POST - Connexion avec email + mot de passe
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ where: { email } });

  // Même message si l'email n'existe pas ou si le mot de passe est faux (ou compte Google sans mot de passe)
  if (!student || !student.password || !checkPassword(password || '', student.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  res.json({ ...format(student), token: createToken(student) }); // l'étudiant + son jeton JWT
});

// POST - Connexion / inscription avec Google
router.post('/auth/google', async (req, res) => {
  // 1. On demande à Google qui est cet utilisateur, grâce au token reçu
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${req.body.accessToken}` }
  });
  if (!r.ok) return res.status(401).json({ error: 'Token Google invalide' });
  const g = await r.json();                        // g.email, g.name

  // 2. Si l'email n'existe pas encore, on crée l'étudiant (findOrCreate = chercher, sinon créer)
  const [student] = await Student.findOrCreate({
    where: { email: g.email },
    defaults: { name: g.name, skills: [], portfolio: '' }
  });
  res.json({ ...format(student), token: createToken(student) }); // 3. L'étudiant + son jeton JWT
});

module.exports = router;
