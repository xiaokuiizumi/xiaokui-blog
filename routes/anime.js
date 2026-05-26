const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// 图标池
const ICONS = ['🌸','⭐','🎸','🐉','🌻','🚲','☕','🎨','🍛','🌈','🦋','🍀'];

// GET /api/anime - 公开
router.get('/', (req, res) => {
  const db = getDb();
  const list = db.prepare('SELECT * FROM anime ORDER BY created_at DESC').all();
  res.json(list);
});

// POST /api/anime - 需登录
router.post('/', authMiddleware, (req, res) => {
  const { name, origin, comment, status, rating, color, cover } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '请输入番剧名称' });
  }
  const db = getDb();
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  const result = db.prepare(
    'INSERT INTO anime (name, origin, comment, status, rating, color, icon, cover) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    name.trim(),
    (origin || '').trim(),
    (comment || '').trim(),
    status || 'watching',
    rating || 5,
    color || 'e0f2fe,bae6fd',
    icon,
    cover || null
  );
  const item = db.prepare('SELECT * FROM anime WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/anime/:id - 需登录
router.put('/:id', authMiddleware, (req, res) => {
  const { name, origin, comment, status, rating, color, cover } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM anime WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '番剧不存在' });

  db.prepare(
    'UPDATE anime SET name = ?, origin = ?, comment = ?, status = ?, rating = ?, color = ?, cover = ? WHERE id = ?'
  ).run(
    name || existing.name,
    origin !== undefined ? origin : existing.origin,
    comment !== undefined ? comment : existing.comment,
    status || existing.status,
    rating !== undefined ? rating : existing.rating,
    color || existing.color,
    cover !== undefined ? cover : existing.cover,
    req.params.id
  );
  const item = db.prepare('SELECT * FROM anime WHERE id = ?').get(req.params.id);
  res.json(item);
});

// DELETE /api/anime/:id - 需登录
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM anime WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '番剧不存在' });
  db.prepare('DELETE FROM anime WHERE id = ?').run(req.params.id);
  res.json({ message: '已删除' });
});

module.exports = router;
