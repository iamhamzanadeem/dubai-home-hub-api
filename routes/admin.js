const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [[{ total_contacts }]] = await db.execute('SELECT COUNT(*) as total_contacts FROM contacts');
    const [[{ total_quotes }]] = await db.execute('SELECT COUNT(*) as total_quotes FROM quotes');
    const [[{ today_contacts }]] = await db.execute(
      'SELECT COUNT(*) as today_contacts FROM contacts WHERE DATE(created_at) = CURDATE()'
    );
    const [[{ today_quotes }]] = await db.execute(
      'SELECT COUNT(*) as today_quotes FROM quotes WHERE DATE(created_at) = CURDATE()'
    );
    res.json({ total_contacts, total_quotes, today_contacts, today_quotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
