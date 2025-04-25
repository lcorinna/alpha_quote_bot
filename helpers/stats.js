const path = require('path');
const fs = require('fs');

const statsPath = path.join(__dirname, '../stats.json');

function loadStats() {
  if (!fs.existsSync(statsPath)) {
    return { triggerCount: 0, chats: {} };
  }
  try {
    const data = fs.readFileSync(statsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения stats.json:', err);
    return { triggerCount: 0, chats: {} };
  }
}

function saveStats(stats) {
  try {
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {
    console.error('Ошибка записи stats.json:', err);
  }
}

function incrementStats(ctx) {
  const stats = loadStats();
  stats.triggerCount += 1;

  const chatId = ctx.chat.id;
  if (!stats.chats[chatId]) {
    let chatName = ctx.chat.title || ctx.chat.username;

    if (!chatName && ctx.chat.type === 'private') {
      chatName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
    }

    if (!chatName) {
      chatName = 'Без названия';
    }

    stats.chats[chatId] = chatName;
  }

  saveStats(stats);
}

module.exports = { loadStats, incrementStats };
