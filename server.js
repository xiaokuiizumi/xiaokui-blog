const express = require('express');
const path = require('path');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.use('/api', require('./routes/login'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/anime', require('./routes/anime'));

// SPA 回退：所有非 API 路由返回 index.html（可选）
// 这里让根路径默认显示 blog.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

// 初始化数据库并启动
getDb();
app.listen(PORT, () => {
  console.log(`🌻 小葵的博客已启动！`);
  console.log(`📝 http://localhost:${PORT}`);
  console.log(`🔑 管理员登录：http://localhost:${PORT}/login.html`);
  console.log(`   默认账号: admin  密码: admin123`);
});
