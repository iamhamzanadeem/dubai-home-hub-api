const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Public: submit quote request
router.post('/', async (req, res) => {
  const { name, email, phone, location, services, budget, timeline, details } = req.body;
  if (!name || !email || !phone || !location) {
    return res.status(400).json({ error: 'Name, email, phone and location are required' });
  }
  try {
    await db.execute(
      'INSERT INTO quotes (name, email, phone, location, services, budget, timeline, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, location, JSON.stringify(services || []), budget || '', timeline || '', details || '']
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: list all quote requests
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM quotes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: get single quote
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: delete quote
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM quotes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
