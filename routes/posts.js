const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/posts - 公开，获取所有文章
router.get('/', (req, res) => {
  const db = getDb();
  const posts = db.prepare('SELECT * FROM posts ORDER BY date DESC, id DESC').all();
  res.json(posts);
});

// POST /api/posts - 需登录，创建文章
router.post('/', authMiddleware, (req, res) => {
  const { title, content, tag, mood, date } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: '请输入文章标题' });
  }
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO posts (title, content, tag, mood, date) VALUES (?, ?, ?, ?, ?)'
  ).run(
    title.trim(),
    (content || '').trim(),
    (tag || '').trim(),
    mood || '📝',
    date || new Date().toISOString().split('T')[0]
  );
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

// PUT /api/posts/:id - 需登录，更新文章
router.put('/:id', authMiddleware, (req, res) => {
  const { title, content, tag, mood, date } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '文章不存在' });

  db.prepare(
    'UPDATE posts SET title = ?, content = ?, tag = ?, mood = ?, date = ? WHERE id = ?'
  ).run(
    title || existing.title,
    content !== undefined ? content : existing.content,
    tag !== undefined ? tag : existing.tag,
    mood || existing.mood,
    date || existing.date,
    req.params.id
  );
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  res.json(post);
});

// DELETE /api/posts/:id - 需登录，删除文章
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '文章不存在' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: '已删除' });
});

module.exports = router;
