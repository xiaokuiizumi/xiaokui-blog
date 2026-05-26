const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../db');
const { generateToken } = require('./auth');

const router = express.Router();

// POST /api/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== user.password_hash) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = generateToken(user.id);
  res.json({ token, username: user.username });
});

// GET /api/me - 验证 token 是否有效
const { authMiddleware } = require('./auth');
router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ username: user.username });
});

module.exports = router;
