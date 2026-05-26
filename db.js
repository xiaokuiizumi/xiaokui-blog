const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
    seedData();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tag TEXT DEFAULT '',
      mood TEXT DEFAULT '📝',
      date TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS anime (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      origin TEXT DEFAULT '',
      comment TEXT DEFAULT '',
      status TEXT DEFAULT 'watching',
      rating INTEGER DEFAULT 5,
      color TEXT DEFAULT 'e0f2fe,bae6fd',
      icon TEXT DEFAULT '📺',
      cover TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedData() {
  // 创建默认管理员（用户名: admin, 密码: admin123）
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const hash = crypto.createHash('sha256').update('admin123').digest('hex');
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
  }

  // 预设番剧数据
  const animeCount = db.prepare('SELECT COUNT(*) as c FROM anime').get().c;
  if (animeCount === 0) {
    const insert = db.prepare(
      'INSERT INTO anime (name, origin, comment, status, rating, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const defaultAnime = [
      ['幸运星', '2007 · 京都动画', '最喜欢的日常番！此方就是我的灵魂导师～', 'done', 5, 'fce4ec,f8bbd0', '⭐'],
      ['轻音少女', '2009 · 京都动画', '看完想学吉他了！唯酱太可爱了呜呜', 'done', 5, 'e0f2fe,bae6fd', '🎸'],
      ['琉璃龙龙', '2025 · 动画工房', '龙娘日常太治愈了，每周的精神食粮！', 'watching', 5, 'f0fdf4,bbf7d0', '🐉'],
      ['摇曳露营△', '2018 · C-Station', '看了之后开始迷上露营了，抚子太治愈了', 'done', 5, 'fef3c7,fde68a', '🌻'],
      ['放学后海堤日记', '2020 · 动画工房', '钓鱼日常太棒了，好想和她们一起钓鱼！', 'done', 4, 'e0e7ff,c7d2fe', '🚲'],
      ['孤独摇滚！', '2022 · CloverWorks', '波奇酱太真实了，社恐也能闪闪发光！', 'watching', 5, 'fce7f3,fbcfe8', '☕'],
      ['白箱', '2014 · P.A.Works', '做动画的动画，看了更想做创作相关的工作了', 'done', 5, 'dbeafe,bfdbfe', '🎨'],
      ['间谍过家家', '2022 · WIT Studio / CloverWorks', '安妮亚太可爱了，等养肥了再继续看', 'paused', 4, 'fff7ed,fed7aa', '🍛'],
    ];
    const tx = db.transaction(() => {
      for (const a of defaultAnime) insert.run(...a);
    });
    tx();
  }

  // 预设文章数据
  const postCount = db.prepare('SELECT COUNT(*) as c FROM posts').get().c;
  if (postCount === 0) {
    const insert = db.prepare(
      'INSERT INTO posts (title, content, tag, mood, date) VALUES (?, ?, ?, ?, ?)'
    );
    const defaultPosts = [
      {
        title: '用 CSS Grid 实现自适应卡片布局',
        content: 'Grid 是现代 CSS 中最强大的布局工具之一，今天就来聊聊如何用几行代码实现一个漂亮的自适应卡片墙。\n\n首先，定义一个网格容器：\n\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 20px;\n}\n```\n\n这样卡片就会自动填充并自适应宽度了！',
        tag: 'CSS',
        mood: '😊',
        date: '2026-05-20'
      },
      {
        title: '浅谈 JavaScript 中的闭包',
        content: '**闭包** 是 JS 中一个很重要但又容易让人困惑的概念。\n\n> 闭包就是一个函数能够访问其外部函数作用域中的变量，即使外部函数已经执行完毕。\n\n### 例子\n\n```js\nfunction createCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```',
        tag: 'JavaScript',
        mood: '🤔',
        date: '2026-05-15'
      },
      {
        title: 'React 19 新特性速览',
        content: 'React 19 带来了不少令人兴奋的新变化。\n\n## 🚀 Actions\n表单处理变得更加简单。\n\n## ✨ useOptimistic\n轻松实现乐观更新。\n\n## ⚡ 编译器优化\n应用运行得更快，值得了解一下！',
        tag: 'React',
        mood: '🔥',
        date: '2026-04-28'
      },
    ];
    const tx = db.transaction(() => {
      for (const p of defaultPosts) insert.run(p.title, p.content, p.tag, p.mood, p.date);
    });
    tx();
  }
}

module.exports = { getDb };
